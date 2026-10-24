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
  'emiette', 'thon', 'ciboulette', 'chili', 'tasse', 'instantane', 'mayonnaise', 'the glace', 'caille', 'pomme de terre', 'pommes de terre',
];
// Mots de format ou de qualité qui peuvent précéder le nom du produit.
const DESCRIPTORS = new Set(['sac', 'jeune', 'feuille', 'grain', 'mini', 'gro', 'petit', 'biologique', 'bio', 'frai', 'fraiche', 'extra', 'panier', 'botte', 'barquette', 'format', 'club', 'paquet', 'boite', 'pot', 'bouteille', 'local', 'quebec', 'selection', 'irresistible', 'compliment', 'choix', 'president', 'naturellement', 'imparfait']);
const FILLER = new Set(['de', 'des', 'du', 'la', 'le', 'les', 'et', 'en', 'au', 'aux', 'a', 'un', 'une', 'd', 'l', 'sans', 'avec']);

const tokens = (text) =>
  normalize(text)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !FILLER.has(w))
    .map((w) => (w.length > 3 ? w.replace(/(s|x)$/, '') : w));

/**
 * Requêtes à essayer pour un ingrédient. La recherche de l'API est une
 * sous-chaîne sensible aux accents et aux apostrophes : on garde donc le texte
 * d'origine, puis le mot principal au singulier (« poivrons » → « poivron »).
 */
export function queriesFor(name) {
  const clean = String(name).replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim();
  const head = clean.split(/[\s']/).find((w) => w.length > 2 && !FILLER.has(normalize(w))) || clean;
  const singular = head.length > 4 ? head.replace(/(s|x)$/i, '') : head;
  return [...new Set([clean.toLowerCase(), singular.toLowerCase()])].filter((q) => q.length >= 2);
}

export function scoreProduct(product, query, category) {
  const q = tokens(query);
  const n = tokens(product.name);
  if (!q.length) return -Infinity;
  const name = normalize(product.name);

  const covered = q.filter((t) => n.some((w) => w.startsWith(t) || t.startsWith(w)));
  if (covered.length < Math.ceil(q.length * 0.67)) return -Infinity;

  let score = covered.length * 3;
  // « Maquereau à l'huile d'olive » n'est pas de l'huile d'olive : le premier mot compte.
  const first = n.find((w) => !DESCRIPTORS.has(w));
  if (first && q.some((t) => first.startsWith(t) || t.startsWith(first))) score += 2;
  else score -= 2.5;
  score -= Math.max(0, n.length - q.length) * 0.5;

  const queryText = normalize(query);
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
  const count = s.match(/^(\d+)\s*(un|unite|unites|pk|paquet|douzaine)?$/);
  if (count) return { amount: Number(count[1]) * (count[2] === 'douzaine' ? 12 : 1), base: 'un' };
  return null;
}

function neededBase(item) {
  if (!item.quantity) return null;
  if (!item.unit) return { amount: item.quantity, base: 'un' };
  const conv = TO_BASE[item.unit];
  return conv ? { amount: item.quantity * conv[0], base: conv[1] } : null;
}

/** Nombre d'emballages pour couvrir le besoin (1 si on ne peut pas comparer). */
export function packagesFor(item, product) {
  const need = neededBase(item);
  const size = parseSize(product?.size) || (need?.base === 'un' ? parseSize(product?.name?.match(/\b\d+\s*(un|unites)\b/i)?.[0]) : null);
  if (!need || !size || !size.amount) return { packs: 1, estimated: true };
  // On tolère g ↔ ml (densité ≈ 1) : approximation suffisante pour l'épicerie.
  const compatible = need.base === size.base || (need.base !== 'un' && size.base !== 'un');
  if (!compatible) return { packs: 1, estimated: true };
  const ratio = need.amount / size.amount;
  return { packs: Math.min(12, Math.max(1, Math.ceil(ratio - 0.1))), estimated: need.base !== size.base };
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
  // Un produit sans format connu (souvent vendu au poids) n'est retenu que faute de mieux.
  const sized = offers.filter((o) => parseSize(o.product.size));
  const pool = sized.length ? sized : offers;
  return pool.reduce((a, b) => (b.cost < a.cost ? b : a));
}

export function offerFor(item, product, packsOverride) {
  const { packs, estimated } = packagesFor(item, product);
  const n = packsOverride || packs;
  return { product, packs: n, cost: Math.round(n * product.price * 100) / 100, estimated: estimated && !packsOverride };
}

/** Prix actuel, dans ce magasin, d'un produit choisi à la main. */
export async function refreshPick(item, store, pick, packsOverride) {
  const data = await fetchProduct(pick.id);
  const current = data.prices.find((p) => p.store === store) || (data.store === store ? data : null);
  return current ? offerFor(item, { ...pick, ...current, id: pick.id, name: pick.name }, packsOverride) : null;
}

/** Cherche l'article dans un magasin (une ou deux requêtes, mises en cache). */
export async function findOffer(item, store) {
  const [phrase, head] = queriesFor(item.name);
  let results = await searchStore(phrase, store);
  const wanted = tokens(item.name).length * 3;
  const top = rankProducts(results, item.name, item.category)[0];
  const merge = (more) => {
    const seen = new Set(results.map((r) => r.id));
    results = [...results, ...more.filter((r) => !seen.has(r.id))];
  };
  if (head && (!top || top.score < wanted)) merge(await searchStore(head, store));
  // Mot courant (« citron ») : la recherche simple est tronquée, on cible le rayon.
  for (const category of (PREFERRED[item.category] || []).slice(0, 2)) {
    if (pickOffer(results, item)) break;
    merge(await searchStore(head || phrase, store, category));
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
