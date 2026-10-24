// =============================================================
//  WeeklyMenu.jsx — Planification de la semaine
// -------------------------------------------------------------
//  Vue et édition réunies : chaque case s'ouvre sur un sélecteur
//  de recettes ; les totaux de la journée se calculent seuls.
// =============================================================

import { useMemo, useState } from 'react';
import { DAYS, SLOTS } from '../data/defaults.js';
import { mealIdsOfDay } from '../utils/grocery.js';
import { dayTotals } from '../utils/nutrition.js';
import { MacroLine, MealPicker } from './MealCard.jsx';
import { MealImage, PageHeader, useToast } from './ui.jsx';

// Lundi = 0 … dimanche = 6
const todayIndex = (new Date().getDay() + 6) % 7;

function SlotMeal({ meal, image, onOpen, onChange, onRemove }) {
  return (
    <div className="slot-meal">
      <button type="button" className="slot-meal__main" onClick={onOpen}>
        <MealImage meal={meal} image={image} className="slot-meal__img" />
        <span>
          <strong>{meal.name || 'Repas sans nom'}</strong>
          <MacroLine meal={meal} compact />
        </span>
      </button>
      <span className="slot-meal__tools no-print">
        <button type="button" className="icon-btn icon-btn--sm" onClick={onChange} aria-label={`Changer ${meal.name}`} title="Changer">
          ⇄
        </button>
        <button type="button" className="icon-btn icon-btn--sm" onClick={onRemove} aria-label={`Retirer ${meal.name}`} title="Retirer">
          ✕
        </button>
      </span>
    </div>
  );
}

export default function WeeklyMenu({ menus, menu, meals, mealsById, images, actions, onOpenMeal, onCreateMeal, conflictCount, onGoTo }) {
  const notify = useToast();
  const [picker, setPicker] = useState(null); // { dayId, slot, type }
  const [renaming, setRenaming] = useState(false);

  const stats = useMemo(() => {
    let planned = 0;
    let kcal = 0;
    let daysWithMeals = 0;
    const unique = new Set();
    for (const { id } of DAYS) {
      const ids = mealIdsOfDay(menu.days[id]);
      planned += ids.length;
      ids.forEach((x) => unique.add(x));
      const t = dayTotals(menu.days[id], mealsById);
      if (t.count) {
        daysWithMeals += 1;
        kcal += t.calories;
      }
    }
    return { planned, unique: unique.size, avgKcal: daysWithMeals ? Math.round(kcal / daysWithMeals) : 0 };
  }, [menu, mealsById]);

  const setSlot = (dayId, slot, mealId) => actions.updateDay(menu.id, dayId, { [slot]: mealId });

  function handlePick(mealId) {
    const { dayId, slot } = picker;
    if (slot === 'collations') {
      const current = menu.days[dayId].collations;
      actions.updateDay(menu.id, dayId, { collations: [...current, mealId] });
    } else {
      setSlot(dayId, slot, mealId);
    }
    setPicker(null);
  }

  function handleCreate(name) {
    setPicker(null);
    onCreateMeal({ name, mealTypes: picker.type ? [picker.type] : [] });
  }

  function confirmDelete() {
    if (!window.confirm(`Supprimer « ${menu.name} » ? Les recettes restent dans votre bibliothèque.`)) return;
    actions.deleteMenu(menu.id);
    notify('Semaine supprimée');
  }

  function confirmClear() {
    if (!window.confirm(`Vider toutes les cases de « ${menu.name} » ?`)) return;
    actions.clearMenu(menu.id);
    notify('Semaine vidée');
  }

  return (
    <div className="page printable" data-print="menu">
      <PageHeader
        icon="🗓"
        title={
          renaming ? (
            <input
              className="input input--title"
              autoFocus
              value={menu.name}
              onChange={(e) => actions.renameMenu(menu.id, e.target.value)}
              onBlur={() => setRenaming(false)}
              onKeyDown={(e) => e.key === 'Enter' && setRenaming(false)}
              aria-label="Nom de la semaine"
            />
          ) : (
            <button type="button" className="title-btn" onClick={() => setRenaming(true)} title="Renommer">
              {menu.name} <span className="title-btn__pen no-print" aria-hidden="true">✎</span>
            </button>
          )
        }
        subtitle="Cliquez sur une case pour y placer une recette. Les totaux sont calculés par portion."
        actions={
          <div className="toolbar no-print">
            {menus.length > 1 && (
              <select className="input input--compact" value={menu.id} onChange={(e) => actions.selectMenu(e.target.value)} aria-label="Choisir une semaine">
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
            <button type="button" className="btn btn--primary" onClick={actions.createMenu}>
              ＋ Nouvelle semaine
            </button>
            <details className="menu-more">
              <summary className="btn btn--parchment">⋯ Plus</summary>
              <div className="menu-more__list">
                <button type="button" onClick={() => { actions.duplicateMenu(menu.id); notify('Semaine dupliquée'); }}>
                  ⧉ Dupliquer la semaine
                </button>
                <button type="button" onClick={() => window.print()}>
                  🖨 Imprimer
                </button>
                <button type="button" onClick={confirmClear}>
                  ⌫ Vider les cases
                </button>
                <button type="button" className="is-danger" onClick={confirmDelete}>
                  🗑 Supprimer la semaine
                </button>
              </div>
            </details>
          </div>
        }
      />

      <div className="stats no-print">
        <div className="stat">
          <strong>{stats.planned}</strong>
          <span>repas planifiés</span>
        </div>
        <div className="stat">
          <strong>{stats.unique}</strong>
          <span>recettes différentes</span>
        </div>
        <div className="stat">
          <strong>{stats.avgKcal || '—'}</strong>
          <span>kcal / jour en moyenne</span>
        </div>
        <button type="button" className={`stat stat--link ${conflictCount ? 'is-warning' : 'is-ok'}`} onClick={() => onGoTo('logis')}>
          <strong>{conflictCount ? `⚠ ${conflictCount}` : '✓'}</strong>
          <span>{conflictCount ? 'alertes de profil' : 'compatible avec le logis'}</span>
        </button>
      </div>

      {meals.length === 0 && (
        <div className="callout no-print">
          <span aria-hidden="true">📜</span>
          <p>Votre bibliothèque est vide. Créez d’abord quelques recettes, ou demandez-en à l’assistant.</p>
          <button type="button" className="btn btn--primary" onClick={() => onGoTo('recettes')}>
            Aller aux recettes
          </button>
        </div>
      )}

      <div className="week">
        {DAYS.map((d, index) => {
          const day = menu.days[d.id];
          const totals = dayTotals(day, mealsById);
          return (
            <section key={d.id} className={`day ${index === todayIndex ? 'is-today' : ''}`} aria-label={d.label}>
              <header className="day__head">
                <h2>
                  {d.label}
                  {index === todayIndex && <em className="no-print">Aujourd’hui</em>}
                </h2>
                {totals.count > 0 && (
                  <span className="day__totals" title="Total par portion">
                    {Math.round(totals.calories)} kcal · {Math.round(totals.protein)} g prot.
                  </span>
                )}
              </header>

              {SLOTS.map((slot) => {
                const meal = mealsById[day[slot.key]];
                return (
                  <div key={slot.key} className="slot">
                    <span className="slot__label">{slot.label}</span>
                    {meal ? (
                      <SlotMeal
                        meal={meal}
                        image={images[meal.id]}
                        onOpen={() => onOpenMeal(meal.id)}
                        onChange={() => setPicker({ dayId: d.id, slot: slot.key, type: slot.type, label: `${slot.label} · ${d.label}` })}
                        onRemove={() => setSlot(d.id, slot.key, '')}
                      />
                    ) : (
                      <button
                        type="button"
                        className="slot__add no-print"
                        onClick={() => setPicker({ dayId: d.id, slot: slot.key, type: slot.type, label: `${slot.label} · ${d.label}` })}
                      >
                        ＋ Ajouter
                      </button>
                    )}
                  </div>
                );
              })}

              <div className="slot">
                <span className="slot__label">Collations</span>
                <div className="snacks">
                  {day.collations.map((id, i) => {
                    const meal = mealsById[id];
                    if (!meal) return null;
                    return (
                      <span key={`${id}-${i}`} className="snack">
                        <button type="button" onClick={() => onOpenMeal(id)}>
                          {meal.name}
                        </button>
                        <button
                          type="button"
                          className="snack__remove no-print"
                          aria-label={`Retirer ${meal.name}`}
                          onClick={() => actions.updateDay(menu.id, d.id, { collations: day.collations.filter((_, j) => j !== i) })}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                  <button
                    type="button"
                    className="snack snack--add no-print"
                    onClick={() => setPicker({ dayId: d.id, slot: 'collations', type: 'collation', label: `Collation · ${d.label}` })}
                  >
                    ＋
                  </button>
                </div>
              </div>

              <textarea
                className="day__notes"
                rows={2}
                value={day.notes}
                placeholder="Note : lunch, sortie, rappel…"
                aria-label={`Note pour ${d.label}`}
                onChange={(e) => actions.updateDay(menu.id, d.id, { notes: e.target.value })}
              />
            </section>
          );
        })}
      </div>

      {picker && (
        <MealPicker
          title={`Choisir : ${picker.label}`}
          meals={meals}
          images={images}
          preferredType={picker.type}
          onPick={handlePick}
          onClose={() => setPicker(null)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
