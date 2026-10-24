// =============================================================
//  App.jsx — Coquille de l'application : en-tête, navigation,
//  onglets et fenêtres partagées (fiche recette, éditeur).
// =============================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DAYS } from './data/defaults.js';
import { usePlanner } from './state/usePlanner.js';
import { generateGroceryList } from './utils/grocery.js';
import { findConflicts } from './utils/nutrition.js';

import Dashboard from './components/Dashboard.jsx';
import WeeklyMenu from './components/WeeklyMenu.jsx';
import MealLibrary from './components/MealLibrary.jsx';
import GroceryList from './components/GroceryList.jsx';
import MealPrep from './components/MealPrep.jsx';
import HouseholdMembers, { Avatar } from './components/HouseholdMembers.jsx';
import AIAssistant from './components/AIAssistant.jsx';
import ExportPanel from './components/ExportPanel.jsx';
import MealEditor from './components/MealEditor.jsx';
import { MealDetail } from './components/MealCard.jsx';
import { useToast } from './components/ui.jsx';
import Icon from './components/icons.jsx';

const TABS = [
  { key: 'accueil', label: 'Accueil', icon: 'home' },
  { key: 'semaine', label: 'Semaine', icon: 'calendar' },
  { key: 'recettes', label: 'Recettes', icon: 'book' },
  { key: 'epicerie', label: 'Épicerie', icon: 'basket' },
  { key: 'prep', label: 'Meal prep', icon: 'pot' },
  { key: 'logis', label: 'Logis', icon: 'users' },
  { key: 'assistant', label: 'Assistant', icon: 'sparkle' },
  { key: 'reglages', label: 'Réglages', icon: 'settings' },
];

const DAY_LABELS = Object.fromEntries(DAYS.map((d) => [d.id, d.short]));
const BASE = import.meta.env.BASE_URL;

// L'onglet courant vit dans l'adresse (#/epicerie) : on peut recharger ou partager le lien.
const tabFromHash = () => {
  const key = window.location.hash.replace(/^#\/?/, '');
  return TABS.some((t) => t.key === key) ? key : 'accueil';
};

export default function App() {
  const notify = useToast();
  const [state, actions] = usePlanner({
    onSaveError: () => notify('Stockage plein : retirez quelques photos ou faites une sauvegarde.', { tone: 'error' }),
  });
  const [tab, setTab] = useState(tabFromHash);
  const [viewMealId, setViewMealId] = useState(null);
  const [editMealId, setEditMealId] = useState(null);
  const [aiDraft, setAiDraft] = useState('');
  const [libraryQuery, setLibraryQuery] = useState('');

  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goTo = useCallback((key) => {
    window.location.hash = `/${key}`;
    setTab(key);
    window.scrollTo({ top: 0 });
  }, []);

  const { meals, menus, images, groceryChecks, householdMembers: members } = state;
  const mealsById = useMemo(() => Object.fromEntries(meals.map((m) => [m.id, m])), [meals]);
  const menu = menus.find((m) => m.id === state.activeMenuId) || menus[0];
  const groceryList = useMemo(() => generateGroceryList(menu, mealsById), [menu, mealsById]);

  const conflictCount = useMemo(
    () => members.filter((m) => m.activeProfile).reduce((n, m) => n + findConflicts(m, menu, mealsById, DAY_LABELS).length, 0),
    [members, menu, mealsById],
  );

  const createMeal = useCallback(
    (overrides = {}) => {
      const id = actions.addMeal(overrides);
      setViewMealId(null);
      setEditMealId(id);
    },
    [actions],
  );

  const askAssistant = useCallback(
    (text) => {
      setAiDraft(text);
      goTo('assistant');
    },
    [goTo],
  );
  const clearDraft = useCallback(() => setAiDraft(''), []);

  const viewMeal = viewMealId && mealsById[viewMealId];
  const editMeal = editMealId && mealsById[editMealId];
  const activeMembers = members.filter((m) => m.activeProfile);

  return (
    <div className="app">
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>

      <aside className="sidebar no-print">
        <button type="button" className="brand" onClick={() => goTo('accueil')} aria-label="HearthSmith, accueil">
          <img src={`${BASE}brand/hearthsmith-embleme-ivoire.webp`} alt="" className="brand__crest" width="96" height="94" />
          <img src={`${BASE}brand/hearthsmith-wordmark-ivoire.webp`} alt="HearthSmith" className="brand__wordmark" width="900" height="272" />
        </button>

        <nav className="nav" aria-label="Navigation principale">
          {TABS.map((t) => (
            <a
              key={t.key}
              href={`#/${t.key}`}
              className={`nav__btn nav__btn--${t.key} ${tab === t.key ? 'is-active' : ''} ${t.key === 'reglages' ? 'nav__btn--end' : ''}`}
              aria-current={tab === t.key ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                goTo(t.key);
              }}
            >
              <Icon name={t.icon} className="nav__icon" />
              <span className="nav__label">{t.label}</span>
              {t.key === 'logis' && conflictCount > 0 && (
                <span className="nav__badge" title={`${conflictCount} alerte(s) de profil`}>
                  {conflictCount}
                </span>
              )}
            </a>
          ))}
        </nav>

        <button type="button" className="household" onClick={() => goTo('logis')} title="Membres du logis">
          <span className="household__avatars" aria-hidden="true">
            {activeMembers.slice(0, 4).map((m) => (
              <Avatar key={m.id} member={m} size="tiny" />
            ))}
          </span>
          <span className="household__text">
            <strong>Le logis</strong>
            <span>
              {activeMembers.length} membre{activeMembers.length > 1 ? 's' : ''} actif{activeMembers.length > 1 ? 's' : ''}
            </span>
          </span>
        </button>
      </aside>

      {/* Barre du haut : mobile et tablette seulement. */}
      <header className="topbar no-print">
        <button type="button" className="brand" onClick={() => goTo('accueil')} aria-label="HearthSmith, accueil">
          <img src={`${BASE}brand/hearthsmith-embleme-ivoire.webp`} alt="" className="brand__crest" width="44" height="43" />
          <img src={`${BASE}brand/hearthsmith-wordmark-ivoire.webp`} alt="HearthSmith" className="brand__wordmark" width="900" height="272" />
        </button>
        <button type="button" className="topbar__logis" onClick={() => goTo('logis')} aria-label={`Membres du logis${conflictCount ? `, ${conflictCount} alerte(s)` : ''}`}>
          <Icon name="users" size={22} />
          {conflictCount > 0 && <span className="nav__badge">{conflictCount}</span>}
        </button>
        <button type="button" className="icon-btn topbar__settings" onClick={() => goTo('reglages')} aria-label="Réglages">
          <Icon name="settings" />
        </button>
      </header>

      <div className="content">
        <main className="main" id="contenu">
          {tab === 'semaine' && (
            <WeeklyMenu
              menus={menus}
              menu={menu}
              meals={meals}
              mealsById={mealsById}
              images={images}
              actions={actions}
              conflictCount={conflictCount}
              onOpenMeal={setViewMealId}
              onCreateMeal={createMeal}
              onGoTo={goTo}
            />
          )}
          {tab === 'accueil' && (
            <Dashboard
              profileName={state.profileName}
              meals={meals}
              menu={menu}
              mealsById={mealsById}
              images={images}
              groceryList={groceryList}
              checks={groceryChecks[menu.id] || {}}
              conflictCount={conflictCount}
              onOpenMeal={setViewMealId}
              onGoTo={goTo}
              onSearch={(q) => {
                setLibraryQuery(q);
                goTo('recettes');
              }}
            />
          )}
          {tab === 'recettes' && (
            <MealLibrary meals={meals} images={images} menu={menu} initialQuery={libraryQuery} onEdit={setEditMealId} onCreate={createMeal} onGoTo={goTo} />
          )}
          {tab === 'epicerie' && (
            <GroceryList menu={menu} groceryList={groceryList} checks={groceryChecks[menu.id] || {}} prices={state.prices} actions={actions} onGoTo={goTo} />
          )}
          {tab === 'prep' && <MealPrep menu={menu} mealsById={mealsById} images={images} actions={actions} onOpenMeal={setViewMealId} onGoTo={goTo} />}
          {tab === 'logis' && (
            <HouseholdMembers members={members} menu={menu} mealsById={mealsById} actions={actions} onOpenMeal={setViewMealId} onAskAssistant={askAssistant} />
          )}
          {tab === 'assistant' && (
            <AIAssistant meals={meals} menu={menu} members={members} actions={actions} draft={aiDraft} onDraftUsed={clearDraft} onGoTo={goTo} />
          )}
          {tab === 'reglages' && <ExportPanel state={state} actions={actions} />}
        </main>

        <footer className="footer no-print">
          <p>HearthSmith garde vos recettes, menus et photos dans ce navigateur. Pensez à faire une sauvegarde de temps en temps.</p>
        </footer>
      </div>

      {viewMeal && (
        <MealDetail
          meal={viewMeal}
          image={images[viewMeal.id]}
          members={members}
          onClose={() => setViewMealId(null)}
          onEdit={(id) => {
            setViewMealId(null);
            setEditMealId(id);
          }}
        />
      )}
      {editMeal && (
        <MealEditor key={editMeal.id} meal={editMeal} image={images[editMeal.id]} members={members} actions={actions} onClose={() => setEditMealId(null)} />
      )}
    </div>
  );
}
