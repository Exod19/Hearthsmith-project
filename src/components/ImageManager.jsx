import React from "react";

export default function ImageManager({ meals = [], onUpdateMeal }) {
  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <h2 className="panel__title">Gestion des images</h2>
          <p className="panel__sub">
            Ajoute ou remplace les images associées aux repas.
          </p>
        </div>
      </div>

      {meals.length === 0 ? (
        <p className="muted">Aucun repas disponible pour le moment.</p>
      ) : (
        <div className="img-list">
          {meals.map((meal) => (
            <div className="img-row" key={meal.id}>
              <div className="img-row__thumb">
                {meal.image ? (
                  <img src={meal.image} alt={meal.name || "Repas"} />
                ) : (
                  <span className="img-row__ph">🍽️</span>
                )}
              </div>

              <div className="img-row__info">
                <div className="img-row__name">
                  {meal.name || "Repas sans nom"}
                </div>
                <div className="img-row__type">
                  {meal.type || "Repas"}
                </div>
              </div>

              <div className="img-row__actions">
                <label className="btn btn--ghost btn--small">
                  Image
                  <input
                    className="img-row__file"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (!file) return;

                      const reader = new FileReader();

                      reader.onload = () => {
                        onUpdateMeal?.(meal.id, {
                          ...meal,
                          image: reader.result,
                        });
                      };

                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {meal.image && (
                  <button
                    className="btn btn--danger btn--small"
                    type="button"
                    onClick={() => {
                      onUpdateMeal?.(meal.id, {
                        ...meal,
                        image: "",
                      });
                    }}
                  >
                    Retirer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}