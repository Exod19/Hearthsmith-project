// =============================================================
//  grocery.js — Liste d'épicerie consolidée d'un menu
// =============================================================

import { DAYS } from '../data/defaults.js';
import { CATEGORY_ORDER, categorize, normalize, parseIngredient } from './ingredients.js';

const singular = (text) =>
  normalize(text)
    .split(/\s+/)
    .map((w) => (w.length > 3 ? w.replace(/(s|x)$/, '') : w))
    .join(' ');

/** Ids de repas d'une journée, collations comprises. */
export function mealIdsOfDay(day) {
  if (!day) return [];
  return [day.dejeuner, day.diner, day.souper, ...(day.collations || [])].filter(Boolean);
}

export function generateGroceryList(menu, mealsById = {}) {
  const map = new Map();
  const staples = new Set();

  const add = ({ line, mealName, dayLabel, category }) => {
    const parsed = parseIngredient(line);
    if (!parsed) return;
    // Sel, poivre, eau… : toujours à la maison, on ne les achète pas.
    if (parsed.staple) {
      parsed.basics.forEach((w) => staples.add(w));
      return;
    }
    const key = `${singular(parsed.name)}|${parsed.unit}`;
    let item = map.get(key);
    if (!item) {
      item = {
        key,
        name: parsed.name,
        unit: parsed.unit,
        quantity: 0,
        hasUnknownQuantity: false,
        category: category || categorize(parsed.name),
        meals: [],
        days: [],
      };
      map.set(key, item);
    }
    if (parsed.quantity != null) item.quantity += parsed.quantity;
    else item.hasUnknownQuantity = true;
    if (mealName && !item.meals.includes(mealName)) item.meals.push(mealName);
    if (dayLabel && !item.days.includes(dayLabel)) item.days.push(dayLabel);
  };

  for (const { id, label } of DAYS) {
    for (const mealId of mealIdsOfDay(menu?.days?.[id])) {
      const meal = mealsById[mealId];
      if (!meal) continue;
      for (const line of meal.ingredients || []) add({ line, mealName: meal.name, dayLabel: label });
    }
  }
  for (const extra of menu?.extraGroceries || []) add({ line: extra, mealName: 'Ajout manuel' });

  const items = [...map.values()];
  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((i) => i.category === category).sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  })).filter((g) => g.items.length);

  return { items, byCategory, staples: [...staples].sort() };
}
