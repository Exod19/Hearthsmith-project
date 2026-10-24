// =============================================================
//  imageGen.js — Photo de recette générée dans le style de la marque
// -------------------------------------------------------------
//  Deux fournisseurs appelés depuis le navigateur :
//  - OpenAI (gpt-image-1 ou dall-e-3), clé requise, meilleure qualité ;
//  - Pollinations, gratuit sans clé (filigrane, 1 image / 45 s).
//  Le style suit le guide V2 : photo culinaire éditoriale, lumière
//  naturelle, bois, lin, céramique, ambiance d'automne nordique.
// =============================================================

import { parseIngredient } from './ingredients.js';

const KEY = (k) => `hearthsmith_img_${k}`;
const read = (k, fallback = '') => {
  try {
    return localStorage.getItem(KEY(k)) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(KEY(k), v);
  } catch {
    /* stockage indisponible */
  }
};

export const IMAGE_PROVIDERS = {
  off: { label: 'Désactivé' },
  openai: { label: 'OpenAI : meilleure qualité, environ 0,04 $ par image', models: ['gpt-image-1', 'dall-e-3'] },
  pollinations: { label: 'Pollinations : gratuit, avec filigrane, 1 image toutes les 45 s' },
};

function assistantOpenAIKey() {
  try {
    return localStorage.getItem('hearthsmith_ai_provider') === 'openai' ? localStorage.getItem('hearthsmith_ai_api_key') || '' : '';
  } catch {
    return '';
  }
}

export function getImageSettings() {
  return {
    provider: read('provider', 'off'),
    model: read('model', 'gpt-image-1'),
    // Clé propre aux images ; à défaut, la clé OpenAI de l'assistant.
    apiKey: read('api_key') || assistantOpenAIKey(),
    auto: read('auto', 'true') === 'true',
  };
}

export function saveImageSetting(key, value) {
  write(key, value);
}

/** Consigne de style commune à toutes les photos (sans texte dans l'image). */
export function imagePrompt(meal) {
  const main = (meal.ingredients || [])
    .map((l) => parseIngredient(l))
    .filter((p) => p && !p.staple)
    .slice(0, 5)
    .map((p) => p.name)
    .join(', ');
  return [
    `Editorial food photograph of the dish "${meal.name}"${main ? ` (main ingredients: ${main})` : ''}.`,
    'Served in matte handmade stoneware on a brushed oak table with a natural linen napkin and a few fresh herbs.',
    'Soft natural side light from a window, warm autumn Nordic cottage atmosphere,',
    'muted earthy palette of walnut brown, forest green, sage, terracotta and cream.',
    'Realistic, appetizing, believable ingredients, shallow depth of field, 3/4 overhead angle, generous framing.',
    'No text, no letters, no logos, no hands, no people.',
  ].join(' ');
}

// Réduit l'image (Blob) en JPEG pour le stockage du navigateur, comme les photos importées.
async function blobToDataUrl(blob, maxSize = 900, quality = 0.82) {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL('image/jpeg', quality);
}

const b64ToBlob = (b64) => {
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: 'image/png' });
};

async function viaOpenAI(prompt, { apiKey, model }) {
  if (!apiKey) throw new Error('Ajoutez une clé OpenAI dans Réglages pour générer des images.');
  const body =
    model === 'dall-e-3'
      ? { model, prompt, size: '1792x1024', quality: 'standard', response_format: 'b64_json', n: 1 }
      : { model: 'gpt-image-1', prompt, size: '1536x1024', quality: 'medium', n: 1 };
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || `Erreur ${res.status}`;
    throw new Error(/verif/i.test(msg) ? 'OpenAI demande de vérifier votre organisation pour gpt-image-1. Choisissez dall-e-3 dans Réglages ou vérifiez votre compte.' : msg);
  }
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI n’a pas renvoyé d’image.');
  return b64ToBlob(b64);
}

let lastPollinations = 0;
async function viaPollinations(prompt) {
  // Palier gratuit : une image toutes les 45 secondes par adresse IP.
  const wait = lastPollinations + 46_000 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastPollinations = Date.now();
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&nologo=true&seed=${Math.floor(Math.random() * 1e6)}`;
  const res = await fetch(url);
  if (res.status === 402 || res.status === 429) {
    lastPollinations = Date.now();
    await new Promise((r) => setTimeout(r, 46_000));
    return viaPollinations(prompt);
  }
  if (!res.ok) throw new Error(`Pollinations a répondu ${res.status}.`);
  return res.blob();
}

/** Génère la photo d'une recette et la renvoie prête à stocker (data URL JPEG). */
export async function generateMealImage(meal, settings = getImageSettings()) {
  const prompt = imagePrompt(meal);
  const blob = settings.provider === 'openai' ? await viaOpenAI(prompt, settings) : await viaPollinations(prompt);
  return blobToDataUrl(blob);
}
