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

/** « 1,5 tasse quinoa » → { quantity: 1.5, unit: 'tasse', name: 'quinoa' } */
export function parseIngredient(line) {
  const raw = String(line ?? '').trim();
  if (!raw) return null;

  let rest = raw;
  let quantity = null;
  const qtyMatch = rest.match(/^(\d+[.,]?\d*\/?\d*|[½¼¾⅓⅔])\s*/);
  if (qtyMatch) {
    quantity = parseQuantity(qtyMatch[1]);
    rest = rest.slice(qtyMatch[0].length);
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

  const name = rest.replace(/^(de |d’|d'|des )/i, '').trim() || raw;
  return { quantity, unit, name, raw };
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
