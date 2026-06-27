export function generateGroceryList(menu, mealsById = {}) {
  const items = [];
  const byCategory = {};

  if (!menu || !menu.days) {
    return { items, byCategory };
  }

  Object.entries(menu.days).forEach(([dayName, day]) => {
    if (!day) return;

    const mealIds = [
      day.dejeuner,
      day.diner,
      day.souper,
      ...(Array.isArray(day.collations) ? day.collations : []),
    ].filter(Boolean);

    mealIds.forEach((mealId) => {
      const meal = mealsById[mealId];

      if (!meal || !Array.isArray(meal.ingredients)) {
        return;
      }

      meal.ingredients.forEach((ingredient) => {
        if (!ingredient) return;

        const name =
          typeof ingredient === 'string'
            ? ingredient
            : ingredient.name || ingredient.label || '';

        if (!name) return;

        const quantity =
          typeof ingredient === 'object'
            ? ingredient.quantity || ingredient.qty || ''
            : '';

        const unit =
          typeof ingredient === 'object' ? ingredient.unit || '' : '';

        const category =
          typeof ingredient === 'object'
            ? ingredient.category || 'Autres'
            : 'Autres';

        const key = `${category}-${name}-${unit}`.toLowerCase();

        let existing = items.find((item) => item.key === key);

        if (!existing) {
          existing = {
            key,
            name,
            quantity: 0,
            unit,
            category,
            meals: [],
            days: [],
          };

          items.push(existing);
        }

        const numericQuantity = Number(quantity);

        if (!Number.isNaN(numericQuantity) && numericQuantity > 0) {
          existing.quantity += numericQuantity;
        }

        if (meal.name && !existing.meals.includes(meal.name)) {
          existing.meals.push(meal.name);
        }

        if (dayName && !existing.days.includes(dayName)) {
          existing.days.push(dayName);
        }
      });
    });
  });

  items.forEach((item) => {
    if (!byCategory[item.category]) {
      byCategory[item.category] = [];
    }

    byCategory[item.category].push(item);
  });

  Object.keys(byCategory).forEach((category) => {
    byCategory[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  items.sort((a, b) => {
    if (a.category === b.category) {
      return a.name.localeCompare(b.name);
    }

    return a.category.localeCompare(b.category);
  });

  return { items, byCategory };
}
