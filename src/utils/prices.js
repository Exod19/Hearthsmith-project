// =============================================================
//  prices.js — Comparaison de prix avec l'API épiceries.ca
// -------------------------------------------------------------
//  API publique, lecture seule, CORS ouvert :
//  https://epiceries.ca/developers
//  Les produits sont presque toujours propres à une enseigne :
//  on cherche donc le meilleur équivalent dans chaque magasin,
//  puis on calcule le coût selon le nombre d'emballages requis.
// =============================================================

import { normalize } from './ingredients.js';

const API = 'https://epiceries.ca/api';

export const STORES = [
  { id: 'metro', label: 'Metro', site: 'https://www.metro.ca/epicerie-en-ligne' },
  { id: 'maxi', label: 'Maxi', site: 'https://www.maxi.ca' },
  { id: 'superc', label: 'Super C', site: 'https://www.superc.ca' },
  { id: 'iga', label: 'IGA', site: 'https://www.iga.net' },
  { id: 'provigo', label: 'Provigo', site: 'https://www.provigo.ca' },
  { id: 'walmart', label: 'Walmart', site: 'https://www.walmart.ca/fr' },
];
export const storeLabel = (id) => STORES.find((s) => s.id === id)?.label || id;

// ---------------------------------------------------------------
//  Appels réseau : file d'attente polie + cache local
// ---------------------------------------------------------------

const CACHE_KEY = 'hearthsmith-price-cache';
const TTL = { search: 3 * 864e5, history: 3 * 864e5, product: 864e5 };
let memoryCache = null;

function cache() {
  if (!memoryCache) {
    try {
      memoryCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    } catch {
      memoryCache = {};
    }
  }
  return memoryCache;
}

let saveTimer;
function persistCache() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const c = cache();
    const now = Date.now();
    for (const [k, v] of Object.entries(c)) if (now - v.t > 7 * 864e5) delete c[k];
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(c));
    } catch {
      // Stockage plein : on garde seulement le cache en mémoire.
    }
  }, 500);
}

export function clearPriceCache() {
  memoryCache = {};
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* rien à effacer */
  }
}

// Le service demande de rester sous quelques requêtes par seconde.
const MIN_GAP_MS = 280;
let chain = Promise.resolve();
let last = 0;

function throttled(fn) {
  const run = chain.then(async () => {
    const wait = last + MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    last = Date.now();
    return fn();
  });
  chain = run.catch(() => {});
  return run;
}

async function apiGet(params, kind) {
  const key = `${kind}:${new URLSearchParams(params).toString()}`;
  const hit = cache()[key];
  if (hit && Date.now() - hit.t < TTL[kind]) return hit.d;

  const data = await throttled(async () => {
    const res = await fetch(`${API}?${new URLSearchParams(params)}`);
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) throw new Error(json?.error?.message || `épiceries.ca a répondu ${res.status}`);
    return json.data;
  });
  const slim =
    kind === 'search'
      ? data.results.map(slimProduct)
      : kind === 'product'
        ? { ...slimProduct(data), prices: (data.prices || []).map((p) => ({ ...slimProduct({ ...data, ...p }), updated: p.date })) }
        : slimHistory(data.history);
  cache()[key] = { t: Date.now(), d: slim };
  persistCache();
  return slim;
}

const slimProduct = (r) => ({
  id: r.id,
  name: r.name,
  brand: r.brand,
  size: r.size,
  price: r.price,
  unit: r.unitPrice?.raw || '',
  discounted: r.discounted,
  category: r.category,
  image: r.image,
  link: r.link,
  store: r.store,
  updated: r.updated,
});

const slimHistory = (history = []) => history.map((h) => ({ s: h.store, p: h.price, d: h.discounted, t: h.timestamp }));

export const searchStore = (q, store, category) =>
  apiGet(category ? { endpoint: 'search', q, store, category, limit: 100 } : { endpoint: 'search', q, store, limit: 100 }, 'search');
export const fetchProduct = (id) => apiGet({ endpoint: 'product', id }, 'product');
export const fetchHistory = (id, store) => apiGet({ endpoint: 'history', id, store, limit: 120 }, 'history');

// ---------------------------------------------------------------
//  Choix du produit le plus pertinent pour un ingrédient
// ---------------------------------------------------------------

// Catégories épiceries.ca attendues pour chaque rayon (les plus probables d'abord).
const PREFERRED = {
  'Fruits et légumes': [2, 1, 4, 5],
  'Viandes et poissons': [16, 17, 22, 20, 18, 19, 21, 23],
  'Produits laitiers et oeufs': [9, 7, 11, 12, 8, 10, 14, 15],
  'Boulangerie et céréales': [26, 25, 44, 28, 27, 45, 46, 49, 51],
  'Garde-manger': [33, 35, 34, 32, 6, 25, 26, 27, 29, 30, 62],
  Surgelés: [53, 54, 24, 57, 60, 61],
};
// Animaux, hygiène, alcool, friandises, desserts, mets surgelés…
const UNWANTED = new Set([13, 39, 40, 41, 43, 47, 50, 52, 56, 57, 61, 63, 64, 65, 66, 67, 68, 69, 70]);
// Mots qui signalent un produit transformé plutôt que l'ingrédient brut.
const PROCESSED = [
  'gateau', 'muffin', 'biscuit', 'craquelin', 'croustille', 'chips', 'barre', 'pouding', 'tarte', 'pizza', 'quiche',
  'lasagne', 'sandwich', 'wrap', 'croquette', 'pane', 'marine', 'assaisonne', 'farci', 'brochette', 'ragout', 'soupe',
  'sauce', 'trempette', 'vinaigrette', 'jus', 'boisson', 'melange', 'plateau', 'nourriture', 'chat', 'chien', 'bebe',
  'puree', 'saveur', 'aromatise', 'enrobe', 'frit', 'croustillant', 'nugget', 'burger', 'pate a', 'mijote', 'repas',
  'surgele', 'congele', 'bonbon', 'chocolat', 'creme glacee', 'cuit', 'fume', 'tranche', 'tartinade', 'hummus',
  'salami', 'margarine', 'yogourt', 'olive farcie', 'roti', 'gruau', 'confiture', 'vege', 'moutarde', 'cremeu',
  'emiette', 'thon', 'ciboulette', 'chili', 'tasse', 'instantane', 'mayonnaise', 'the glace', 'caille', 'cannelle', 'erable',
];
// Mots de format ou de qualité qui peuvent précéder le nom du produit.
const DESCRIPTORS = new Set(['sac', 'jeune', 'feuille', 'grain', 'mini', 'gro', 'petit', 'biologique', 'bio', 'frai', 'fraiche', 'extra', 'panier', 'botte', 'barquette', 'format', 'club', 'paquet', 'boite', 'pot', 'bouteille', 'local', 'quebec', 'selection', 'irresistible', 'compliment', 'choix', 'president', 'naturellement', 'imparfait']);
const FILLER = new Set(['de', 'des', 'du', 'la', 'le', 'les', 'et', 'en', 'au', 'aux', 'a', 'un', 'une', 'd', 'l', 'sans', 'avec']);

// Formes équivalentes ramenées à une seule, des deux côtés (recette et produit) :
// « boisson d'amande » = « lait d'amande », « pommes de terre » = « patates »…
const CANON = [
  [/\bboissons? (?:d'|de |aux? )?(amande|soya|soja|avoine|riz|coco|cajou)s?\b/g, 'lait $1'],
  [/\blait d'(amande|avoine)s?\b/g, 'lait $1'],
  [/\blait de (soya|soja|riz|coco)\b/g, 'lait $1'],
  [/\bsoja\b/g, 'soya'],
  [/\byaourts?\b/g, 'yogourt'],
  [/\bpommes? de terre\b/g, 'patate'],
  [/\bzucchinis?\b/g, 'courgette'],
  [/\boignons? verts?\b/g, 'echalote'],
  [/\b(fruits des champs|melange de petits fruits|baies)\b/g, 'petits fruits'],
  [/\b(flocons? d'avoine|gruau)\b/g, 'avoine'],
  [/\bfromage pizza\b/g, 'fromage'],
  [/\b(spaghettinis?|spaghettis?|pennes?|fusillis?|rotinis?|macaronis?|linguines?|fettuccines?|farfalles?)\b/g, 'pates $1'],
];

export const canon = (text) => CANON.reduce((t, [re, to]) => t.replace(re, to), normalize(text).replace(/[’`]/g, "'"));

const tokens = (text) =>
  canon(text)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !FILLER.has(w))
    .map((w) => (w.length > 3 ? w.replace(/(s|x)$/, '') : w));

// Autres façons dont les épiceries nomment un produit (recherches supplémentaires).
const EXPANSIONS = [
  [/lait d'amande/, ["boisson d'amande", 'boisson aux amandes']],
  [/lait de so[yj]a/, ['boisson de soya', 'boisson soya']],
  [/lait d'avoine/, ["boisson d'avoine"]],
  [/fromage rape/, ['râpé', 'mozzarella râpé', 'fromage pizza']],
  [/pommes? de terre|patate/, ['pommes de terre', 'patates']],
  [/oignons? verts?/, ['échalote', 'oignons verts']],
  [/courgette/, ['zucchini']],
  [/petits fruits/, ['fruits des champs', 'petits fruits', 'bleuets']],
  [/flocons d'avoine|gruau/, ["flocons d'avoine", 'avoine']],
  [/^pates/, ['spaghetti', 'penne', 'fusilli']],
  [/sauce so[yj]a/, ['sauce soya', 'sauce soja']],
  [/yaourt/, ['yogourt']],
  [/fecule de mais/, ['fécule de maïs']],
];
const COMMON_WORDS = new Set(['sans', 'avec', 'frais', 'fraiche', 'gros', 'petit', 'petits', 'rouge', 'vert', 'verte', 'blanc', 'blanche', 'noir', 'jaune', 'maigre', 'extra']);

/**
 * Requêtes à essayer, de la plus précise à la plus large. La recherche de l'API
 * est une sous-chaîne sensible aux accents et aux apostrophes : on garde le
 * texte d'origine, ses synonymes, le mot principal au singulier, puis les
 * précisions distinctives (« sans lactose », « grelots »).
 */
export function queriesFor(name) {
  const clean = String(name).replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
  const norm = normalize(clean);
  const words = clean.split(/[\s']/).filter((w) => w.length > 2 && !FILLER.has(normalize(w)));
  const head = words[0] || clean;
  const singular = head.length > 4 ? head.replace(/(s|x)$/i, '') : head;
  const expansions = EXPANSIONS.filter(([re]) => re.test(norm)).flatMap(([, list]) => list);
  const without = clean.match(/\bsans [a-zéèêàâîôûç]+/g) || [];
  const others = words.slice(1).filter((w) => w.length >= 5 && !COMMON_WORDS.has(normalize(w)));
  // Les sites écrivent l'apostrophe droite (') ou typographique (’) : on essaie les deux.
  const curly = clean.includes("'") ? [clean.replace(/'/g, '’')] : [];
  return [...new Set([clean, ...curly, ...expansions, singular, ...without, ...others])].filter((q) => q.length >= 2);
}

export function scoreProduct(product, query, category) {
  const q = tokens(query);
  const n = tokens(product.name);
  if (!q.length) return -Infinity;
  const name = canon(product.name);

  const covered = q.filter((t) => n.some((w) => w.startsWith(t) || t.startsWith(w)));
  if (covered.length < Math.ceil(q.length * 0.67)) return -Infinity;

  let score = covered.length * 3;
  // « Maquereau à l'huile d'olive » n'est pas de l'huile d'olive : le premier mot compte.
  const first = n.find((w) => !DESCRIPTORS.has(w));
  if (first && q.some((t) => first.startsWith(t) || t.startsWith(first))) score += 2;
  else score -= 2.5;
  score -= Math.max(0, n.length - q.length) * 0.5;

  const queryText = canon(query);
  for (const word of PROCESSED) if (name.includes(word) && !queryText.includes(word)) score -= 2.5;
  if (UNWANTED.has(product.category) && !(category === 'Surgelés' && [57, 61].includes(product.category))) score -= 6;
  if (PREFERRED[category]) score += PREFERRED[category].includes(product.category) ? 2 : -2;
  if (product.price == null) score -= 10;

  const ageDays = (Date.now() - Date.parse(product.updated || 0)) / 864e5;
  if (ageDays > 21) score -= 4;
  return score;
}

/** Produits pertinents classés par score (les meilleurs d'abord). */
export function rankProducts(results, query, category) {
  return results
    .map((product) => ({ product, score: scoreProduct(product, query, category) }))
    .filter((r) => r.score > 0 && r.score >= tokens(query).length * 3 - 1)
    .sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------
//  Quantités : combien d'emballages acheter ?
// ---------------------------------------------------------------

const TO_BASE = {
  g: [1, 'g'],
  kg: [1000, 'g'],
  lb: [453.6, 'g'],
  oz: [28.35, 'g'],
  ml: [1, 'ml'],
  l: [1000, 'ml'],
  tasse: [250, 'ml'],
  'c. à soupe': [15, 'ml'],
  'c. à thé': [5, 'ml'],
};

/** « 1.25kg », « 5lb », « 398ml », « 12 un » → { amount, base } */
export function parseSize(size) {
  if (!size) return null;
  const s = normalize(size).replace(',', '.');
  const multi = s.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|g|ml|l|lb|oz)\b/);
  if (multi) {
    const [factor, base] = TO_BASE[multi[3]];
    return { amount: Number(multi[1]) * Number(multi[2]) * factor, base };
  }
  const m = s.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l|lb|oz)\b/);
  if (m) {
    const [factor, base] = TO_BASE[m[2]];
    return { amount: Number(m[1]) * factor, base };
  }
  const bunch = s.match(/^(\d+)?\s*(botte|bouquet)s?\b/);
  if (bunch) return { amount: Number(bunch[1] || 1), base: 'botte' };
  // « 12un », « 6 oeufs », « 5poitrines », « 2perbarquette » : un nombre de pièces.
  const count = s.match(/^(\d+)\s*(douzaines?|[a-z]+)?$/);
  if (count) return { amount: Number(count[1]) * (count[2]?.startsWith('douzaine') ? 12 : 1), base: 'un' };
  return null;
}

// Poids moyen d'une unité (g), pour passer de « 2 carottes » à un sac de 1,36 kg.
const UNIT_WEIGHT = [
  ['chou-fleur', 800], ['chou', 1000], ['brocoli', 450], ['laitue', 450], ['celeri', 450], ['aubergine', 400],
  ['patate douce', 300], ['concombre', 300], ['mangue', 300], ['courgette', 250], ['patate', 200], ['avocat', 200],
  ['poitrine', 200], ['pomme', 180], ['poire', 180], ['orange', 180], ['poivron', 170], ['oignon', 150],
  ['filet', 150], ['saumon', 150], ['cuisse', 150], ['tomate', 130], ['banane', 120], ['citron', 110],
  ['carotte', 75], ['lime', 70], ['oeuf', 55], ['ail', 50], ['echalote', 30], ['champignon', 20],
];
// Poids d'une tasse (g) pour les ingrédients secs ; sinon 250 ml.
const CUP_WEIGHT = [
  ['epinard', 30], ['laitue', 50], ['champignon', 70], ['avoine', 90], ['brocoli', 90], ['fromage', 100], ['pates', 100],
  ['chou-fleur', 100], ['haricots verts', 110], ['noix', 120], ['farine', 130], ['carotte', 130], ['amande', 140],
  ['petits fruits', 150], ['bleuet', 150], ['fraise', 150], ['framboise', 150], ['oignon', 160], ['mais', 165],
  ['pois chiche', 165], ['quinoa', 170], ['tomate', 180], ['riz', 190], ['lentille', 190], ['sucre', 200], ['cassonade', 220],
];
// Unités de recette qui désignent une pièce d'un poids connu.
// Nombre de pièces dans une botte (fines herbes : une botte suffit).
const PER_BUNCH = [['echalote', 7], ['radis', 12], ['carotte', 8], ['betterave', 4]];
const PIECE_WEIGHT = { gousse: 5, branche: 50, filet: 150, tranche: 30, 'pincée': 0.5 };

const lookup = (table, name) => {
  const n = canon(name);
  return table.find(([k]) => n.includes(k))?.[1] ?? null;
};

/** Besoin de la recette ramené en g, ml ou unités (avec équivalent en g si connu). */
function neededBase(item) {
  if (!item.quantity) return null;
  const q = item.quantity;
  const each = lookup(UNIT_WEIGHT, item.name);
  if (!item.unit || item.unit === 'boîte' || item.unit === 'paquet') return { amount: q, base: 'un', grams: each ? q * each : null };
  if (PIECE_WEIGHT[item.unit]) return { amount: q * PIECE_WEIGHT[item.unit], base: 'g', pieces: q };
  if (item.unit === 'tasse') {
    const cup = lookup(CUP_WEIGHT, item.name);
    return cup ? { amount: q * cup, base: 'g' } : { amount: q * 250, base: 'ml' };
  }
  const conv = TO_BASE[item.unit];
  return conv ? { amount: q * conv[0], base: conv[1] } : null;
}

/** « 0.76/100g », « 4.39/kg », « 1.99/lb », « 0.50/un » → prix par g, ml ou unité. */
export function parseUnitPrice(raw) {
  const m = normalize(raw || '').replace(',', '.').match(/([\d.]+)\s*\/\s*([\d.]*)\s*(kg|g|ml|l|lb|un|unite|ea)\b/);
  if (!m) return null;
  const qty = Number(m[2]) || 1;
  if (['un', 'unite', 'ea'].includes(m[3])) return { price: Number(m[1]) / qty, base: 'un' };
  const [factor, base] = TO_BASE[m[3]];
  return { price: Number(m[1]) / (qty * factor), base };
}

const fmtAmount = (amount, base) => {
  if (base === 'un') return `${Math.round(amount * 10) / 10} unité${amount > 1 ? 's' : ''}`;
  if (amount >= 1000) return `${String(Math.round(amount / 100) / 10).replace('.', ',')} ${base === 'g' ? 'kg' : 'L'}`;
  return `${Math.round(amount)} ${base}`;
};

/**
 * Combien acheter pour couvrir la recette, et comment on l'a déterminé.
 * Retourne { packs, estimated, byWeight?, cost?, need, cover }.
 */
export function packagesFor(item, product) {
  const need = neededBase(item);
  const size = parseSize(product?.size) || parseSize(product?.name?.match(/\b\d+\s*(un|unites)\b/i)?.[0]);
  const needLabel = need ? fmtAmount(need.amount, need.base) : null;

  if (need && size?.base === 'botte') {
    const per = lookup(PER_BUNCH, item.name);
    const packs = per && need.base === 'un' ? Math.max(1, Math.ceil(need.amount / per)) : 1;
    return { packs, estimated: !per, need: needLabel, cover: `${packs} × ${product.size}${per ? ` (≈ ${per} par botte)` : ''}` };
  }

  if (need && size?.amount) {
    let needAmount = null;
    let estimated = false;
    if (need.base === size.base) needAmount = need.amount;
    else if (need.base !== 'un' && size.base !== 'un') {
      needAmount = need.amount; // g ↔ ml : densité ≈ 1
      estimated = true;
    } else if (need.base === 'un' && need.grams) {
      needAmount = need.grams; // 2 carottes ≈ 150 g
      estimated = true;
    } else if (size.base === 'un') {
      const each = lookup(UNIT_WEIGHT, item.name);
      if (each) {
        needAmount = need.amount / each; // 700 g de poulet ≈ 3,5 poitrines
        estimated = true;
      }
    }
    if (needAmount != null) {
      const packs = Math.min(20, Math.max(1, Math.ceil(needAmount / size.amount - 0.1)));
      return { packs, estimated, need: needLabel, cover: `${packs} × ${product.size} = ${fmtAmount(packs * size.amount, size.base)}` };
    }
  }

  // Produit vendu au poids (sans format) : on paie la quantité exacte au prix unitaire.
  const unit = parseUnitPrice(product?.unit);
  if (need && unit && !size) {
    let amount = null;
    if (unit.base === need.base || (unit.base !== 'un' && need.base !== 'un')) amount = need.amount;
    else if (unit.base !== 'un') amount = need.grams;
    if (amount) return { packs: 1, byWeight: true, estimated: unit.base !== need.base, cost: amount * unit.price, need: needLabel, cover: `≈ ${fmtAmount(amount, unit.base === 'un' ? 'un' : unit.base)} au prix unitaire` };
  }
  return { packs: 1, estimated: true, need: needLabel, cover: product?.size ? `1 × ${product.size} (quantité à vérifier)` : 'format inconnu : quantité à vérifier' };
}

// ---------------------------------------------------------------
//  Historique : spéciaux et conseils
// ---------------------------------------------------------------

const median = (values) => {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export function priceInsight(history, store, product) {
  const now = Date.now() / 1000;
  const points = (history || []).filter((h) => h.s === store && h.p != null && now - h.t < 365 * 86400).sort((a, b) => a.t - b.t);
  if (points.length < 6) return null;
  // Le dernier relevé est le prix actuel : on compare aux semaines précédentes.
  const past = points.slice(0, -1);
  const recent = past.filter((h) => now - h.t < 182 * 86400).map((h) => h.p);
  const med = median(recent.length >= 3 ? recent : past.map((h) => h.p));
  const pastMin = Math.min(...past.map((h) => h.p));
  const deals = past.filter((h) => h.d);
  const dealShare = deals.length / past.length;
  const dealPrice = deals.length ? median(deals.map((h) => h.p)) : null;
  const price = product.price;

  if (price < pastMin * 0.98 && price < med * 0.9) return { tone: 'great', text: `Prix le plus bas de l’année (habituellement ${money(med)}) : bon moment pour faire des réserves.` };
  if (product.discounted && price < med * 0.95) return { tone: 'good', text: `En spécial : habituellement ${money(med)}.` };
  if (price > med * 1.1) {
    const every = Math.max(2, Math.round(1 / dealShare));
    const wait =
      dealShare >= 0.15 && dealPrice && dealPrice < price * 0.92
        ? ` Il est en spécial environ 1 semaine sur ${every} (vers ${money(dealPrice)}) : si ça peut attendre, achetez-le au prochain spécial.`
        : ' Comparez avec un autre format ou une autre marque.';
    return { tone: 'warn', text: `Plus cher que d’habitude (prix habituel ${money(med)}).${wait}` };
  }
  return null;
}

/** Vérifie une seule fois si épiceries.ca a des prix récents pour ce magasin. */
const storeStatus = {};
export function storeHasData(store) {
  storeStatus[store] ??= searchStore('lait', store)
    .then((r) => r.some((p) => Date.now() - Date.parse(p.updated || 0) < 21 * 864e5))
    .catch(() => true);
  return storeStatus[store];
}

// ---------------------------------------------------------------
//  Calcul global
// ---------------------------------------------------------------

/**
 * Meilleure offre d'un magasin pour un article : parmi les produits les plus
 * pertinents, celui qui coûte le moins cher pour la quantité requise.
 */
export function pickOffer(results, item) {
  const ranked = rankProducts(results, item.name, item.category);
  if (!ranked.length) return null;
  const top = ranked[0].score;
  const offers = ranked
    .filter((r) => r.score >= top - 1.5)
    .map(({ product }) => offerFor(item, product));
  // On préfère les produits dont on sait couvrir la quantité ; les autres faute de mieux.
  const known = offers.filter((o) => !o.uncertain);
  const pool = known.length ? known : offers;
  return pool.reduce((a, b) => (b.cost < a.cost ? b : a));
}

export function offerFor(item, product, packsOverride) {
  const q = packagesFor(item, product);
  const n = packsOverride || q.packs;
  const cost = q.byWeight && !packsOverride ? q.cost : n * product.price;
  return {
    product,
    packs: n,
    cost: Math.round(cost * 100) / 100,
    estimated: q.estimated && !packsOverride,
    byWeight: q.byWeight && !packsOverride,
    need: q.need,
    cover: packsOverride ? `${n} × ${product.size || 'format inconnu'} (choisi à la main)` : q.cover,
    uncertain: q.cover?.includes('à vérifier'),
  };
}

/** Prix actuel, dans ce magasin, d'un produit choisi à la main. */
export async function refreshPick(item, store, pick, packsOverride) {
  const data = await fetchProduct(pick.id);
  const current = data.prices.find((p) => p.store === store) || (data.store === store ? data : null);
  return current ? offerFor(item, { ...pick, ...current, id: pick.id, name: pick.name }, packsOverride) : null;
}

/**
 * Cherche l'article dans un magasin : on essaie les requêtes une à une et on
 * s'arrête dès qu'un produit couvre tous les mots de l'ingrédient.
 */
export async function findOffer(item, store) {
  const queries = queriesFor(item.name);
  const full = tokens(item.name).length * 3 + 2;
  let results = [];
  const merge = (more) => {
    const seen = new Set(results.map((r) => r.id));
    results = [...results, ...more.filter((r) => !seen.has(r.id))];
  };
  const good = () => (rankProducts(results, item.name, item.category)[0]?.score ?? -Infinity) >= full - 0.5;

  for (const q of queries.slice(0, 6)) {
    merge(await searchStore(q, store));
    if (good()) break;
  }
  // Mot courant (« citron ») : la recherche simple est tronquée, on cible le rayon.
  for (const category of (PREFERRED[item.category] || []).slice(0, 2)) {
    if (pickOffer(results, item)) break;
    merge(await searchStore(queries.find((q) => !q.includes(' ')) || queries[0], store, category));
  }
  return { offer: pickOffer(results, item), results };
}

export const money = (n) => (n == null ? '—' : n.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }));

/**
 * rows : [{ item, key, offers: { [store]: { product, packs, cost, estimated } | null } }]
 * Retourne le meilleur choix par article et les totaux par stratégie.
 */
export function summarize(rows, stores) {
  const plan = {};
  let optimal = 0;
  let pricedCount = 0;
  const perStore = Object.fromEntries(stores.map((s) => [s, { total: 0, count: 0, missing: 0, savings: 0, comparable: 0 }]));
  const split = Object.fromEntries(stores.map((s) => [s, { total: 0, items: [] }]));

  for (const row of rows) {
    const offers = stores.map((s) => [s, row.offers[s]]).filter(([, o]) => o);
    if (!offers.length) continue;
    const [bestStore, best] = offers.reduce((a, b) => (b[1].cost < a[1].cost ? b : a));
    plan[row.key] = bestStore;
    optimal += best.cost;
    pricedCount += 1;
    split[bestStore].total += best.cost;
    split[bestStore].items.push(row);
    for (const s of stores) {
      const o = row.offers[s];
      if (o) {
        perStore[s].total += o.cost;
        perStore[s].count += 1;
        perStore[s].savings += o.cost - best.cost;
        perStore[s].comparable += 1;
      } else perStore[s].missing += 1;
    }
  }
  return { plan, optimal, pricedCount, perStore, split };
}
