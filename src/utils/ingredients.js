// =============================================================
//  ingredients.js — Lecture des lignes d'ingrédients
// -------------------------------------------------------------
//  Les fiches stockent une ligne de texte par ingrédient
//  (« 150 g poulet »). On en extrait quantité, unité, nom et
//  rayon d'épicerie pour bâtir la liste.
// =============================================================

export const normalize = (text = '') =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .trim();

const UNITS = [
  ['c. à soupe', ['c. a soupe', 'c.a.s.', 'c.à.s.', 'cuillere a soupe', 'cuilleres a soupe', 'cas', 'c. a s.', 'tbsp']],
  ['c. à thé', ['c. a the', 'c.a.t.', 'c.à.t.', 'cuillere a the', 'cuilleres a the', 'cat', 'c. a t.', 'tsp']],
  ['tasse', ['tasses', 'tasse', 't.', 'cup', 'cups']],
  ['kg', ['kg', 'kilo', 'kilos']],
  ['g', ['g', 'gr', 'grammes', 'gramme']],
  ['ml', ['ml']],
  ['l', ['l', 'litre', 'litres']],
  ['lb', ['lb', 'lbs', 'livre', 'livres']],
  ['boîte', ['boite', 'boites', 'conserve', 'conserves']],
  ['paquet', ['paquet', 'paquets', 'sac', 'sacs']],
  ['gousse', ['gousse', 'gousses']],
  ['branche', ['branche', 'branches']],
  ['tranche', ['tranche', 'tranches']],
  ['filet', ['filet', 'filets']],
  ['pincée', ['pincee', 'pincees']],
];

// Alias triés du plus long au plus court pour éviter qu'un « g » avale « gousse ».
const UNIT_ALIASES = UNITS.flatMap(([unit, aliases]) => aliases.map((a) => [a, unit])).sort(
  (a, b) => b[0].length - a[0].length
);

const FRACTIONS = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };

function parseQuantity(token) {
  if (!token) return null;
  if (FRACTIONS[token] != null) return FRACTIONS[token];
  const t = token.replace(',', '.');
  if (/^\d+\/\d+$/.test(t)) {
    const [a, b] = t.split('/').map(Number);
    return b ? a / b : null;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// Mots de comptage : « 1 tête de brocoli » = 1 brocoli (pas d'unité).
const COUNT_WORDS = /^(tetes?|bottes?|bouquets?|morceaux?|brins?|poignees?|feuilles?|grappes?|epis?|sachets?|enveloppes?|cuilleree?s?|gros(se)?s?|petite?s?|moyen(ne)?s?)\s+(de |d'|d’|des )?/;

// Ce qui décrit la préparation, pas l'achat (« séparé en fleurettes », « haché finement »).
const PREP = new RegExp(
  '\\b(' +
    [
      'finement', 'grossierement', 'fraichement', 'legerement', 'bien',
      'emincee?s?', 'tranchee?s?', 'rapee?s?', 'pelee?s?', 'epepinee?s?', 'egouttee?s?', 'rincee?s?', 'decortiquee?s?',
      'denoyautee?s?', 'fondue?s?', 'ramollie?s?', 'battue?s?', 'separee?s?', 'coupee?s?', 'hachee?s?', 'pressee?s?',
      'ecrasee?s?', 'concassee?s?', 'cisele?e?s?', 'equeutee?s?', 'paree?s?', 'parfumee?s?', 'tiede?s?', 'froide?s?',
      'chaude?s?', 'bouillante?s?', 'fraiche?s?', 'frais', 'a temperature ambiante', 'au gout', 'facultatif', 'optionnel(le)?',
      'pour (la |le |l.)?(cuisson|garniture|servir|garnir|decorer|badigeonner|la poele)',
      'en (des|cubes?|lanieres?|rondelles?|julienne|fleurettes?|quartiers?|morceaux?|tranches?|batonnets?|demi-lunes?|deux|quatre|purée|brunoise)',
    ].join('|') +
    ')\\b',
  'g'
);

// « Haché » ou « râpé » désignent un produit à acheter quand ils suivent une viande ou un fromage.
const KEEP_PREP = /\b(boeuf|porc|veau|agneau|dinde|poulet|viande|fromage|parmesan|mozzarella|cheddar|gruyere|emmental) (hache|rape)/;

// Toujours à la maison : on ne les achète pas.
const STAPLE_WORDS = new Set(['eau', 'sel', 'poivre', 'et', 'ou', 'noir', 'blanc', 'moulu', 'du', 'de', 'd', 'l', 'la', 'le', 'mer', 'casher', 'fin', 'gros', 'pour', 'cuisson', 'glacon', 'glacons', 'robinet']);
export const isStaple = (name) => {
  const words = normalize(name).replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  return words.some((w) => ['eau', 'sel', 'poivre', 'glacon', 'glacons'].includes(w)) && words.every((w) => STAPLE_WORDS.has(w));
};

/**
 * Texte d'ingrédient → nom de produit à acheter (« brocoli », « boeuf haché »).
 * keepPrep : pour une conserve, « tomates en dés » est le produit lui-même.
 */
export function shoppingName(text, { keepPrep = false } = {}) {
  let n = String(text)
    .replace(/\([^)]*\)/g, ' ')
    .split(/[,;:]| - | – /)[0]
    .replace(/^\s*(quelques|un peu d[e'’]|une? (filet|trait|soupçon) d[e'’])\s*/i, '');
  const norm = normalize(n).replace(/[’`]/g, "'");
  const keep = norm.match(KEEP_PREP)?.[0];
  let clean = norm.replace(COUNT_WORDS, '');
  if (!keepPrep) clean = clean.replace(PREP, ' ');
  if (keep && !clean.includes(keep)) clean = clean.replace(keep.split(' ')[0], keep);
  clean = clean
    .replace(/^(de |d'|des |du |la |le |les |l')/, '')
    .replace(/\s+(de|d'|et|ou|a|au|aux|en)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return n.trim();
  // On réutilise l'orthographe d'origine (accents) quand elle correspond mot pour mot.
  const original = n.trim().split(/\s+/).filter((w) => clean.split(' ').includes(normalize(w).replace(/[’`]/g, "'")));
  return original.length === clean.split(' ').length ? original.join(' ') : clean;
}

/** « Sel pour l'eau de cuisson » → ['sel', 'eau'] (pour l'affichage). */
const stapleWords = (text) => [...new Set(normalize(text).match(/\b(sel|poivre|eau|glacons?)\b/g) || [])].map((w) => (w.startsWith('glacon') ? 'glaçons' : w));

const WORD_NUMBERS = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, demi: 0.5, 'demi-tasse': 0.5 };

/** « 1 tête de brocoli, séparée en fleurettes » → { quantity: 1, unit: '', name: 'brocoli', staple: false } */
export function parseIngredient(line) {
  const raw = String(line ?? '').trim();
  if (!raw) return null;

  let rest = raw.replace(/^[-•*]\s*/, '');
  let quantity = null;
  // « Jus d'un citron », « zeste de 2 limes » → on achète le fruit.
  const juice = rest.match(/^(jus|zestes?)\s+(?:d[e'’]\s*)?(\d+|une?|deux|trois)\s+(.+)$/i);
  if (juice) rest = `${juice[2]} ${juice[3]}`;
  // « 1 1/2 », « 2 à 3 » (on garde le plus grand), « 1,5 », « ½ », « une »
  const qtyMatch = rest.match(/^(\d+)\s+(\d+\/\d+)\s*|^(\d+[.,]?\d*\/?\d*|[½¼¾⅓⅔])(\s*(?:à|-|ou)\s*(\d+[.,]?\d*))?\s*/);
  if (qtyMatch) {
    quantity = qtyMatch[1] ? Number(qtyMatch[1]) + parseQuantity(qtyMatch[2]) : parseQuantity(qtyMatch[5] || qtyMatch[3]);
    rest = rest.slice(qtyMatch[0].length);
  } else {
    const word = normalize(rest).match(/^(une?|deux|trois|quatre|cinq|six)\s+/);
    if (word) {
      quantity = WORD_NUMBERS[word[1]];
      rest = rest.slice(word[0].length);
    }
  }

  let unit = '';
  if (quantity != null) {
    const lower = normalize(rest);
    for (const [alias, canonical] of UNIT_ALIASES) {
      if (lower.startsWith(alias) && /^[\s.]|^$/.test(lower.slice(alias.length) || ' ')) {
        unit = canonical;
        rest = rest.slice(alias.length).replace(/^[.\s]+/, '');
        break;
      }
    }
  }

  const label = rest.replace(/^(de |d’|d'|des )/i, '').trim() || raw;
  const name = shoppingName(label, { keepPrep: unit === 'boîte' }) || label;
  const staple = isStaple(name) || isStaple(label);
  return { quantity, unit, name, raw, staple, basics: staple ? stapleWords(label) : [] };
}

/** Ingrédient venant de l'IA (texte ou objet) → ligne de texte. */
export function ingredientToLine(item) {
  if (!item) return '';
  if (typeof item === 'string') return item.trim();
  const qty = item.quantity ?? item.qty ?? '';
  return [qty, item.unit, item.name ?? item.label].filter((v) => v !== '' && v != null).join(' ').trim();
}

const CATEGORIES = [
  ['Fruits et légumes', ['pomme', 'banane', 'fruit', 'fraise', 'bleuet', 'framboise', 'citron', 'lime', 'orange', 'raisin', 'poire', 'avocat', 'tomate', 'laitue', 'epinard', 'brocoli', 'chou', 'carotte', 'celeri', 'courgette', 'poivron', 'concombre', 'oignon', 'ail', 'echalote', 'patate', 'pomme de terre', 'haricots verts', 'champignon', 'courge', 'patate douce', 'gingembre', 'fines herbes', 'persil', 'coriandre', 'basilic', 'legume', 'mangue', 'ananas', 'kiwi', 'radis', 'betterave', 'asperge', 'aubergine', 'mais', 'petits pois']],
  ['Viandes et poissons', ['poulet', 'dinde', 'boeuf', 'porc', 'jambon', 'bacon', 'saucisse', 'agneau', 'veau', 'saumon', 'thon', 'truite', 'morue', 'poisson', 'crevette', 'petoncle', 'tofu', 'viande']],
  ['Produits laitiers et oeufs', ['oeuf', 'lait', 'fromage', 'yogourt', 'yogurt', 'creme', 'beurre', 'cottage', 'ricotta', 'parmesan', 'mozzarella', 'feta', 'cheddar', 'boisson d']],
  ['Boulangerie et céréales', ['pain', 'tortilla', 'pita', 'bagel', 'riz', 'quinoa', 'pates', 'spaghetti', 'nouille', 'avoine', 'gruau', 'cereale', 'farine', 'couscous', 'orge', 'craquelin', 'galette']],
  ['Garde-manger', ['huile', 'vinaigre', 'sauce', 'bouillon', 'epice', 'sel', 'poivre', 'sucre', 'sirop', 'miel', 'moutarde', 'ketchup', 'mayonnaise', 'conserve', 'boite', 'tomates broyees', 'pate de tomate', 'lentille', 'pois chiche', 'haricot', 'noix', 'amande', 'graine', 'beurre de', 'chia', 'origan', 'thym', 'cumin', 'paprika', 'cannelle', 'vanille', 'levure', 'bicarbonate', 'tamari', 'soya', 'chocolat']],
  ['Surgelés', ['surgele', 'congele']],
];

export const CATEGORY_ORDER = [...CATEGORIES.map(([c]) => c), 'Autres'];

export function categorize(name) {
  const n = normalize(name);
  // « beurre de graines » et « boisson d'amande » doivent l'emporter sur « beurre » ou « amande ».
  let best = { category: 'Autres', length: 0 };
  for (const [category, keywords] of CATEGORIES) {
    for (const k of keywords) {
      if (n.includes(k) && k.length > best.length) best = { category, length: k.length };
    }
  }
  return best.category;
}

export function formatQuantity(quantity) {
  if (!quantity) return '';
  const rounded = Math.round(quantity * 100) / 100;
  return String(rounded).replace('.', ',');
}

const PLURAL_UNITS = new Set(['tasse', 'boîte', 'paquet', 'gousse', 'branche', 'tranche', 'filet', 'pincée']);

export function formatUnit(unit, quantity) {
  return quantity > 1 && PLURAL_UNITS.has(unit) ? `${unit}s` : unit;
}
