// =============================================================
//  storage.js — Persistance locale, migration et sauvegardes
// =============================================================

import { DAYS, createBlankDay, createInitialState, createMember, DEFAULT_MEMBERS } from '../data/defaults.js';
import { ingredientToLine } from './ingredients.js';

const STORAGE_KEY = 'family-meal-planner-state';
const LEGACY_MEMBERS_KEY = 'hearthsmith.householdMembers';

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

function normalizeMenu(menu, index) {
  const days = Object.fromEntries(
    DAYS.map(({ id }) => {
      const d = { ...createBlankDay(), ...menu?.days?.[id] };
      d.collations = Array.isArray(d.collations) ? d.collations.filter(Boolean) : d.collations ? [d.collations] : [];
      return [id, d];
    })
  );
  return {
    mealPrepPlan: '',
    prepChecks: {},
    extraGroceries: [],
    ...menu,
    id: menu?.id || `menu_${Date.now()}_${index}`,
    name: menu?.name || `Menu ${index + 1}`,
    days,
  };
}

function normalizeMeal(meal) {
  return {
    mealTypes: [],
    assignedTo: [],
    instructions: '',
    notes: '',
    ...meal,
    macros: { calories: '', protein: '', carbs: '', fat: '', fiber: '', ...meal.macros },
    ingredients: (meal.ingredients || []).map(ingredientToLine).filter(Boolean),
  };
}

// L'ancien format de membre (chiffres structurés) est converti vers le format éditable.
function normalizeMember(m) {
  if (!m) return null;
  if ('nutritionTargets' in m || 'avatarUrl' in m) {
    const t = m.nutritionTargets || {};
    const unit = (v, u) => (v == null || v === '' ? '' : `${v}${u}`);
    return createMember({
      id: m.id,
      name: m.name,
      role: m.role,
      age: m.age ? `${m.age} ans` : '',
      avatar: m.avatarUrl || '',
      objective: m.objective || '',
      height: unit(m.heightCm, ' cm'),
      currentWeight: unit(m.currentWeightKg, ' kg'),
      targetWeight: unit(m.targetWeightKg, ' kg'),
      activity: m.activityLevel || '',
      calories: unit(t.calories, ''),
      protein: unit(t.proteinG, ' g'),
      carbs: unit(t.carbsG, ' g'),
      fat: unit(t.fatG, ' g'),
      fiber: unit(t.fiberG, ' g'),
      hydration: unit(t.hydrationL, ' L'),
      restrictions: m.restrictions || [],
      conditions: (m.healthConsiderations || []).map((h) => h.label).filter(Boolean),
      likes: m.preferences?.likes || [],
      dislikes: m.preferences?.dislikes || [],
      tags: m.tags || [],
      activeProfile: m.isActiveInRecommendations !== false,
    });
  }
  const base = createMember();
  return { ...base, ...m, habits: { ...base.habits, ...m.habits } };
}

/** Rend n'importe quel état (ancien, importé, partiel) utilisable par l'app. */
export function normalizeState(raw) {
  if (!isObject(raw)) return createInitialState();

  const menusRaw = raw.menus || raw.weeklyMenus;
  const menus = (Array.isArray(menusRaw) && menusRaw.length ? menusRaw : createInitialState().menus).map(normalizeMenu);
  const membersRaw = Array.isArray(raw.householdMembers) && raw.householdMembers.length ? raw.householdMembers : DEFAULT_MEMBERS;

  return {
    version: 2,
    meals: Array.isArray(raw.meals) ? raw.meals.filter(isObject).map(normalizeMeal) : [],
    menus,
    activeMenuId: menus.some((m) => m.id === raw.activeMenuId) ? raw.activeMenuId : menus[0].id,
    images: isObject(raw.images) ? raw.images : {},
    groceryChecks: isObject(raw.groceryChecks) ? raw.groceryChecks : isObject(raw.checkedItems) ? raw.checkedItems : {},
    householdMembers: membersRaw.map(normalizeMember).filter(Boolean),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state = createInitialState();
      // Profils édités dans l'ancienne page « Membres du logis », stockés à part.
      const legacy = JSON.parse(localStorage.getItem(LEGACY_MEMBERS_KEY) || 'null');
      if (Array.isArray(legacy) && legacy.length) state.householdMembers = legacy.map(normalizeMember);
      return state;
    }
    const state = normalizeState(JSON.parse(raw));
    if (!JSON.parse(raw).householdMembers) {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_MEMBERS_KEY) || 'null');
      if (Array.isArray(legacy) && legacy.length) state.householdMembers = legacy.map(normalizeMember);
    }
    return state;
  } catch (error) {
    console.error('Chargement des données impossible :', error);
    return createInitialState();
  }
}

/** Retourne false si le navigateur refuse (quota plein, navigation privée). */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Sauvegarde impossible :', error);
    return false;
  }
}

export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_MEMBERS_KEY);
  } catch {
    /* stockage indisponible : rien à effacer */
  }
}

export function storageUsage() {
  try {
    return (localStorage.getItem(STORAGE_KEY) || '').length * 2;
  } catch {
    return 0;
  }
}

export async function readBackup(file) {
  const parsed = JSON.parse(await file.text());
  if (!isObject(parsed) || (!parsed.meals && !parsed.menus)) {
    throw new Error('Ce fichier ne ressemble pas à une sauvegarde Hearthsmith.');
  }
  return normalizeState(parsed);
}
