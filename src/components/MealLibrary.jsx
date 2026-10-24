// =============================================================
//  MealLibrary.jsx — Bibliothèque de recettes
// =============================================================

import { useMemo, useState } from 'react';
import { MEAL_TYPES } from '../data/defaults.js';
import { mealIdsOfDay } from '../utils/grocery.js';
import { normalize } from '../utils/ingredients.js';
import MealCard from './MealCard.jsx';
import { Chip, EmptyState, PageHeader } from './ui.jsx';

const SORTS = {
  name: { label: 'Nom', fn: (a, b) => (a.name || '').localeCompare(b.name || '', 'fr') },
  recent: { label: 'Récentes', fn: (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '') },
  protein: { label: 'Protéines', fn: (a, b) => (Number(b.macros?.protein) || 0) - (Number(a.macros?.protein) || 0) },
  time: { label: 'Rapidité', fn: (a, b) => (Number(a.prepTime) || 999) - (Number(b.prepTime) || 999) },
};

export default function MealLibrary({ meals, images, menu, onEdit, onCreate, onGoTo }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('name');

  const inMenu = useMemo(() => new Set(Object.values(menu.days).flatMap(mealIdsOfDay)), [menu]);

  const visible = useMemo(() => {
    const q = normalize(query);
    return meals
      .filter((m) => !type || m.mealTypes?.includes(type))
      .filter((m) => !q || normalize([m.name, ...(m.ingredients || [])].join(' ')).includes(q))
      .sort(SORTS[sort].fn);
  }, [meals, query, type, sort]);

  return (
    <div className="page">
      <PageHeader
        icon="📜"
        title="Recettes"
        subtitle={`${meals.length} recette${meals.length > 1 ? 's' : ''} dans votre grimoire. Cherchez par nom ou par ingrédient.`}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => onCreate()}>
            ＋ Nouvelle recette
          </button>
        }
      />

      {meals.length === 0 ? (
        <EmptyState
          icon="📜"
          title="Aucune recette pour l’instant"
          action={
            <div className="toolbar">
              <button type="button" className="btn btn--primary" onClick={() => onCreate()}>
                Créer ma première recette
              </button>
              <button type="button" className="btn btn--parchment" onClick={() => onGoTo('assistant')}>
                ✨ Demander à l’assistant
              </button>
            </div>
          }
        >
          Vos recettes alimentent le menu de la semaine, l’épicerie et le meal prep.
        </EmptyState>
      ) : (
        <>
          <div className="filters">
            <input
              className="input filters__search"
              type="search"
              placeholder="🔍 Rechercher : poulet, riz, soupe…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Rechercher une recette"
            />
            <div className="chips">
              <Chip active={!type} onClick={() => setType('')}>
                Toutes
              </Chip>
              {MEAL_TYPES.map((t) => (
                <Chip key={t.id} active={type === t.id} onClick={() => setType(type === t.id ? '' : t.id)}>
                  {t.icon} {t.label}
                </Chip>
              ))}
            </div>
            <label className="filters__sort">
              Trier par
              <select className="input input--compact" value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.entries(SORTS).map(([k, s]) => (
                  <option key={k} value={k}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {visible.length ? (
            <div className="meal-grid">
              {visible.map((meal) => (
                <div key={meal.id} className="meal-grid__item">
                  <MealCard meal={meal} image={images[meal.id]} onOpen={onEdit} />
                  {inMenu.has(meal.id) && <span className="badge badge--menu">Au menu</span>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="🔍" title="Aucun résultat">
              Essayez un autre mot ou retirez le filtre.
            </EmptyState>
          )}
        </>
      )}
    </div>
  );
}
