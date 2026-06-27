import React from "react";

export default function GroceryList() {
  return (
    <section className="panel printable print-grocery">
      <div className="panel__head">
        <div>
          <h2 className="panel__title">Liste d'épicerie</h2>
          <p className="panel__sub">
            Le composant GroceryList est bien chargé.
          </p>
        </div>
      </div>

      <p className="muted">
        Cette section est temporaire. Elle sert à confirmer que le fichier
        GroceryList.jsx existe.
      </p>
    </section>
  );
}