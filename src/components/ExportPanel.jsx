import React from 'react';

export default function ExportPanel({
  onPrintMenu,
  onPrintGrocery,
  onPrintPrep,
  onExportGrocery,
  onSaveBackup,
  onLoadBackup,
  onReset,
}) {
  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <h2 className="panel__title">Sauvegarde et export</h2>
          <p className="panel__sub">
            Imprime les sections importantes, exporte la liste d'épicerie ou
            sauvegarde tes données.
          </p>
        </div>
      </div>

      <div className="export-grid">
        <div className="export-card">
          <h3>Impression</h3>
          <p>
            Imprime le menu, la liste d'épicerie ou la préparation de la
            semaine.
          </p>

          <div className="export-actions">
            <button
              className="btn btn--ghost"
              type="button"
              onClick={onPrintMenu}
            >
              Imprimer le menu
            </button>

            <button
              className="btn btn--ghost"
              type="button"
              onClick={onPrintGrocery}
            >
              Imprimer l'épicerie
            </button>

            <button
              className="btn btn--ghost"
              type="button"
              onClick={onPrintPrep}
            >
              Imprimer le meal prep
            </button>
          </div>
        </div>

        <div className="export-card">
          <h3>Liste d'épicerie</h3>
          <p>
            Télécharge la liste d'épicerie en format CSV pour l'ouvrir dans
            Excel ou Google Sheets.
          </p>

          <div className="export-actions">
            <button
              className="btn btn--primary"
              type="button"
              onClick={onExportGrocery}
            >
              Exporter CSV
            </button>
          </div>
        </div>

        <div className="export-card">
          <h3>Sauvegarde</h3>
          <p>Sauvegarde ou restaure les données du planificateur.</p>

          <div className="export-actions">
            <button
              className="btn btn--ghost"
              type="button"
              onClick={onSaveBackup}
            >
              Télécharger backup
            </button>

            <label className="btn btn--ghost">
              Importer backup
              <input
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onLoadBackup?.(file);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="export-card export-card--danger">
          <h3>Réinitialisation</h3>
          <p>
            Remettre l'application à zéro. À utiliser seulement si tu veux
            effacer les données actuelles.
          </p>

          <div className="export-actions">
            <button className="btn btn--danger" type="button" onClick={onReset}>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
