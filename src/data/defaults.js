// =============================================================
//  defaults.js — Constantes et données de départ
// =============================================================

export const DAYS = [
  { id: 'lundi', label: 'Lundi', short: 'Lun' },
  { id: 'mardi', label: 'Mardi', short: 'Mar' },
  { id: 'mercredi', label: 'Mercredi', short: 'Mer' },
  { id: 'jeudi', label: 'Jeudi', short: 'Jeu' },
  { id: 'vendredi', label: 'Vendredi', short: 'Ven' },
  { id: 'samedi', label: 'Samedi', short: 'Sam' },
  { id: 'dimanche', label: 'Dimanche', short: 'Dim' },
];

export const MEAL_TYPES = [
  { id: 'dejeuner', label: 'Déjeuner', icon: '☀️' },
  { id: 'diner', label: 'Dîner', icon: '🥪' },
  { id: 'souper', label: 'Souper', icon: '🍲' },
  { id: 'collation', label: 'Collation', icon: '🍎' },
];

// Cases d'une journée. « collations » est une liste, les autres un id de repas.
export const SLOTS = [
  { key: 'dejeuner', type: 'dejeuner', label: 'Déjeuner' },
  { key: 'diner', type: 'diner', label: 'Dîner' },
  { key: 'souper', type: 'souper', label: 'Souper' },
];

export const MACROS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protéines', unit: 'g' },
  { key: 'carbs', label: 'Glucides', unit: 'g' },
  { key: 'fat', label: 'Lipides', unit: 'g' },
  { key: 'fiber', label: 'Fibres', unit: 'g' },
];

export const uid = (prefix = 'id') =>
  `${prefix}_${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;

const nowIso = () => new Date().toISOString();

export function createEmptyMeal(overrides = {}) {
  return {
    id: uid('meal'),
    name: '',
    mealTypes: [],
    macros: { calories: '', protein: '', carbs: '', fat: '', fiber: '' },
    servings: '',
    prepTime: '',
    assignedTo: [],
    ingredients: [],
    instructions: '',
    notes: '',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...overrides,
  };
}

export function createBlankDay() {
  return { dejeuner: '', diner: '', souper: '', collations: [], notes: '', mealPrep: '' };
}

export function createBlankMenu(name = 'Ma semaine') {
  return {
    id: uid('menu'),
    name,
    days: Object.fromEntries(DAYS.map((d) => [d.id, createBlankDay()])),
    mealPrepPlan: '',
    prepChecks: {},
    extraGroceries: [],
  };
}

export function createMember(overrides = {}) {
  return {
    id: uid('member'),
    name: 'Nouveau membre',
    role: 'Adulte',
    age: '',
    avatar: '',
    objective: '',
    activeProfile: true,
    height: '',
    currentWeight: '',
    targetWeight: '',
    activity: '',
    nutritionGoal: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    hydration: '',
    restrictions: [],
    conditions: [],
    severity: 'Informationnel',
    likes: [],
    dislikes: [],
    habits: { schedule: '', homeMeals: '', lunch: '', training: '', sleep: '', kitchenTime: '', notes: '' },
    tags: [],
    ...overrides,
  };
}

export const DEFAULT_MEMBERS = [
  createMember({
    id: 'member_anne_marie',
    name: 'Anne-Marie',
    age: '34 ans',
    objective: 'Manger simple et compatible avec ses besoins de santé pour se sentir bien au quotidien.',
    height: '168 cm',
    currentWeight: '64 kg',
    targetWeight: '60 kg',
    activity: 'Modérée',
    nutritionGoal: 'Santé métabolique',
    calories: '1600',
    protein: '110 g',
    carbs: '120 g',
    fat: '55 g',
    fiber: '28 g',
    hydration: '2 L',
    restrictions: ['Sans gluten', 'Sans lactose', 'Faible FODMAP', 'Éviter les légumineuses'],
    conditions: ['Stéatose hépatique'],
    severity: 'Important',
    likes: ['Poulet', 'Dinde', 'Saumon', 'Riz', 'Patates', 'Quinoa', 'Légumes rôtis', 'Soupes simples'],
    dislikes: ['Légumineuses', 'Oignons crus', 'Aubergines', 'Plats trop épicés'],
    habits: {
      schedule: 'Travail de bureau · 9h–17h',
      homeMeals: 'Souper + fins de semaine',
      lunch: 'Lunchs froids ou faciles à préparer',
      training: '3x / semaine',
      sleep: 'Variable',
      kitchenTime: '30 à 45 min / jour',
      notes: 'Préfère les lunchs froids et simples.',
    },
    tags: ['Sans gluten', 'Sans lactose', 'Faible FODMAP'],
  }),
  createMember({
    id: 'member_samuel',
    name: 'Samuel',
    age: '34 ans',
    objective: 'Soutenir l’énergie, l’entraînement et une alimentation riche en protéines.',
    height: '188 cm',
    currentWeight: '121 kg',
    activity: 'Active',
    nutritionGoal: 'Haute protéine',
    calories: '2400',
    protein: '145 g',
    carbs: '250 g',
    fat: '50 g',
    fiber: '35 g',
    hydration: '2,5 L',
    likes: ['Œufs', 'Poulet', 'Riz', 'Patates', 'Cottage', 'Épinards'],
    habits: {
      schedule: 'Travail variable',
      homeMeals: 'Déjeuner + souper',
      lunch: 'Lunchs efficaces et soutenants',
      training: 'Cardio + musculation',
      sleep: 'À optimiser',
      kitchenTime: 'Variable',
      notes: 'Prioriser les protéines et les fibres.',
    },
    tags: ['Haute protéine', 'Fibres'],
  }),
  createMember({
    id: 'member_jeanne',
    name: 'Jeanne',
    role: 'Enfant',
    age: '6 ans',
    objective: 'Des repas simples, rassasiants et adaptés aux goûts d’enfant.',
    activity: 'Enfant active',
    likes: ['Repas simples', 'Fruits', 'Pâtes', 'Poulet'],
    habits: {
      schedule: 'École',
      homeMeals: 'Déjeuner + souper',
      lunch: 'Lunch d’école',
      training: '',
      sleep: '',
      kitchenTime: '',
      notes: 'Adapter les portions et garder des options simples.',
    },
    tags: ['Goûts d’enfant'],
  }),
  createMember({
    id: 'member_eleonore',
    name: 'Éléonore',
    role: 'Enfant',
    age: '2 ans',
    objective: 'Des portions simples, sécuritaires et adaptées à son âge.',
    activity: 'Jeune enfant',
    likes: ['Textures simples', 'Fruits', 'Repas doux'],
    habits: {
      schedule: 'Garderie',
      homeMeals: 'Tous les repas',
      lunch: 'Portions adaptées',
      training: '',
      sleep: '',
      kitchenTime: '',
      notes: 'Portions réduites, textures adaptées.',
    },
    tags: ['Portions adaptées'],
  }),
];

// Recettes d'exemple : compatibles sans gluten / sans lactose pour la famille.
const SAMPLE_MEALS = [
  {
    id: 'sample_omelette',
    name: 'Omelette aux épinards et patates rôties',
    mealTypes: ['dejeuner'],
    macros: { calories: 420, protein: 28, carbs: 32, fat: 19, fiber: 5 },
    servings: 4,
    prepTime: 20,
    ingredients: ['8 oeufs', '2 tasses épinards', '600 g patates grelots', '1 c. à soupe huile d’olive', '1 poivron rouge'],
    instructions: 'Couper les patates en deux et les rôtir 20 min à 220 °C.\nFaire revenir le poivron et les épinards.\nAjouter les oeufs battus et cuire à feu doux.',
    notes: 'Se réchauffe bien pour les lunchs.',
  },
  {
    id: 'sample_gruau',
    name: 'Gruau sans gluten aux petits fruits',
    mealTypes: ['dejeuner', 'collation'],
    macros: { calories: 340, protein: 14, carbs: 52, fat: 8, fiber: 7 },
    servings: 4,
    prepTime: 10,
    ingredients: ['2 tasses flocons d’avoine sans gluten', '4 tasses boisson d’amande', '2 tasses petits fruits', '2 c. à soupe sirop d’érable', '4 c. à soupe graines de chia'],
    instructions: 'Cuire l’avoine dans la boisson d’amande 5 min.\nGarnir de petits fruits, de chia et d’un filet de sirop d’érable.',
    notes: '',
  },
  {
    id: 'sample_bol_poulet',
    name: 'Bol de poulet, riz et légumes rôtis',
    mealTypes: ['diner', 'souper'],
    macros: { calories: 560, protein: 42, carbs: 58, fat: 16, fiber: 6 },
    servings: 4,
    prepTime: 35,
    ingredients: ['700 g poitrines de poulet', '2 tasses riz basmati', '2 courgettes', '1 brocoli', '2 carottes', '3 c. à soupe huile d’olive', '1 citron'],
    instructions: 'Cuire le riz.\nRôtir les légumes 25 min à 220 °C.\nGriller le poulet assaisonné et trancher.\nMonter les bols avec un filet de citron.',
    notes: 'Parfait pour le meal prep du dimanche.',
  },
  {
    id: 'sample_saumon',
    name: 'Saumon à l’érable, quinoa et haricots verts',
    mealTypes: ['souper'],
    macros: { calories: 610, protein: 40, carbs: 48, fat: 26, fiber: 7 },
    servings: 4,
    prepTime: 30,
    ingredients: ['4 filets de saumon', '1,5 tasse quinoa', '400 g haricots verts', '3 c. à soupe sirop d’érable', '2 c. à soupe sauce tamari sans gluten'],
    instructions: 'Cuire le quinoa.\nBadigeonner le saumon du mélange érable-tamari et cuire 12 min à 200 °C.\nCuire les haricots verts à la vapeur.',
    notes: '',
  },
  {
    id: 'sample_soupe',
    name: 'Soupe-repas dinde et riz',
    mealTypes: ['diner', 'souper'],
    macros: { calories: 380, protein: 30, carbs: 40, fat: 9, fiber: 4 },
    servings: 6,
    prepTime: 40,
    ingredients: ['500 g dinde hachée', '1 tasse riz', '3 carottes', '2 branches céleri', '2 litres bouillon de poulet sans gluten', '1 c. à thé thym'],
    instructions: 'Dorer la dinde.\nAjouter les légumes, le bouillon et le thym.\nMijoter 20 min, ajouter le riz et cuire 15 min.',
    notes: 'Se congèle très bien.',
  },
  {
    id: 'sample_pates',
    name: 'Pâtes sans gluten bolognaise maison',
    mealTypes: ['souper'],
    macros: { calories: 590, protein: 35, carbs: 70, fat: 17, fiber: 6 },
    servings: 4,
    prepTime: 35,
    ingredients: ['450 g pâtes sans gluten', '500 g boeuf haché maigre', '1 boîte tomates broyées', '2 carottes', '1 courgette', '1 c. à thé origan'],
    instructions: 'Dorer le boeuf.\nAjouter les légumes râpés, les tomates et l’origan, mijoter 20 min.\nServir sur les pâtes.',
    notes: 'Les enfants adorent.',
  },
  {
    id: 'sample_collation',
    name: 'Pommes et beurre de graines de tournesol',
    mealTypes: ['collation'],
    macros: { calories: 210, protein: 6, carbs: 24, fat: 11, fiber: 5 },
    servings: 4,
    prepTime: 5,
    ingredients: ['4 pommes', '8 c. à soupe beurre de graines de tournesol'],
    instructions: 'Trancher les pommes et servir avec le beurre de graines.',
    notes: 'Sans noix, idéal pour l’école.',
  },
].map((meal) => createEmptyMeal({ ...meal, sample: true }));

function sampleMenu() {
  const menu = createBlankMenu('Semaine type');
  const plan = {
    lundi: ['sample_gruau', 'sample_bol_poulet', 'sample_saumon'],
    mardi: ['sample_omelette', 'sample_bol_poulet', 'sample_pates'],
    mercredi: ['sample_gruau', 'sample_soupe', 'sample_bol_poulet'],
    jeudi: ['sample_omelette', 'sample_soupe', 'sample_saumon'],
    vendredi: ['sample_gruau', 'sample_bol_poulet', 'sample_pates'],
    samedi: ['sample_omelette', 'sample_soupe', ''],
    dimanche: ['sample_gruau', '', 'sample_soupe'],
  };
  for (const [day, [dejeuner, diner, souper]] of Object.entries(plan)) {
    menu.days[day] = { ...menu.days[day], dejeuner, diner, souper, collations: ['sample_collation'] };
  }
  menu.days.dimanche.mealPrep = 'Cuire le riz et le poulet pour les lunchs de la semaine.';
  return menu;
}

export function createInitialState() {
  const menu = sampleMenu();
  return {
    version: 2,
    meals: SAMPLE_MEALS,
    menus: [menu],
    activeMenuId: menu.id,
    images: {},
    groceryChecks: {},
    householdMembers: DEFAULT_MEMBERS,
  };
}

export function createEmptyState() {
  const menu = createBlankMenu();
  return {
    version: 2,
    meals: [],
    menus: [menu],
    activeMenuId: menu.id,
    images: {},
    groceryChecks: {},
    householdMembers: DEFAULT_MEMBERS,
  };
}
