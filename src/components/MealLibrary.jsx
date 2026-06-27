import React, { useMemo, useState } from 'react';

export default function MealLibrary({
  meals = [],
  images = {},
  mealTypes = [],
  familyMembers = [],
  onAddMeal,
  onUpdateMeal,
  onDeleteMeal,
  onDuplicateMeal,
  onSetImage,
  onClearImage,
}) {
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [search, setSearch] = useState('');

  const selectedMeal = useMemo(() => {
    return meals.find((meal) => meal.id === selectedMealId) || meals[0] || null;
  }, [meals, selectedMealId]);

  const filteredMeals = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return meals;

    return meals.filter((meal) => {
      return (
        meal.name?.toLowerCase().includes(query) ||
        meal.mealTypes?.some((type) => type.toLowerCase().includes(query)) ||
        meal.assignedTo?.some((member) => member.toLowerCase().includes(query))
      );
    });
  }, [meals, search]);

  const selectedMealImage = selectedMeal ? images[selectedMeal.id] || '' : '';

  function handleAddMeal() {
    const newMealId = onAddMeal?.();

    if (newMealId) {
      setSelectedMealId(newMealId);
    }
  }

  function toggleArrayValue(field, value) {
    if (!selectedMeal) return;

    const currentValues = selectedMeal[field] || [];

    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    onUpdateMeal(selectedMeal.id, {
      [field]: nextValues,
    });
  }

  function updateMacro(field, value) {
    if (!selectedMeal) return;

    onUpdateMeal(selectedMeal.id, {
      macros: {
        ...(selectedMeal.macros || {}),
        [field]: value,
      },
    });
  }

  function updateIngredients(value) {
    if (!selectedMeal) return;

    const ingredients = value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    onUpdateMeal(selectedMeal.id, { ingredients });
  }

  function resizeImageFile(file, maxSize = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const image = new Image();
  
        image.onload = () => {
          const largestSide = Math.max(image.width, image.height);
          const scale = largestSide > maxSize ? maxSize / largestSide : 1;
  
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
  
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
  
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
  
        image.onerror = reject;
        image.src = reader.result;
      };
  
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  async function handleImageUpload(event) {
    if (!selectedMeal) return;
  
    const file = event.target.files?.[0];
  
    if (!file) return;
  
    if (!file.type.startsWith('image/')) {
      alert('Choisis un fichier image valide.');
      return;
    }
  
    try {
      const dataUrl = await resizeImageFile(file);
      onSetImage?.(selectedMeal.id, dataUrl);
    } catch (error) {
      console.error(error);
      alert("L'image n'a pas pu être importée.");
    } finally {
      event.target.value = '';
    }
  }
  
  function handleClearMealImage() {
    if (!selectedMeal) return;
  
    onClearImage?.(selectedMeal.id);
  }
  
  function handleDeleteSelectedMeal() {
    if (!selectedMeal) return;

    const confirmed = window.confirm(
      `Supprimer la fiche "${selectedMeal.name || 'Repas sans nom'}"?`
    );

    if (!confirmed) return;

    onDeleteMeal?.(selectedMeal.id);
    setSelectedMealId(null);
  }

  return (
    <section className="meal-library">
      <div className="meal-library__header">
        <div>
          <h2>Fiches repas</h2>
          <p>
            Crée une bibliothèque de repas réutilisables pour bâtir tes menus
            hebdomadaires plus rapidement.
          </p>
        </div>

        <button type="button" onClick={handleAddMeal}>
          + Ajouter une fiche repas
        </button>
      </div>

      <div className="meal-library__layout">
        <aside className="meal-library__sidebar">
          <input
            type="search"
            placeholder="Rechercher un repas..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="meal-library__list">
            {filteredMeals.length === 0 && (
              <p className="meal-library__empty">
                Aucune fiche repas pour l’instant.
              </p>
            )}

            {filteredMeals.map((meal) => (
              <button
                key={meal.id}
                type="button"
                className={
                  selectedMeal?.id === meal.id
                    ? 'meal-library__item is-active'
                    : 'meal-library__item'
                }
                onClick={() => setSelectedMealId(meal.id)}
              >
                <strong>{meal.name || 'Repas sans nom'}</strong>

                <span>
                  {(meal.mealTypes || [])
                    .map((typeId) => {
                      const type = mealTypes.find((item) => item.id === typeId);
                      return type?.label || typeId;
                    })
                    .join(', ') || 'Aucun type'}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="meal-library__editor-panel">
          {!selectedMeal && (
            <div className="meal-library__empty meal-library__empty--large">
              <h3>Aucune fiche sélectionnée</h3>
              <p>Ajoute une première fiche repas pour commencer.</p>
            </div>
          )}

          {selectedMeal && (
            <article className="meal-editor">
              <div className="meal-editor__actions">
                <button
                  type="button"
                  onClick={() => onDuplicateMeal?.(selectedMeal.id)}
                >
                  Dupliquer
                </button>

                <button
                  type="button"
                  className="meal-editor__danger"
                  onClick={handleDeleteSelectedMeal}
                >
                  Supprimer
                </button>
              </div>

              <div className="meal-editor__hero">
  <div className="meal-editor__image-box">
    {selectedMealImage ? (
      <img
        src={selectedMealImage}
        alt={selectedMeal.name || 'Repas'}
      />
    ) : (
      <div className="meal-editor__image-placeholder">
        Image du repas
      </div>
    )}

    <div className="meal-editor__image-actions">
      <label className="meal-editor__upload-button">
        Uploader une image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </label>

      {selectedMealImage && (
        <button type="button" onClick={handleClearMealImage}>
          Retirer l’image
        </button>
      )}
    </div>
  </div>

  <div className="meal-editor__main-fields">
    <label>
      Nom du repas
      <input
        type="text"
        value={selectedMeal.name || ''}
        onChange={(event) =>
          onUpdateMeal(selectedMeal.id, {
            name: event.target.value,
          })
        }
        placeholder="Ex. Poulet teriyaki, riz et légumes"
      />
    </label>
  </div>
</div>

              <div className="meal-editor__section">
                <h3>Type de repas</h3>

                <div className="meal-editor__chips">
                  {mealTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className={
                        selectedMeal.mealTypes?.includes(type.id)
                          ? 'meal-editor__chip is-selected'
                          : 'meal-editor__chip'
                      }
                      onClick={() => toggleArrayValue('mealTypes', type.id)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="meal-editor__section">
                <h3>Membres de la famille</h3>

                <div className="meal-editor__chips">
                  {familyMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      className={
                        selectedMeal.assignedTo?.includes(member.id)
                          ? 'meal-editor__chip is-selected'
                          : 'meal-editor__chip'
                      }
                      onClick={() => toggleArrayValue('assignedTo', member.id)}
                    >
                      {member.label}
                    </button>
                  ))}
                </div>

                <p className="meal-editor__hint">
                  Facultatif. Tu peux laisser vide si le repas convient à tout
                  le monde.
                </p>
              </div>

              <div className="meal-editor__section">
                <h3>Macros</h3>

                <div className="meal-editor__macro-grid">
                  <label>
                    Calories
                    <input
                      type="number"
                      value={selectedMeal.macros?.calories || ''}
                      onChange={(event) =>
                        updateMacro('calories', event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Protéines
                    <input
                      type="number"
                      value={selectedMeal.macros?.protein || ''}
                      onChange={(event) =>
                        updateMacro('protein', event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Glucides
                    <input
                      type="number"
                      value={selectedMeal.macros?.carbs || ''}
                      onChange={(event) =>
                        updateMacro('carbs', event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Lipides
                    <input
                      type="number"
                      value={selectedMeal.macros?.fat || ''}
                      onChange={(event) =>
                        updateMacro('fat', event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Fibres
                    <input
                      type="number"
                      value={selectedMeal.macros?.fiber || ''}
                      onChange={(event) =>
                        updateMacro('fiber', event.target.value)
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="meal-editor__section">
                <h3>Ingrédients</h3>

                <textarea
                  value={(selectedMeal.ingredients || []).join('\n')}
                  onChange={(event) => updateIngredients(event.target.value)}
                  placeholder={
                    'Un ingrédient par ligne\nEx. 150 g poulet\n125 g riz\n100 g brocoli'
                  }
                  rows={8}
                />
              </div>

              <div className="meal-editor__section">
                <h3>Instructions</h3>

                <textarea
                  value={selectedMeal.instructions || ''}
                  onChange={(event) =>
                    onUpdateMeal(selectedMeal.id, {
                      instructions: event.target.value,
                    })
                  }
                  placeholder="Étapes de préparation..."
                  rows={8}
                />
              </div>

              <div className="meal-editor__section">
                <h3>Notes</h3>

                <textarea
                  value={selectedMeal.notes || ''}
                  onChange={(event) =>
                    onUpdateMeal(selectedMeal.id, {
                      notes: event.target.value,
                    })
                  }
                  placeholder="Notes, variantes, préférences familiales, conservation, meal prep..."
                  rows={5}
                />
              </div>
            </article>
          )}
        </main>
      </div>
    </section>
  );
}