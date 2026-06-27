import React from "react";

export function MealCardDetail({ meal, onClose }) {
  if (!meal) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <article className="modal">
        <button className="modal__close" type="button" onClick={onClose}>
          ×
        </button>

        <div className="detail">
          <div className="detail__hero">
            {meal.image ? (
              <img className="detail__img" src={meal.image} alt={meal.name || "Repas"} />
            ) : (
              <div className="meal-img meal-img--placeholder">
                <span className="meal-img__emoji">🍽️</span>
              </div>
            )}
          </div>

          <div className="detail__head">
            <div className="meal-tile__type">{meal.type || "Repas"}</div>

            <h2 className="detail__name">
              {meal.name || "Repas sans nom"}
            </h2>

            {meal.note && (
              <p className="detail__note">{meal.note}</p>
            )}

            <div className="detail__facts">
              {meal.time && <span>⏱️ {meal.time} min</span>}
              {meal.servings && <span>🍴 {meal.servings} portions</span>}
            </div>
          </div>

          {meal.macros && (
            <div className="detail__macros">
              <strong>Valeurs approximatives</strong>

              <div className="macro-grid">
                <div>
                  <span className="macro-num">{meal.macros.kcal || 0}</span>
                  <span className="macro-lbl">kcal</span>
                </div>
                <div>
                  <span className="macro-num">{meal.macros.protein || 0}</span>
                  <span className="macro-lbl">protéines</span>
                </div>
                <div>
                  <span className="macro-num">{meal.macros.carbs || 0}</span>
                  <span className="macro-lbl">glucides</span>
                </div>
                <div>
                  <span className="macro-num">{meal.macros.fat || 0}</span>
                  <span className="macro-lbl">lipides</span>
                </div>
                <div>
                  <span className="macro-num">{meal.macros.fiber || 0}</span>
                  <span className="macro-lbl">fibres</span>
                </div>
              </div>
            </div>
          )}

          <div className="detail__columns">
            <div className="detail__col">
              <h3>Ingrédients</h3>

              {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 ? (
                <ul className="ingredient-list">
                  {meal.ingredients.map((ingredient, index) => (
                    <li key={index}>
                      <span className="ingredient-qty">
                        {ingredient.quantity || ingredient.qty || ""} {ingredient.unit || ""}
                      </span>{" "}
                      {ingredient.name || ingredient}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Aucun ingrédient indiqué.</p>
              )}
            </div>

            <div className="detail__col">
              <h3>Préparation</h3>

              {Array.isArray(meal.steps) && meal.steps.length > 0 ? (
                <ol className="step-list">
                  {meal.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p className="muted">Aucune étape indiquée.</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function MealCard({ meal, onClick }) {
  if (!meal) {
    return null;
  }

  return (
    <button className="meal-tile" type="button" onClick={() => onClick?.(meal)}>
      {meal.image ? (
        <img className="meal-img" src={meal.image} alt={meal.name || "Repas"} />
      ) : (
        <div className="meal-img meal-img--placeholder">
          <span className="meal-img__emoji">🍽️</span>
        </div>
      )}

      <div className="meal-tile__body">
        <div className="meal-tile__type">{meal.type || "Repas"}</div>

        <h3 className="meal-tile__name">
          {meal.name || "Repas sans nom"}
        </h3>

        <div className="meal-tile__meta">
          {meal.time && <span>{meal.time} min</span>}
          {meal.servings && <span>{meal.servings} portions</span>}
        </div>

        {meal.macros && (
          <div className="macro-strip">
            {meal.macros.kcal || 0} kcal · {meal.macros.protein || 0}g prot.
          </div>
        )}
      </div>
    </button>
  );
}