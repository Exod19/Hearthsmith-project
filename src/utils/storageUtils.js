const STORAGE_KEY = 'family-meal-planner-state';

export const DEFAULT_STATE = {
  meals: [],
  menus: [
    {
      id: 'menu-demo',
      name: 'Menu de départ',
      description: 'Menu vide pour commencer',
      days: {
        lundi: {
          dejeuner: '',
          diner: '',
          souper: '',
          collations: [],
          notes: '',
          mealPrep: '',
        },
        mardi: {
          dejeuner: '',
          diner: '',
          souper: '',
          collations: [],
          notes: '',
          mealPrep: '',
        },
        mercredi: {
          dejeuner: '',
          diner: '',
          souper: '',
          collations: [],
          notes: '',
          mealPrep: '',
        },
        jeudi: {
          dejeuner: '',
          diner: '',
          souper: '',
          collations: [],
          notes: '',
          mealPrep: '',
        },
        vendredi: {
          dejeuner: '',
          diner: '',
          souper: '',
          collations: [],
          notes: '',
          mealPrep: '',
        },
        samedi: {
          dejeuner: '',
          diner: '',
          souper: '',
          collations: [],
          notes: '',
          mealPrep: '',
        },
        dimanche: {
          dejeuner: '',
          diner: '',
          souper: '',
          collations: [],
          notes: '',
          mealPrep: '',
        },
      },
    },
  ],
  activeMenuId: 'menu-demo',
  images: {},
  groceryChecks: {},
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_STATE,
      ...parsed,
      meals: Array.isArray(parsed.meals) ? parsed.meals : DEFAULT_STATE.meals,
      menus:
        Array.isArray(parsed.menus) && parsed.menus.length > 0
          ? parsed.menus
          : DEFAULT_STATE.menus,
      images:
        parsed.images && typeof parsed.images === 'object'
          ? parsed.images
          : DEFAULT_STATE.images,
      groceryChecks:
        parsed.groceryChecks && typeof parsed.groceryChecks === 'object'
          ? parsed.groceryChecks
          : DEFAULT_STATE.groceryChecks,
    };
  } catch (error) {
    console.error('Erreur pendant le chargement des données:', error);
    return DEFAULT_STATE;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Erreur pendant la sauvegarde des données:', error);
  }
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_STATE;
}

export async function importBackup(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);

  return {
    ...DEFAULT_STATE,
    ...parsed,
    meals: Array.isArray(parsed.meals) ? parsed.meals : DEFAULT_STATE.meals,
    menus:
      Array.isArray(parsed.menus) && parsed.menus.length > 0
        ? parsed.menus
        : DEFAULT_STATE.menus,
    images:
      parsed.images && typeof parsed.images === 'object'
        ? parsed.images
        : DEFAULT_STATE.images,
    groceryChecks:
      parsed.groceryChecks && typeof parsed.groceryChecks === 'object'
        ? parsed.groceryChecks
        : DEFAULT_STATE.groceryChecks,
  };
}

export function removeState() {
  localStorage.removeItem(STORAGE_KEY);
}
