// =============================================================
//  GroceryList.jsx — Liste d'épicerie générée depuis le menu
// =============================================================

import { useState } from 'react';
import { exportGroceryCSV } from '../utils/files.js';
import { formatQuantity, formatUnit } from '../utils/ingredients.js';
import { Card, EmptyState, PageHeader, Progress, useToast } from './ui.jsx';

const CATEGORY_ICONS = {
  'Fruits et légumes': '🥕',
  'Viandes et poissons': '🍗',
  'Produits laitiers et oeufs': '🥚',
  'Boulangerie et céréales': '🌾',
  'Garde-manger': '🫙',
  Surgelés: '❄️',
  Autres: '🧺',
};

export default function GroceryList({ menu, groceryList, checks, actions, onGoTo }) {
  const notify = useToast();
  const [hideDone, setHideDone] = useState(false);
  const [extra, setExtra] = useState('');

  const total = groceryList.items.length;
  const done = groceryList.items.filter((i) => checks[i.key]?.done).length;

  function addExtra(e) {
    e.preventDefault();
    const line = extra.trim();
    if (!line) return;
    actions.updateMenu(menu.id, { extraGroceries: [...(menu.extraGroceries || []), line] });
    setExtra('');
  }

  return (
    <div className="page printable">
      <PageHeader
        icon="🛒"
        title="Épicerie"
        subtitle={`Générée automatiquement à partir de « ${menu.name} ». Les quantités des recettes sont additionnées.`}
        actions={
          <div className="toolbar no-print">
            <button type="button" className="btn btn--parchment" onClick={() => window.print()} disabled={!total}>
              🖨 Imprimer
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!total}
              onClick={() => {
                exportGroceryCSV(groceryList, checks, menu.name);
                notify('Liste exportée en CSV');
              }}
            >
              ⇩ Exporter CSV
            </button>
          </div>
        }
      />

      {total === 0 && !(menu.extraGroceries || []).length ? (
        <EmptyState
          icon="🧺"
          title="Rien à acheter pour l’instant"
          action={
            <button type="button" className="btn btn--primary" onClick={() => onGoTo('semaine')}>
              Planifier la semaine
            </button>
          }
        >
          Ajoutez des recettes avec des ingrédients au menu de la semaine : la liste se remplira toute seule.
        </EmptyState>
      ) : (
        <>
          <div className="grocery-bar no-print">
            <div className="grocery-bar__progress">
              <strong>
                {done} / {total} articles
              </strong>
              <Progress value={done} max={total} label="Articles cochés" />
            </div>
            <label className="switch">
              <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
              <span>Masquer les articles cochés</span>
            </label>
            {done > 0 && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => actions.resetGroceryChecks(menu.id)}>
                Tout décocher
              </button>
            )}
          </div>

          <form className="grocery-add no-print" onSubmit={addExtra}>
            <input
              className="input"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Ajouter un article hors recette : 2 l lait, papier essuie-tout…"
              aria-label="Ajouter un article"
            />
            <button type="submit" className="btn btn--parchment">
              Ajouter
            </button>
          </form>

          <div className="grocery-columns">
            {groceryList.byCategory.map(({ category, items }) => {
              const shown = hideDone ? items.filter((i) => !checks[i.key]?.done) : items;
              if (!shown.length) return null;
              return (
                <Card key={category} title={category} icon={CATEGORY_ICONS[category]} className="grocery-card">
                  <ul className="grocery-list">
                    {shown.map((item) => {
                      const isDone = Boolean(checks[item.key]?.done);
                      const qty = [formatQuantity(item.quantity), formatUnit(item.unit, item.quantity)].filter(Boolean).join(' ');
                      return (
                        <li key={item.key} className={isDone ? 'is-done' : ''}>
                          <label>
                            <input type="checkbox" checked={isDone} onChange={() => actions.toggleGrocery(menu.id, item.key)} />
                            <span className="grocery-list__name">
                              {item.name}
                              {qty && <b>{qty}{item.hasUnknownQuantity ? ' +' : ''}</b>}
                            </span>
                          </label>
                          <small title={item.meals.join(', ')}>{item.meals.join(' · ')}</small>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              );
            })}
          </div>

          {(menu.extraGroceries || []).length > 0 && (
            <p className="hint no-print">
              Articles ajoutés à la main :{' '}
              {menu.extraGroceries.map((line, i) => (
                <button
                  key={`${line}-${i}`}
                  type="button"
                  className="tag tag--removable"
                  onClick={() => actions.updateMenu(menu.id, { extraGroceries: menu.extraGroceries.filter((_, j) => j !== i) })}
                  title="Retirer"
                >
                  {line} ✕
                </button>
              ))}
            </p>
          )}
        </>
      )}
    </div>
  );
}
