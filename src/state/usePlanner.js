// =============================================================
//  usePlanner.js — État global de l'app et actions
// -------------------------------------------------------------
//  Toutes les mutations passent par les actions ci-dessous ;
//  l'état est sauvegardé dans le navigateur peu après chaque
//  changement.
// =============================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { createBlankMenu, createEmptyMeal, createEmptyState, createMember, uid } from '../data/defaults.js';
import { ingredientToLine } from '../utils/ingredients.js';
import { clearStorage, loadState, saveState } from '../utils/storage.js';

const now = () => new Date().toISOString();

const mapMenu = (state, menuId, fn) => ({
  ...state,
  menus: state.menus.map((m) => (m.id === menuId ? fn(m) : m)),
});

export function usePlanner({ onSaveError } = {}) {
  const [state, setState] = useState(loadState);

  // Sauvegarde différée : on évite d'écrire à chaque frappe.
  const errorRef = useRef(onSaveError);
  useEffect(() => {
    errorRef.current = onSaveError;
  });
  useEffect(() => {
    const t = setTimeout(() => {
      if (!saveState(state)) errorRef.current?.();
    }, 300);
    return () => clearTimeout(t);
  }, [state]);

  // Dernier état connu, pour les actions qui doivent renvoyer un résultat (ids créés).
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const actions = useMemo(() => {
    const set = setState;
    return {
      // ---- Repas ----
      addMeal(overrides) {
        const meal = createEmptyMeal(overrides);
        set((s) => ({ ...s, meals: [...s.meals, meal] }));
        return meal.id;
      },
      updateMeal(id, patch) {
        set((s) => ({
          ...s,
          meals: s.meals.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: now() } : m)),
        }));
      },
      duplicateMeal(id) {
        const newId = uid('meal');
        set((s) => {
          const src = s.meals.find((m) => m.id === id);
          if (!src) return s;
          const copy = { ...structuredClone(src), id: newId, name: `${src.name || 'Repas'} (copie)`, sample: false, createdAt: now(), updatedAt: now() };
          const images = s.images[id] ? { ...s.images, [newId]: s.images[id] } : s.images;
          return { ...s, meals: [...s.meals, copy], images };
        });
        return newId;
      },
      deleteMeal(id) {
        set((s) => {
          const images = { ...s.images };
          delete images[id];
          // Retire aussi le repas des menus pour ne pas laisser de cases fantômes.
          const menus = s.menus.map((menu) => ({
            ...menu,
            days: Object.fromEntries(
              Object.entries(menu.days).map(([d, day]) => [
                d,
                {
                  ...day,
                  dejeuner: day.dejeuner === id ? '' : day.dejeuner,
                  diner: day.diner === id ? '' : day.diner,
                  souper: day.souper === id ? '' : day.souper,
                  collations: day.collations.filter((c) => c !== id),
                },
              ])
            ),
          }));
          return { ...s, meals: s.meals.filter((m) => m.id !== id), images, menus };
        });
      },
      removeSampleMeals() {
        set((s) => {
          const ids = new Set(s.meals.filter((m) => m.sample).map((m) => m.id));
          const clean = (v) => (ids.has(v) ? '' : v);
          return {
            ...s,
            meals: s.meals.filter((m) => !ids.has(m.id)),
            menus: s.menus.map((menu) => ({
              ...menu,
              days: Object.fromEntries(
                Object.entries(menu.days).map(([d, day]) => [
                  d,
                  { ...day, dejeuner: clean(day.dejeuner), diner: clean(day.diner), souper: clean(day.souper), collations: day.collations.filter((c) => !ids.has(c)) },
                ])
              ),
            })),
          };
        });
      },

      // ---- Images ----
      setImage(mealId, dataUrl) {
        set((s) => ({ ...s, images: { ...s.images, [mealId]: dataUrl } }));
      },
      clearImage(mealId) {
        set((s) => {
          const images = { ...s.images };
          delete images[mealId];
          return { ...s, images };
        });
      },

      // ---- Menus ----
      selectMenu(id) {
        set((s) => ({ ...s, activeMenuId: id }));
      },
      createMenu() {
        set((s) => {
          const menu = createBlankMenu(`Semaine ${s.menus.length + 1}`);
          return { ...s, menus: [...s.menus, menu], activeMenuId: menu.id };
        });
      },
      duplicateMenu(id) {
        set((s) => {
          const src = s.menus.find((m) => m.id === id);
          if (!src) return s;
          const copy = { ...structuredClone(src), id: uid('menu'), name: `${src.name} (copie)`, prepChecks: {} };
          return { ...s, menus: [...s.menus, copy], activeMenuId: copy.id };
        });
      },
      renameMenu(id, name) {
        set((s) => mapMenu(s, id, (m) => ({ ...m, name })));
      },
      deleteMenu(id) {
        set((s) => {
          let menus = s.menus.filter((m) => m.id !== id);
          if (!menus.length) menus = [createBlankMenu()];
          const groceryChecks = { ...s.groceryChecks };
          delete groceryChecks[id];
          return { ...s, menus, groceryChecks, activeMenuId: s.activeMenuId === id ? menus[0].id : s.activeMenuId };
        });
      },
      clearMenu(id) {
        set((s) => mapMenu(s, id, (m) => ({ ...createBlankMenu(m.name), id: m.id, extraGroceries: m.extraGroceries })));
      },
      updateDay(menuId, dayId, patch) {
        set((s) => mapMenu(s, menuId, (m) => ({ ...m, days: { ...m.days, [dayId]: { ...m.days[dayId], ...patch } } })));
      },
      updateMenu(menuId, patch) {
        set((s) => mapMenu(s, menuId, (m) => ({ ...m, ...patch })));
      },

      // ---- Épicerie ----
      toggleGrocery(menuId, key) {
        set((s) => {
          const menuChecks = { ...s.groceryChecks[menuId] };
          menuChecks[key] = { done: !menuChecks[key]?.done };
          return { ...s, groceryChecks: { ...s.groceryChecks, [menuId]: menuChecks } };
        });
      },
      resetGroceryChecks(menuId) {
        set((s) => ({ ...s, groceryChecks: { ...s.groceryChecks, [menuId]: {} } }));
      },

      // ---- Profil ----
      setProfileName(profileName) {
        set((s) => ({ ...s, profileName }));
      },

      // ---- Prix ----
      updatePrices(fn) {
        set((s) => ({ ...s, prices: fn(s.prices) }));
      },

      // ---- Membres ----
      addMember() {
        const member = createMember();
        set((s) => ({ ...s, householdMembers: [...s.householdMembers, member] }));
        return member.id;
      },
      updateMember(id, patch) {
        set((s) => ({
          ...s,
          householdMembers: s.householdMembers.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        }));
      },
      deleteMember(id) {
        set((s) => ({
          ...s,
          householdMembers: s.householdMembers.filter((m) => m.id !== id),
          meals: s.meals.map((meal) =>
            meal.assignedTo?.includes(id) ? { ...meal, assignedTo: meal.assignedTo.filter((x) => x !== id) } : meal
          ),
        }));
      },

      // ---- Assistant ----
      /** Applique une proposition de l'assistant ; renvoie les recettes créées. */
      applyAIResult(result) {
        const current = stateRef.current;
        const memberIds = new Set(current.householdMembers.map((m) => m.id));
        const clean = (meal) => ({
          ...meal,
          ingredients: (meal.ingredients || []).map(ingredientToLine).filter(Boolean),
          assignedTo: (meal.assignedTo || []).filter((id) => memberIds.has(id)),
        });
        const created = (Array.isArray(result.createMeals) ? result.createMeals : []).map((meal) =>
          createEmptyMeal({ ...clean(meal), id: meal.id && !current.meals.some((m) => m.id === meal.id) ? meal.id : uid('meal') })
        );

        set((s) => {
          let next = { ...s };
          if (created.length) next.meals = [...next.meals, ...created];
          if (Array.isArray(result.updateMeals) && result.updateMeals.length) {
            next.meals = next.meals.map((meal) => {
              const patch = result.updateMeals.find((u) => u.id === meal.id);
              return patch ? { ...meal, ...clean({ ...meal, ...patch }), id: meal.id, updatedAt: now() } : meal;
            });
          }

          const menuId = s.activeMenuId;
          if (result.weeklyMenu?.days) {
            const known = new Set(next.meals.map((m) => m.id));
            // Id inconnu : on garde ce qui était déjà planifié ; '' ou null vide la case.
            const pick = (value, current) => (value === undefined ? current : !value ? '' : known.has(value) ? value : current);
            next = mapMenu(next, menuId, (m) => ({
              ...m,
              name: result.weeklyMenu.name || m.name,
              days: Object.fromEntries(
                Object.entries(m.days).map(([d, day]) => {
                  const p = result.weeklyMenu.days[d];
                  if (!p) return [d, day];
                  return [
                    d,
                    {
                      ...day,
                      dejeuner: pick(p.dejeuner, day.dejeuner),
                      diner: pick(p.diner, day.diner),
                      souper: pick(p.souper, day.souper),
                      collations: Array.isArray(p.collations) ? p.collations.filter((id) => known.has(id)) : day.collations,
                      notes: p.notes ?? day.notes,
                      mealPrep: p.mealPrep ?? day.mealPrep,
                    },
                  ];
                })
              ),
            }));
          }
          if (result.mealPrepPlan) {
            next = mapMenu(next, menuId, (m) => ({ ...m, mealPrepPlan: result.mealPrepPlan }));
          }
          return next;
        });
        return created;
      },

      // ---- Sauvegarde ----
      replaceState(next) {
        set(next);
      },
      resetAll() {
        clearStorage();
        set(createEmptyState());
      },
    };
  }, []);

  return [state, actions];
}
