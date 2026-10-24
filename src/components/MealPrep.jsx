// =============================================================
//  MealPrep.jsx — Plan de préparation de la semaine
// -------------------------------------------------------------
//  Regroupe les recettes du menu : celles qui reviennent souvent
//  sont à cuisiner en lot, les autres au jour le jour.
// =============================================================

import { useMemo } from 'react';
import { DAYS } from '../data/defaults.js';
import { mealIdsOfDay } from '../utils/grocery.js';
import { toNumber } from '../utils/nutrition.js';
import { Card, EmptyState, MealImage, PageHeader, Progress } from './ui.jsx';
import Icon from './icons.jsx';

const formatDuration = (min) => (min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}` : `${min} min`);

export default function MealPrep({ menu, mealsById, images, actions, onOpenMeal, onGoTo }) {
  const plan = useMemo(() => {
    const byMeal = new Map();
    for (const d of DAYS) {
      for (const id of mealIdsOfDay(menu.days[d.id])) {
        const meal = mealsById[id];
        if (!meal) continue;
        const entry = byMeal.get(id) || { meal, days: [], count: 0 };
        entry.count += 1;
        if (!entry.days.includes(d.short)) entry.days.push(d.short);
        byMeal.set(id, entry);
      }
    }
    const all = [...byMeal.values()].sort((a, b) => b.count - a.count || (a.meal.name || '').localeCompare(b.meal.name || '', 'fr'));
    return {
      batch: all.filter((e) => e.count >= 2),
      single: all.filter((e) => e.count < 2),
      minutes: all.reduce((sum, e) => sum + toNumber(e.meal.prepTime), 0),
    };
  }, [menu, mealsById]);

  const checks = menu.prepChecks || {};
  const allEntries = [...plan.batch, ...plan.single];
  const doneCount = allEntries.filter((e) => checks[e.meal.id]).length;
  const toggle = (id) => actions.updateMenu(menu.id, { prepChecks: { ...checks, [id]: !checks[id] } });

  const renderEntry = (e) => (
    <li key={e.meal.id} className={`prep-item ${checks[e.meal.id] ? 'is-done' : ''}`}>
      <input type="checkbox" checked={Boolean(checks[e.meal.id])} onChange={() => toggle(e.meal.id)} aria-label={`Préparé : ${e.meal.name}`} />
      <MealImage meal={e.meal} image={images[e.meal.id]} className="prep-item__img" />
      <button type="button" className="prep-item__body" onClick={() => onOpenMeal(e.meal.id)}>
        <strong>{e.meal.name || 'Repas sans nom'}</strong>
        <span>
          {e.count} fois · {e.days.join(', ')}
          {e.meal.prepTime ? ` · ${e.meal.prepTime} min` : ''}
        </span>
      </button>
      {e.count >= 2 && <span className="badge">×{e.count}</span>}
    </li>
  );

  return (
    <div className="page printable">
      <PageHeader
        art="marmite-meal-prep"
        title="Meal prep"
        subtitle={`Ce qu’il faut cuisiner pour « ${menu.name} », en commençant par ce qui revient le plus souvent.`}
        actions={
          <button type="button" className="btn btn--parchment no-print" onClick={() => window.print()} disabled={!allEntries.length}>
            <Icon name="printer" size={18} /> Imprimer
          </button>
        }
      />

      {!allEntries.length ? (
        <EmptyState
          art="marmite-meal-prep"
          title="Aucun repas à préparer"
          action={
            <button type="button" className="btn btn--primary" onClick={() => onGoTo('semaine')}>
              Planifier la semaine
            </button>
          }
        >
          Le plan se construit à partir du menu de la semaine.
        </EmptyState>
      ) : (
        <div className="prep-layout">
          <div className="prep-main">
            <div className="grocery-bar no-print">
              <div className="grocery-bar__progress">
                <strong>
                  {doneCount} / {allEntries.length} recettes prêtes
                </strong>
                <Progress value={doneCount} max={allEntries.length} label="Recettes préparées" />
              </div>
              {plan.minutes > 0 && <span className="hint">≈ {formatDuration(plan.minutes)} de préparation au total</span>}
            </div>

            {plan.batch.length > 0 && (
              <Card title="À cuisiner en lot" icon="pot">
                <p className="hint">Ces recettes reviennent plusieurs fois : préparez-les d’avance, par exemple le dimanche.</p>
                <ul className="prep-list">{plan.batch.map(renderEntry)}</ul>
              </Card>
            )}
            {plan.single.length > 0 && (
              <Card title="Au jour le jour" icon="flame">
                <ul className="prep-list">{plan.single.map(renderEntry)}</ul>
              </Card>
            )}
          </div>

          <aside className="prep-side">
            <Card title="Notes de préparation" icon="note">
              <div className="prep-notes">
                {DAYS.map((d) => (
                  <label key={d.id} className="field">
                    <span>{d.label}</span>
                    <input
                      className="input"
                      value={menu.days[d.id].mealPrep}
                      placeholder="Ex. cuire le riz, couper les légumes…"
                      onChange={(e) => actions.updateDay(menu.id, d.id, { mealPrep: e.target.value })}
                    />
                  </label>
                ))}
              </div>
            </Card>
            {menu.mealPrepPlan && (
              <Card
                title="Plan proposé par l’assistant"
                icon="sparkle"
                actions={
                  <button type="button" className="btn btn--ghost btn--sm no-print" onClick={() => actions.updateMenu(menu.id, { mealPrepPlan: '' })}>
                    Retirer
                  </button>
                }
              >
                <p className="prewrap">{menu.mealPrepPlan}</p>
              </Card>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
