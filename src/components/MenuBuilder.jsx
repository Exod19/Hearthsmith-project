import React from 'react';

const DAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Déjeuner' },
  { key: 'lunch', label: 'Dîner' },
  { key: 'dinner', label: 'Souper' },
  { key: 'snack', label: 'Collation' },
];

export default function MenuBuilder({
  meals = [],
  weeklyMenu = {},
  onUpdateMenu,
  selectedWeek,
  onChangeWeek,
  onDeleteWeek,
}) {
  function handleMealChange(day, slot, mealId) {
    const nextMenu = {
      ...weeklyMenu,
      [day]: {
        ...(weeklyMenu[day] || {}),
        [slot]: mealId,
      },
    };

    onUpdateMenu?.(nextMenu);
  }

  function handleNoteChange(day, value) {
    const nextMenu = {
      ...weeklyMenu,
      [day]: {
        ...(weeklyMenu[day] || {}),
        note: value,
      },
    };

    onUpdateMenu?.(nextMenu);
  }

  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <h2 className="panel__title">Constructeur de menu</h2>
          <p className="panel__sub">
            Associe des repas aux journées de la semaine.
          </p>
        </div>
      </div>

      <div className="builder-toolbar">
        <label className="field">
          Semaine
          <input
            className="builder-input"
            type="text"
            value={selectedWeek || ''}
            onChange={(event) => onChangeWeek?.(event.target.value)}
            placeholder="Ex. Semaine du 24 juin"
          />
        </label>

        <label className="field">
          Repas disponibles
          <input
            className="builder-input"
            type="text"
            value={`${meals.length} repas dans la bibliothèque`}
            readOnly
          />
        </label>

        <button
          className="btn btn--danger builder-delete"
          type="button"
          onClick={onDeleteWeek}
        >
          Supprimer la semaine
        </button>
      </div>

      <div className="builder">
        {DAYS.map((day) => {
          const dayMenu = weeklyMenu[day] || {};

          return (
            <div className="builder-day" key={day}>
              <h3 className="builder-day__title">{day}</h3>

              {MEAL_SLOTS.map((slot) => (
                <label className="builder-row" key={slot.key}>
                  <span className="builder-row__lbl">{slot.label}</span>

                  <select
                    className="builder-select"
                    value={dayMenu[slot.key] || ''}
                    onChange={(event) =>
                      handleMealChange(day, slot.key, event.target.value)
                    }
                  >
                    <option value="">Aucun repas sélectionné</option>

                    {meals.map((meal) => (
                      <option key={meal.id} value={meal.id}>
                        {meal.name || 'Repas sans nom'}
                      </option>
                    ))}
                  </select>
                </label>
              ))}

              <label className="builder-row">
                <span className="builder-row__lbl">Note</span>
                <input
                  className="builder-input"
                  type="text"
                  value={dayMenu.note || ''}
                  onChange={(event) =>
                    handleNoteChange(day, event.target.value)
                  }
                  placeholder="Préparation, rappel, lunch..."
                />
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}
