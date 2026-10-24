// =============================================================
//  MealEditor.jsx — Fiche recette éditable (fenêtre modale)
// -------------------------------------------------------------
//  Chaque modification est enregistrée aussitôt ; « Terminé »
//  ferme simplement la fenêtre.
// =============================================================

import { useState } from 'react';
import { MACROS, MEAL_TYPES } from '../data/defaults.js';
import { resizeImageFile } from '../utils/files.js';
import { formatQuantity, formatUnit, parseIngredient } from '../utils/ingredients.js';
import { Chip, MealImage, Modal, useToast } from './ui.jsx';
import Icon from './icons.jsx';

export default function MealEditor({ meal, image, members, actions, onClose }) {
  const notify = useToast();
  // Texte brut gardé localement pour permettre les lignes vides pendant la saisie.
  const [ingredientsText, setIngredientsText] = useState(() => (meal.ingredients || []).join('\n'));

  const update = (patch) => actions.updateMeal(meal.id, patch);

  const toggle = (field, value) => {
    const list = meal[field] || [];
    update({ [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  async function handleImage(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      actions.setImage(meal.id, await resizeImageFile(file));
    } catch (error) {
      notify(error.message, { tone: 'error' });
    }
  }

  function handleDelete() {
    if (!window.confirm(`Supprimer « ${meal.name || 'Repas sans nom'} » ? La recette sera aussi retirée des menus.`)) return;
    actions.deleteMeal(meal.id);
    notify('Recette supprimée');
    onClose();
  }

  return (
    <Modal
      title={meal.name ? `Recette : ${meal.name}` : 'Nouvelle recette'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn--danger" onClick={handleDelete}>
            <Icon name="trash" size={18} /> Supprimer
          </button>
          <button
            type="button"
            className="btn btn--parchment"
            onClick={() => {
              actions.duplicateMeal(meal.id);
              notify('Copie créée dans la bibliothèque');
            }}
          >
            <Icon name="copy" size={18} /> Dupliquer
          </button>
          <span className="spacer" />
          <span className="hint">Enregistré automatiquement</span>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Terminé
          </button>
        </>
      }
    >
      <div className="editor">
        <div className="editor__image">
          <MealImage meal={meal} image={image} />
          <div className="editor__image-actions">
            <label className="btn btn--parchment btn--sm">
              <Icon name="camera" size={18} /> {image ? 'Changer la photo' : 'Ajouter une photo'}
              <input type="file" accept="image/*" hidden onChange={handleImage} />
            </label>
            {image && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => actions.clearImage(meal.id)}>
                Retirer
              </button>
            )}
          </div>
        </div>

        <div className="editor__main">
          <label className="field">
            <span>Nom de la recette</span>
            <input
              className="input input--lg"
              autoFocus={!meal.name}
              value={meal.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Ex. Poulet teriyaki, riz et légumes"
            />
          </label>

          <div className="field">
            <span>Moment du repas</span>
            <div className="chips">
              {MEAL_TYPES.map((t) => (
                <Chip key={t.id} active={meal.mealTypes?.includes(t.id)} onClick={() => toggle('mealTypes', t.id)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Pour qui ?</span>
            <div className="chips">
              {members.map((m) => (
                <Chip key={m.id} active={meal.assignedTo?.includes(m.id)} onClick={() => toggle('assignedTo', m.id)}>
                  {m.name}
                </Chip>
              ))}
            </div>
            <small className="hint">Laissez vide si la recette convient à tout le monde.</small>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Préparation (min)</span>
              <input className="input" type="number" min="0" inputMode="numeric" value={meal.prepTime} onChange={(e) => update({ prepTime: e.target.value })} />
            </label>
            <label className="field">
              <span>Portions</span>
              <input className="input" type="number" min="0" inputMode="numeric" value={meal.servings} onChange={(e) => update({ servings: e.target.value })} />
            </label>
          </div>
        </div>
      </div>

      <fieldset className="macro-inputs">
        <legend>Valeurs nutritives par portion</legend>
        {MACROS.map((m) => (
          <label key={m.key} className="field">
            <span>
              {m.label} <small>({m.unit})</small>
            </span>
            <input
              className="input"
              type="number"
              min="0"
              inputMode="decimal"
              value={meal.macros?.[m.key] ?? ''}
              onChange={(e) => update({ macros: { ...meal.macros, [m.key]: e.target.value } })}
            />
          </label>
        ))}
      </fieldset>

      <div className="editor__columns">
        <label className="field">
          <span>Ingrédients</span>
          <textarea
            className="input"
            rows={9}
            value={ingredientsText}
            onChange={(e) => {
              setIngredientsText(e.target.value);
              update({ ingredients: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean) });
            }}
            placeholder={'Un ingrédient par ligne :\n700 g poulet\n2 tasses riz\n1 brocoli'}
          />
          <small className="hint">Écrivez la quantité en premier pour que l’épicerie additionne tout.</small>
          <ShoppingPreview lines={meal.ingredients} />
        </label>
        <label className="field">
          <span>Préparation</span>
          <textarea
            className="input"
            rows={9}
            value={meal.instructions}
            onChange={(e) => update({ instructions: e.target.value })}
            placeholder={'Une étape par ligne :\nCuire le riz.\nGriller le poulet.'}
          />
        </label>
      </div>

      <label className="field">
        <span>Notes</span>
        <textarea
          className="input"
          rows={3}
          value={meal.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Variantes, conservation, préférences…"
        />
      </label>
    </Modal>
  );
}

/** Ce que l'épicerie retiendra de chaque ligne (préparation retirée, produits de base exclus). */
function ShoppingPreview({ lines = [] }) {
  const parsed = lines.map(parseIngredient).filter(Boolean);
  if (!parsed.length) return null;
  const toBuy = parsed.filter((p) => !p.staple);
  const home = parsed.filter((p) => p.staple);
  return (
    <div className="shopping-preview">
      <span>Pour l’épicerie</span>
      <div>
        {toBuy.map((p, i) => (
          <em key={i} className="tag" title={p.raw}>
            {p.name}
            {p.quantity ? ` · ${[formatQuantity(p.quantity), formatUnit(p.unit, p.quantity)].filter(Boolean).join(' ')}` : ''}
          </em>
        ))}
        {home.length > 0 && <small>Déjà à la maison : {[...new Set(home.flatMap((p) => p.basics))].join(', ')}</small>}
      </div>
    </div>
  );
}
