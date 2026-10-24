// =============================================================
//  Dashboard.jsx — Accueil : salutation, recherche, résumé de la
//  semaine, repas du jour et suggestions de recettes.
// =============================================================

import { useMemo, useState } from 'react';
import { DAYS, SLOTS } from '../data/defaults.js';
import { mealIdsOfDay } from '../utils/grocery.js';
import { normalize } from '../utils/ingredients.js';
import Icon from './icons.jsx';
import MealCard, { MacroLine } from './MealCard.jsx';
import { Card, MealImage } from './ui.jsx';

const todayIndex = (new Date().getDay() + 6) % 7;

function greeting(name) {
  const h = new Date().getHours();
  const hello = h < 5 || h >= 18 ? 'Bonsoir' : 'Bonjour';
  return name ? `${hello}, ${name} !` : `${hello} !`;
}

export default function Dashboard({ profileName, meals, menu, mealsById, images, groceryList, checks, conflictCount, onOpenMeal, onGoTo, onSearch }) {
  const [query, setQuery] = useState('');

  const stats = useMemo(() => {
    const planned = DAYS.reduce((n, d) => n + mealIdsOfDay(menu.days[d.id]).length, 0);
    const toBuy = groceryList.items.filter((i) => !checks[i.key]?.done).length;
    const uniqueMeals = new Set(DAYS.flatMap((d) => mealIdsOfDay(menu.days[d.id])).filter((id) => mealsById[id]));
    const prepLeft = [...uniqueMeals].filter((id) => !menu.prepChecks?.[id]).length;
    return { planned, toBuy, prepLeft };
  }, [menu, groceryList, checks, mealsById]);

  // Recettes qui ne sont pas encore au menu : d'abord celles avec photo, puis les plus récentes.
  const suggestions = useMemo(() => {
    const inMenu = new Set(DAYS.flatMap((d) => mealIdsOfDay(menu.days[d.id])));
    const sorted = meals
      .filter((m) => m.name)
      .sort((a, b) => Number(Boolean(images[b.id])) - Number(Boolean(images[a.id])) || (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    const fresh = sorted.filter((m) => !inMenu.has(m.id));
    // Tout est déjà au menu : on montre quand même les recettes, pour y accéder vite.
    return { list: (fresh.length ? fresh : sorted).slice(0, 4), allInMenu: !fresh.length };
  }, [meals, menu, images]);

  const results = useMemo(() => {
    const q = normalize(query);
    if (q.length < 2) return [];
    return meals.filter((m) => normalize([m.name, ...(m.ingredients || [])].join(' ')).includes(q)).slice(0, 6);
  }, [meals, query]);

  const today = DAYS[todayIndex];
  const todayDay = menu.days[today.id];

  const tiles = [
    { icon: 'book', value: meals.length, label: 'Recettes', sub: 'dans la bibliothèque', tab: 'recettes' },
    { icon: 'calendar', value: stats.planned, label: 'Repas planifiés', sub: 'cette semaine', tab: 'semaine' },
    { icon: 'basket', value: stats.toBuy, label: 'Articles à acheter', sub: 'sur la liste', tab: 'epicerie' },
    { icon: 'pot', value: stats.prepLeft, label: 'Recettes à préparer', sub: 'meal prep', tab: 'prep' },
  ];

  return (
    <div className="page dashboard">
      <section className="hero">
        <div className="hero__text">
          <h1>{greeting(profileName)}</h1>
          <p>De bons repas pour de belles journées.</p>
          <form
            className="hero__search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(query);
            }}
          >
            <Icon name="search" size={18} />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une recette, un ingrédient…" aria-label="Rechercher une recette" />
          </form>
          {results.length > 0 && (
            <ul className="hero__results">
              {results.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => onOpenMeal(m.id)}>
                    <MealImage image={images[m.id]} className="hero__result-img" />
                    <span>
                      <strong>{m.name}</strong>
                      <MacroLine meal={m} />
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className="hero__all" onClick={() => onSearch(query)}>
                  Voir tous les résultats dans Recettes
                </button>
              </li>
            </ul>
          )}
        </div>
      </section>

      <div className="tiles">
        {tiles.map((t) => (
          <button key={t.tab} type="button" className="tile" onClick={() => onGoTo(t.tab)}>
            <span className="tile__icon" aria-hidden="true">
              <Icon name={t.icon} size={24} />
            </span>
            <span className="tile__text">
              <strong>{t.value}</strong>
              <span>{t.label}</span>
              <small>{t.sub}</small>
            </span>
          </button>
        ))}
      </div>

      {conflictCount > 0 && (
        <button type="button" className="notice notice--warning" onClick={() => onGoTo('logis')}>
          <Icon name="warning" size={20} />
          <span>
            <strong>{conflictCount} repas à vérifier</strong> selon les profils du logis cette semaine.
          </span>
          <span className="notice__action">Voir les détails</span>
        </button>
      )}

      <div className="dashboard__grid">
        <Card title={`Aujourd’hui · ${today.label}`} icon="sun" className="today">
          <ul className="today__list">
            {SLOTS.map((slot) => {
              const meal = mealsById[todayDay[slot.key]];
              return (
                <li key={slot.key}>
                  <span className="today__slot">{slot.label}</span>
                  {meal ? (
                    <button type="button" className="today__meal" onClick={() => onOpenMeal(meal.id)}>
                      <MealImage image={images[meal.id]} className="today__img" />
                      <span>
                        <strong>{meal.name}</strong>
                        <MacroLine meal={meal} />
                      </span>
                    </button>
                  ) : (
                    <button type="button" className="today__empty" onClick={() => onGoTo('semaine')}>
                      Rien de prévu · planifier
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {todayDay.notes && <p className="hint">{todayDay.notes}</p>}
        </Card>

        <section className="suggestions" aria-labelledby="suggestions-title">
          <div className="suggestions__head">
            <h2 id="suggestions-title">{suggestions.allInMenu ? 'Vos recettes' : 'Suggestions pour vous'}</h2>
            <button type="button" className="link" onClick={() => onGoTo('recettes')}>
              Toutes les recettes
            </button>
          </div>
          {suggestions.list.length ? (
            <div className="suggestions__grid">
              {suggestions.list.map((m) => (
                <MealCard key={m.id} meal={m} image={images[m.id]} onOpen={onOpenMeal} />
              ))}
            </div>
          ) : (
            <p className="hint">Aucune recette pour l’instant. Ajoutez-en ou demandez des idées à l’assistant.</p>
          )}
        </section>
      </div>
    </div>
  );
}
