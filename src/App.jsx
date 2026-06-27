// =============================================================
//  App.jsx — Composant racine : état global + navigation
// -------------------------------------------------------------
//  Détient tout l'état (repas, menus, images, cases cochées),
//  le persiste dans localStorage, et distribue les données et les
//  handlers à chaque onglet.
// =============================================================

import React, { useEffect, useMemo, useState } from 'react';
import {
  loadState,
  saveState,
  resetState,
  importBackup,
} from './utils/storageUtils.js';
import { generateGroceryList } from './utils/groceryUtils.js';
import { exportGroceryCSV, printSection } from './utils/exportUtils.js';

import WeeklyMenu from './components/WeeklyMenu.jsx';
import MealLibrary from './components/MealLibrary.jsx';
import GroceryList from './components/GroceryList.jsx';
import MealPrep from './components/MealPrep.jsx';
import MenuBuilder from './components/MenuBuilder.jsx';
import ImageManager from './components/ImageManager.jsx';
import ExportPanel from './components/ExportPanel.jsx';
import AIAssistant from './components/AIAssistant.jsx';
import HouseholdMembers from './components/HouseholdMembers.jsx';
import { MealCardDetail } from './components/MealCard.jsx';
import './App.css';

const DEFAULT_HOUSEHOLD_MEMBERS = [
  {
    id: 'member_anne_marie',
    name: 'Anne-Marie',
    role: 'Adulte',
    age: 34,
    avatarUrl: '',
    tags: ['Sans gluten', 'Sans lactose', 'Faible FODMAP', 'Stéatose hépatique'],
    objective: 'Manger simple et compatible avec ses besoins de santé pour se sentir bien au quotidien.',
    heightCm: 168,
    currentWeightKg: 64,
    targetWeightKg: 60,
    activityLevel: 'Modérée',
    nutritionTargets: {
      calories: 1600,
      proteinG: 110,
      carbsG: 120,
      fatG: 55,
      fiberG: 28,
      hydrationL: 2,
    },
    restrictions: [
      'Sans gluten',
      'Sans lactose',
      'Faible FODMAP',
      'Éviter les légumineuses',
    ],
    healthConsiderations: [
      {
        label: 'Stéatose hépatique',
        severity: 'important',
        notes: 'À considérer dans les choix alimentaires.',
      },
    ],
    preferences: {
      likes: ['Poulet', 'Dinde', 'Saumon', 'Riz', 'Patates', 'Quinoa', 'Légumes rôtis', 'Soupes simples'],
      dislikes: ['Légumineuses', 'Oignons crus', 'Aubergines', 'Plats trop épicés'],
      notes: 'Préfère les lunchs froids et simples.',
    },
    lifestyle: {
      schedule: 'Travail de bureau · 9h–17h',
      lunchNeeds: 'Lunchs froids ou faciles à préparer',
      training: '3x / semaine',
      sleep: 'Variable',
      cookingTime: '30 à 45 min / jour',
    },
    isActiveInRecommendations: true,
  },
  {
    id: 'member_samuel',
    name: 'Samuel',
    role: 'Adulte',
    age: 34,
    avatarUrl: '',
    tags: ['Haute protéine', 'Fibres'],
    objective: 'Soutenir l’énergie, l’entraînement et une alimentation riche en protéines.',
    heightCm: 188,
    currentWeightKg: 121,
    targetWeightKg: null,
    activityLevel: 'Active',
    nutritionTargets: {
      calories: 2400,
      proteinG: 145,
      carbsG: 250,
      fatG: 50,
      fiberG: 35,
      hydrationL: 2.5,
    },
    restrictions: [],
    healthConsiderations: [],
    preferences: {
      likes: ['Poulet', 'Œufs', 'Riz', 'Patates', 'Légumes', 'Repas protéinés'],
      dislikes: [],
      notes: 'Prioriser les protéines et les fibres.',
    },
    lifestyle: {
      schedule: 'Travail variable',
      lunchNeeds: 'Lunchs efficaces et soutenants',
      training: 'Cardio + musculation',
      sleep: 'À optimiser',
      cookingTime: 'Variable',
    },
    isActiveInRecommendations: true,
  },
  {
    id: 'member_jeanne',
    name: 'Jeanne',
    role: 'Enfant',
    age: 6,
    avatarUrl: '',
    tags: ['Préférences enfant'],
    objective: 'Prévoir des repas simples, rassasiants et adaptés aux goûts d’enfant.',
    heightCm: null,
    currentWeightKg: null,
    targetWeightKg: null,
    activityLevel: 'Enfant active',
    nutritionTargets: {
      calories: null,
      proteinG: null,
      carbsG: null,
      fatG: null,
      fiberG: null,
      hydrationL: null,
    },
    restrictions: [],
    healthConsiderations: [],
    preferences: {
      likes: ['Repas simples', 'Fruits', 'Pâtes', 'Poulet'],
      dislikes: [],
      notes: 'Adapter les portions et garder des options simples.',
    },
    lifestyle: {
      schedule: 'École / garderie',
      lunchNeeds: 'Lunchs enfant compatibles',
      training: '',
      sleep: '',
      cookingTime: '',
    },
    isActiveInRecommendations: true,
  },
  {
    id: 'member_eleonore',
    name: 'Éléonore',
    role: 'Enfant',
    age: 2,
    avatarUrl: '',
    tags: ['Portions adaptées'],
    objective: 'Prévoir des portions simples, sécuritaires et adaptées à son âge.',
    heightCm: null,
    currentWeightKg: null,
    targetWeightKg: null,
    activityLevel: 'Jeune enfant',
    nutritionTargets: {
      calories: null,
      proteinG: null,
      carbsG: null,
      fatG: null,
      fiberG: null,
      hydrationL: null,
    },
    restrictions: [],
    healthConsiderations: [],
    preferences: {
      likes: ['Textures simples', 'Fruits', 'Repas doux'],
      dislikes: [],
      notes: 'Portions réduites, textures adaptées.',
    },
    lifestyle: {
      schedule: 'Routine jeune enfant',
      lunchNeeds: 'Portions adaptées',
      training: '',
      sleep: '',
      cookingTime: '',
    },
    isActiveInRecommendations: true,
  },
];

const FAMILY_MEMBERS = DEFAULT_HOUSEHOLD_MEMBERS.map((member) => ({
  id: member.id,
  label: member.name,
}));

const MEAL_TYPES = [
  { id: 'dejeuner', label: 'Déjeuner' },
  { id: 'diner', label: 'Dîner' },
  { id: 'souper', label: 'Souper' },
  { id: 'collation', label: 'Collation' },
];

const createEmptyMeal = () => ({
  id: `meal_${Date.now()}`,
  name: '',
  image: '',
  mealTypes: [],
  macros: {
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
  },
  assignedTo: [],
  ingredients: [],
  instructions: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const TABS = [
  { key: 'menu', label: 'Menu hebdo', icon: '🗓' },
  { key: 'library', label: 'Cartes repas', icon: '🍽' },
  { key: 'grocery', label: 'Épicerie', icon: '🛒' },
  { key: 'prep', label: 'Meal prep', icon: '🧑‍🍳' },
  { key: 'builder', label: 'Créer un menu', icon: '✏️' },
  { key: 'members', label: 'Membres du logis', icon: '👨‍👩‍👧‍👧' },
  { key: 'images', label: 'Images', icon: '🖼' },
  { key: 'ai', label: 'Assistant AI', icon: '✨' },
  { key: 'backup', label: 'Sauvegarde', icon: '💾' },
];

// Crée un menu vide (7 jours, toutes les cases nulles).
function blankMenu(existingCount) {
  const JOURS = [
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
    'dimanche',
  ];
  const days = {};
  JOURS.forEach((j) => {
    days[j] = {
      dejeuner: '',
      diner: '',
      souper: '',
      collations: [],
      notes: '',
      mealPrep: '',
    };
  });
  return {
    id: `menu-${Date.now()}`,
    name: `Mon menu ${existingCount + 1}`,
    description: 'Menu personnalisé',
    days,
  };
}

export default function App() {
  const [state, setState] = useState(() => {
    const saved = loadState();

    if (saved) {
      return {
        ...saved,
        menus: saved.menus || saved.weeklyMenus || [],
        meals: saved.meals || [],
        images: saved.images || {},
        groceryChecks: saved.groceryChecks || saved.checkedItems || {},
        householdMembers: saved.householdMembers || DEFAULT_HOUSEHOLD_MEMBERS,
        activeMenuId: saved.activeMenuId || null,
      };
    }

    const firstMenu = blankMenu(0);

    return {
      menus: [firstMenu],
      activeMenuId: firstMenu.id,
      meals: [],
      images: {},
      groceryChecks: {},
      householdMembers: DEFAULT_HOUSEHOLD_MEMBERS,
    };
  });
  const [tab, setTab] = useState('menu');
  const [selectedMealId, setSelectedMealId] = useState(null);

  // Persistance automatique à chaque changement d'état.
  useEffect(() => {
    saveState(state);
  }, [state]);

  const {
    meals = [],
    menus = [],
    activeMenuId = null,
    images = {},
    groceryChecks = {},
    householdMembers = DEFAULT_HOUSEHOLD_MEMBERS,
  } = state || {};

  const mealsById = useMemo(
    () => Object.fromEntries(meals.map((m) => [m.id, m])),
    [meals]
  );
  const activeMenu = useMemo(
    () => menus.find((m) => m.id === activeMenuId) || menus[0] || null,
    [menus, activeMenuId]
  );
  const groceryList = useMemo(
    () =>
      activeMenu
        ? generateGroceryList(activeMenu, mealsById)
        : { byCategory: {}, items: [] },
    [activeMenu, mealsById]
  );
  const currentChecks = (activeMenu && groceryChecks[activeMenu.id]) || {};

  // ---- Helpers d'état ----
  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  // ---- Repas ----
  const handleAddMeal = () => {
    const newMeal = createEmptyMeal();

    setState((prev) => ({
      ...prev,
      meals: [...(prev.meals || []), newMeal],
    }));

    return newMeal.id;
  };

  const handleUpdateMeal = (mealId, updates) => {
    setState((prev) => ({
      ...prev,
      meals: (prev.meals || []).map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : meal
      ),
    }));
  };

  const handleDeleteMeal = (mealId) => {
    setState((prev) => ({
      ...prev,
      meals: (prev.meals || []).filter((meal) => meal.id !== mealId),
    }));
  };

  const handleDuplicateMeal = (mealId) => {
    setState((prev) => {
      const mealToDuplicate = (prev.meals || []).find(
        (meal) => meal.id === mealId
      );

      if (!mealToDuplicate) return prev;

      const duplicatedMeal = {
        ...mealToDuplicate,
        id: `meal_${Date.now()}`,
        name: `${mealToDuplicate.name || 'Repas'} — copie`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        meals: [...(prev.meals || []), duplicatedMeal],
      };
    });
  };

  // ---- Liste d'épicerie : cocher déjà / à acheter ----
  const handleToggleCheck = (itemKey, field) => {
    if (!activeMenu) return;
    setState((prev) => {
      const menuChecks = { ...(prev.groceryChecks[activeMenu.id] || {}) };
      const item = { ...(menuChecks[itemKey] || {}) };
      item[field] = !item[field];
      menuChecks[itemKey] = item;
      return {
        ...prev,
        groceryChecks: { ...prev.groceryChecks, [activeMenu.id]: menuChecks },
      };
    });
  };

  // ---- Menus ----
  const handleUpdateMenu = (updated) =>
    setState((prev) => ({
      ...prev,
      menus: prev.menus.map((m) => (m.id === updated.id ? updated : m)),
    }));

  const handleCreateMenu = () =>
    setState((prev) => {
      const m = blankMenu(prev.menus.length);
      return { ...prev, menus: [...prev.menus, m], activeMenuId: m.id };
    });

  const handleDuplicateMenu = (id) =>
    setState((prev) => {
      const src = prev.menus.find((m) => m.id === id);
      if (!src) return prev;
      const copy = {
        ...JSON.parse(JSON.stringify(src)),
        id: `menu-${Date.now()}`,
        name: `${src.name} (copie)`,
      };
      return { ...prev, menus: [...prev.menus, copy], activeMenuId: copy.id };
    });

  const handleRenameMenu = (id, name) =>
    setState((prev) => ({
      ...prev,
      menus: prev.menus.map((m) => (m.id === id ? { ...m, name } : m)),
    }));

  const handleDeleteMenu = (id) =>
    setState((prev) => {
      const menus = prev.menus.filter((m) => m.id !== id);
      const activeMenuId =
        prev.activeMenuId === id ? menus[0]?.id ?? null : prev.activeMenuId;
      return { ...prev, menus, activeMenuId };
    });

      // ---- Membres du logis ----
  const handleUpdateHouseholdMember = (memberId, updates) => {
    setState((prev) => ({
      ...prev,
      householdMembers: (prev.householdMembers || DEFAULT_HOUSEHOLD_MEMBERS).map((member) =>
        member.id === memberId
          ? {
              ...member,
              ...updates,
            }
          : member
      ),
    }));
  };

  const handleAddHouseholdMember = () => {
    const newMember = {
      id: `member_${Date.now()}`,
      name: 'Nouveau membre',
      role: 'Membre du logis',
      age: '',
      avatarUrl: '',
      tags: [],
      objective: '',
      heightCm: null,
      currentWeightKg: null,
      targetWeightKg: null,
      activityLevel: '',
      nutritionTargets: {
        calories: null,
        proteinG: null,
        carbsG: null,
        fatG: null,
        fiberG: null,
        hydrationL: null,
      },
      restrictions: [],
      healthConsiderations: [],
      preferences: {
        likes: [],
        dislikes: [],
        notes: '',
      },
      lifestyle: {
        schedule: '',
        lunchNeeds: '',
        training: '',
        sleep: '',
        cookingTime: '',
      },
      isActiveInRecommendations: true,
    };

    setState((prev) => ({
      ...prev,
      householdMembers: [
        ...(prev.householdMembers || DEFAULT_HOUSEHOLD_MEMBERS),
        newMember,
      ],
    }));

    return newMember.id;
  };

  // ---- Images ----
  const handleSetImage = (mealId, dataURL) =>
    setState((prev) => ({
      ...prev,
      images: { ...prev.images, [mealId]: dataURL },
    }));
  const handleClearImage = (mealId) =>
    setState((prev) => {
      const images = { ...prev.images };
      delete images[mealId];
      return { ...prev, images };
    });

  // ---- Assistant AI ----
  const handleApplyAIResult = (result) => {
    if (!result) return;

    setState((prev) => {
      let next = {
        ...prev,
        meals: prev.meals || [],
        menus: prev.menus || [],
        images: prev.images || {},
        groceryChecks: prev.groceryChecks || {},
      };

      if (Array.isArray(result.createMeals)) {
        const newMeals = result.createMeals.map((meal, index) => ({
          ...createEmptyMeal(),
          ...meal,
          id: meal.id || `meal_ai_${Date.now()}_${index}`,
          image: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        next = {
          ...next,
          meals: [...next.meals, ...newMeals],
        };
      }

      if (Array.isArray(result.updateMeals)) {
        next = {
          ...next,
          meals: next.meals.map((existingMeal) => {
            const update = result.updateMeals.find(
              (item) => item.id === existingMeal.id
            );

            if (!update) return existingMeal;

            return {
              ...existingMeal,
              ...update,
              id: existingMeal.id,
              updatedAt: new Date().toISOString(),
            };
          }),
        };
      }

      if (result.weeklyMenu) {
        const menuId =
          result.weeklyMenu.id || next.activeMenuId || `menu-${Date.now()}`;

        const existingMenu = next.menus.find((menu) => menu.id === menuId);

        const nextMenu = {
          ...(existingMenu || blankMenu(next.menus.length)),
          ...result.weeklyMenu,
          id: menuId,
        };

        const menuExists = next.menus.some((menu) => menu.id === menuId);

        next = {
          ...next,
          menus: menuExists
            ? next.menus.map((menu) => (menu.id === menuId ? nextMenu : menu))
            : [...next.menus, nextMenu],
          activeMenuId: menuId,
        };
      }

      return next;
    });
  };

  // ---- Sauvegarde / reset ----
  const handleImport = async (file) => {
    const next = await importBackup(file);
    setState(next);
  };
  const handleReset = () => {
    setState(resetState());
    setTab('menu');
  };

  // ---- Exports ----
  const handleExportCSV = () =>
    exportGroceryCSV(groceryList, currentChecks, activeMenu?.name || 'menu');
  const handlePrint = (section) => printSection(section);

  const openMeal = (id) => setSelectedMealId(id);
  const selectedMeal = selectedMealId ? mealsById[selectedMealId] : null;

  return (
    <div className="hs-app">
      <header className="hs-topbar no-print">
        <div className="hs-brand">
          <img
            src="/brand/Hearthsmith_Full logo.png"
            alt="HearthSmith"
            className="hs-brand__crest"
          />

          <img
            src="/brand/Hearthsmith_Wordmark.png"
            alt="HearthSmith"
            className="hs-brand__wordmark"
          />
        </div>

        <div className="hs-family-switcher">
          <div className="hs-family-avatar" aria-hidden="true">
            👩
          </div>

          <div className="hs-family-switcher__text">
            <strong>Famille Hearthsmith</strong>
            <span>👥 {FAMILY_MEMBERS.length} membres</span>
          </div>

          <button className="hs-icon-button" type="button" aria-label="Changer de famille">
           ⌄
          </button>

          <button className="hs-settings-button" type="button" aria-label="Paramètres">
            ⚙
          </button>
        </div>
      </header>

      <nav className="hs-nav no-print" aria-label="Navigation principale">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`hs-nav__btn ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="hs-nav__icon" aria-hidden="true">
              {t.icon}
            </span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="hs-main">
        {tab === 'menu' && (
          <WeeklyMenu
            menu={activeMenu}
            mealsById={mealsById}
            images={images}
            onOpenMeal={openMeal}
            onPrint={handlePrint}
          />
        )}

        {tab === 'library' && (
          <MealLibrary
            meals={meals}
            images={images}
            mealTypes={MEAL_TYPES}
            familyMembers={FAMILY_MEMBERS}
            onAddMeal={handleAddMeal}
            onUpdateMeal={handleUpdateMeal}
            onDeleteMeal={handleDeleteMeal}
            onDuplicateMeal={handleDuplicateMeal}
            onSetImage={handleSetImage}
            onClearImage={handleClearImage}
          />
        )}

        {tab === 'grocery' && (
          <GroceryList
            groceryList={groceryList}
            checks={currentChecks}
            onToggle={handleToggleCheck}
            onExportCSV={handleExportCSV}
            onPrint={handlePrint}
          />
        )}

        {tab === 'prep' && (
          <MealPrep
            menu={activeMenu}
            mealsById={mealsById}
            onPrint={handlePrint}
          />
        )}

        {tab === 'builder' && (
          <MenuBuilder
            menus={menus}
            meals={meals}
            activeMenu={activeMenu}
            onUpdateMenu={handleUpdateMenu}
            onCreateMenu={handleCreateMenu}
            onDuplicate={handleDuplicateMenu}
            onRename={handleRenameMenu}
            onDelete={handleDeleteMenu}
          />
        )}

{tab === 'members' && (
          <HouseholdMembers
            members={householdMembers}
            meals={meals}
            menus={menus}
            activeMenu={activeMenu}
            onAddMember={handleAddHouseholdMember}
            onUpdateMember={handleUpdateHouseholdMember}
          />
        )}

        {tab === 'images' && (
          <ImageManager
            meals={meals}
            images={images}
            onSetImage={handleSetImage}
            onClearImage={handleClearImage}
          />
        )}

        {tab === 'ai' && (
          <AIAssistant
            state={state}
            meals={meals}
            menus={menus}
            activeMenu={activeMenu}
            mealTypes={MEAL_TYPES}
            familyMembers={FAMILY_MEMBERS}
            onApplyResult={handleApplyAIResult}
          />
        )}

        {tab === 'backup' && (
          <ExportPanel
            state={state}
            onImport={handleImport}
            onReset={handleReset}
            onPrint={handlePrint}
            onExportCSV={handleExportCSV}
          />
        )}
      </main>

      <footer className="hs-footer no-print">
        <p>
          Astuce : HearthSmith garde vos menus, recettes, images et listes en mémoire
          locale dans votre navigateur.
        </p>
      </footer>

      {selectedMeal && (
        <MealCardDetail
          meal={selectedMeal}
          image={images[selectedMeal.id]}
          onClose={() => setSelectedMealId(null)}
        />
      )}
    </div>
  );
}
