// =============================================================
//  nutrition.js — Totaux par journée et alertes de profil
// =============================================================

import { mealIdsOfDay } from './grocery.js';
import { normalize } from './ingredients.js';

const num = (v) => {
  const n = Number(String(v ?? '').replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/** Somme des macros (par portion) des repas d'une journée. */
export function dayTotals(day, mealsById) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, count: 0 };
  for (const id of mealIdsOfDay(day)) {
    const meal = mealsById[id];
    if (!meal) continue;
    totals.count += 1;
    for (const k of ['calories', 'protein', 'carbs', 'fat', 'fiber']) totals[k] += num(meal.macros?.[k]);
  }
  return totals;
}

export const toNumber = num;

// Mots à surveiller selon les restrictions courantes. « neutral » : mentions
// qui annulent l'alerte sur la même ligne (« pâtes sans gluten »).
const RESTRICTION_RULES = [
  { test: /gluten/, neutral: ['sans gluten'], words: ['ble', 'farine', 'pain', 'pates', 'spaghetti', 'orge', 'seigle', 'couscous', 'chapelure', 'biere', 'tortilla', 'pita', 'bagel', 'craquelin', 'sauce soya'] },
  { test: /lactose|laitier/, neutral: ['sans lactose', 'beurre de', 'boisson d', 'lait de coco'], words: ['lait', 'fromage', 'creme', 'beurre', 'yogourt', 'yogurt', 'cottage', 'ricotta', 'parmesan', 'mozzarella', 'cheddar', 'feta'] },
  { test: /fodmap/, neutral: ['pomme de terre', 'pommes de terre'], words: ['ail', 'oignon', 'echalote', 'haricots rouges', 'haricots noirs', 'lentille', 'pois chiche', 'champignon', 'chou-fleur', 'miel', 'mangue', 'poire', 'pomme'] },
  { test: /legumineuse/, neutral: [], words: ['lentille', 'pois chiche', 'haricots rouges', 'haricots noirs', 'feve', 'edamame', 'tofu'] },
  { test: /vegetarien|vegane|vegan/, neutral: [], words: ['poulet', 'dinde', 'boeuf', 'porc', 'jambon', 'bacon', 'saucisse', 'saumon', 'thon', 'poisson', 'crevette', 'veau', 'agneau'] },
  { test: /noix|arachide/, neutral: ['sans noix', 'muscade', 'coco'], words: ['noix', 'amande', 'arachide', 'cajou', 'pacane', 'pistache', 'noisette'] },
];

const STOPWORDS = new Set(['plat', 'plats', 'repas', 'produit', 'produits', 'trop', 'regulier', 'reguliers', 'les', 'des', 'aux']);

// « Oignons crus » → « oignon » ; « Plats trop épicés » → « epice ».
function dislikeKeyword(text) {
  const word = normalize(text)
    .split(/[\s,/]+/)
    .find((w) => w.length >= 3 && !STOPWORDS.has(w));
  return word ? word.replace(/(s|x)$/, '') : null;
}

const wordMatch = (line, keyword) => new RegExp(`(^|[^a-z])${keyword}`).test(line);

function buildChecks(member) {
  const checks = [];
  for (const r of member.restrictions || []) {
    const n = normalize(r);
    for (const rule of RESTRICTION_RULES) {
      if (rule.test.test(n)) rule.words.forEach((keyword) => checks.push({ keyword, source: r, neutral: rule.neutral }));
    }
  }
  for (const d of member.dislikes || []) {
    const keyword = dislikeKeyword(d);
    if (keyword) checks.push({ keyword, source: d, neutral: [] });
  }
  return checks;
}

/**
 * Repas du menu qui contiennent un ingrédient à éviter pour ce membre.
 * Retourne [{ meal, days, reasons: [{ keyword, source }] }].
 */
export function findConflicts(member, menu, mealsById, dayLabels) {
  if (!member || !menu) return [];
  const checks = buildChecks(member);
  if (!checks.length) return [];

  const found = new Map();
  for (const [dayId, day] of Object.entries(menu.days || {})) {
    for (const id of mealIdsOfDay(day)) {
      const meal = mealsById[id];
      if (!meal) continue;
      if (meal.assignedTo?.length && !meal.assignedTo.includes(member.id)) continue;

      let entry = found.get(id);
      if (!entry) {
        const lines = [meal.name, ...(meal.ingredients || [])].map(normalize);
        const reasons = checks.filter((c) =>
          lines.some((line) => wordMatch(line, c.keyword) && !c.neutral.some((x) => line.includes(x)))
        );
        if (!reasons.length) continue;
        entry = { meal, days: [], reasons: reasons.filter((r, i) => reasons.findIndex((x) => x.source === r.source) === i) };
        found.set(id, entry);
      }
      const label = dayLabels[dayId] || dayId;
      if (!entry.days.includes(label)) entry.days.push(label);
    }
  }
  return [...found.values()];
}
