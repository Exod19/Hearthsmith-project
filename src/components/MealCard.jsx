// =============================================================
//  MealCard.jsx — Tuile de repas, fiche détaillée et sélecteur
// =============================================================

import { useMemo, useState } from 'react';
import { MACROS, MEAL_TYPES } from '../data/defaults.js';
import { MealImage, Modal } from './ui.jsx';
import Icon from './icons.jsx';

const typeLabels = (meal) =>
  (meal.mealTypes || []).map((id) => MEAL_TYPES.find((t) => t.id === id)?.label || id).join(' · ');

export function MacroLine({ meal, compact = false }) {
  const { calories } = meal.macros || {};
  const protein = compact ? '' : meal.macros?.protein;
  if (!calories && !protein) return null;
  return (
    <span className="macro-line">
      {calories ? `${calories} kcal` : ''}
      {calories && protein ? ' · ' : ''}
      {protein ? `${protein} g prot.` : ''}
    </span>
  );
}

export default function MealCard({ meal, image, onOpen, active }) {
  return (
    <button type="button" className={`meal-card ${active ? 'is-active' : ''}`} onClick={() => onOpen(meal.id)}>
      <MealImage meal={meal} image={image} />
      <span className="meal-card__body">
        <span className="meal-card__type">{typeLabels(meal) || 'Repas'}</span>
        <strong className="meal-card__name">{meal.name || 'Repas sans nom'}</strong>
        <span className="meal-card__meta">
          <MacroLine meal={meal} />
          {meal.prepTime ? (
            <span>
              <Icon name="clock" size={14} /> {meal.prepTime} min
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

export function MealDetail({ meal, image, members, onClose, onEdit }) {
  const steps = (meal.instructions || '').split('\n').map((s) => s.trim()).filter(Boolean);
  const people = (meal.assignedTo || []).map((id) => members.find((m) => m.id === id)?.name).filter(Boolean);

  return (
    <Modal
      title={meal.name || 'Repas sans nom'}
      onClose={onClose}
      size="lg"
      footer={
        onEdit && (
          <button type="button" className="btn btn--primary" onClick={() => onEdit(meal.id)}>
            <Icon name="edit" size={18} /> Modifier la fiche
          </button>
        )
      }
    >
      <div className="detail">
        <MealImage meal={meal} image={image} className="detail__image" />
        <div className="detail__summary">
          <p className="detail__type">{typeLabels(meal) || 'Repas'}</p>
          <div className="detail__facts">
            {meal.prepTime ? (
              <span>
                <Icon name="clock" size={16} /> {meal.prepTime} min
              </span>
            ) : null}
            {meal.servings ? (
              <span>
                <Icon name="utensils" size={16} /> {meal.servings} portions
              </span>
            ) : null}
            <span>
              <Icon name="users" size={16} /> {people.length ? people.join(', ') : 'Toute la famille'}
            </span>
          </div>
          <dl className="macro-grid">
            {MACROS.map((m) => (
              <div key={m.key}>
                <dt>{m.label}</dt>
                <dd>
                  {meal.macros?.[m.key] || '—'}
                  {meal.macros?.[m.key] ? <small> {m.unit}</small> : null}
                </dd>
              </div>
            ))}
          </dl>
          <p className="hint">Valeurs par portion, approximatives.</p>
        </div>
      </div>

      <div className="detail__columns">
        <section>
          <h3>Ingrédients</h3>
          {meal.ingredients?.length ? (
            <ul className="ingredient-list">
              {meal.ingredients.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">Aucun ingrédient indiqué.</p>
          )}
        </section>
        <section>
          <h3>Préparation</h3>
          {steps.length ? (
            <ol className="step-list">
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <p className="muted">Aucune étape indiquée.</p>
          )}
        </section>
      </div>
      {meal.notes && <p className="detail__notes">{meal.notes}</p>}
    </Modal>
  );
}

/** Choix d'un repas pour une case du menu, avec recherche et filtre par type. */
export function MealPicker({ title, meals, images, preferredType, onPick, onClose, onCreate }) {
  const [query, setQuery] = useState('');
  const [onlyType, setOnlyType] = useState(Boolean(preferredType));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return meals
      .filter((m) => !onlyType || !preferredType || m.mealTypes?.includes(preferredType))
      .filter((m) => !q || m.name?.toLowerCase().includes(q))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr'));
  }, [meals, query, onlyType, preferredType]);

  const typeLabel = MEAL_TYPES.find((t) => t.id === preferredType)?.label;

  return (
    <Modal title={title} onClose={onClose} size="lg">
      <div className="picker__bar">
        <input
          className="input"
          type="search"
          autoFocus
          placeholder="Rechercher une recette…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {typeLabel && (
          <label className="switch">
            <input type="checkbox" checked={onlyType} onChange={(e) => setOnlyType(e.target.checked)} />
            <span>Seulement « {typeLabel} »</span>
          </label>
        )}
      </div>

      {results.length ? (
        <div className="picker__grid">
          {results.map((meal) => (
            <MealCard key={meal.id} meal={meal} image={images[meal.id]} onOpen={onPick} />
          ))}
        </div>
      ) : (
        <p className="muted picker__empty">
          Aucune recette ne correspond.{' '}
          {onlyType && typeLabel && (
            <button type="button" className="link" onClick={() => setOnlyType(false)}>
              Voir tous les types
            </button>
          )}
        </p>
      )}

      {onCreate && (
        <button type="button" className="btn btn--ghost picker__create" onClick={() => onCreate(query)}>
          ＋ Créer une nouvelle recette{query ? ` « ${query} »` : ''}
        </button>
      )}
    </Modal>
  );
}
