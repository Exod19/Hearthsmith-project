// =============================================================
//  ExportPanel.jsx — Réglages : sauvegarde, import, remise à zéro
// =============================================================

import { useRef } from 'react';
import { exportBackup } from '../utils/files.js';
import { readBackup, storageUsage } from '../utils/storage.js';
import { Card, PageHeader, Progress, useToast } from './ui.jsx';
import Icon from './icons.jsx';
import { AISettings } from './AIAssistant.jsx';

// La plupart des navigateurs accordent environ 5 Mo par site.
const QUOTA = 5 * 1024 * 1024;

export default function ExportPanel({ state, actions }) {
  const notify = useToast();
  const fileRef = useRef(null);
  const used = storageUsage();
  const sampleCount = state.meals.filter((m) => m.sample).length;

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const next = await readBackup(file);
      if (!window.confirm(`Remplacer vos données par cette sauvegarde (${next.meals.length} recettes, ${next.menus.length} semaines) ?`)) return;
      actions.replaceState(next);
      notify('Sauvegarde restaurée');
    } catch (error) {
      notify(error.message || 'Fichier illisible', { tone: 'error' });
    }
  }

  function handleReset() {
    if (!window.confirm('Effacer toutes les recettes, semaines et photos ? Téléchargez une sauvegarde avant, au besoin.')) return;
    actions.resetAll();
    notify('Application remise à zéro');
  }

  return (
    <div className="page">
      <PageHeader icon="settings" title="Réglages" subtitle="Vos données restent dans ce navigateur. Faites une sauvegarde pour les transférer sur un autre appareil." />

      <div className="settings-grid">
        <Card title="Votre profil" icon="users">
          <label className="field">
            <span>Votre prénom</span>
            <input className="input" value={state.profileName || ''} onChange={(e) => actions.setProfileName(e.target.value)} placeholder="Pour l’accueil : « Bonjour, … ! »" autoComplete="given-name" />
          </label>
        </Card>
        <AISettings />
        <Card title="Sauvegarde" icon="download">
          <p>Téléchargez un fichier avec toutes vos recettes, semaines, profils et photos, ou restaurez-en un.</p>
          <div className="toolbar">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                exportBackup(state);
                notify('Sauvegarde téléchargée');
              }}
            >
              <Icon name="download" size={18} /> Télécharger une sauvegarde
            </button>
            <button type="button" className="btn btn--parchment" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={18} /> Restaurer un fichier
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
          </div>
        </Card>

        <Card title="Espace utilisé" icon="box">
          <p>
            {(used / 1024 / 1024).toFixed(2).replace('.', ',')} Mo sur environ 5 Mo · {Object.keys(state.images).length} photo(s)
          </p>
          <Progress value={used} max={QUOTA} label="Espace de stockage utilisé" />
          <p className="hint">Les photos prennent le plus de place. Elles sont réduites automatiquement à l’import.</p>
        </Card>

        {sampleCount > 0 && (
          <Card title="Recettes d’exemple" icon="book">
            <p>{sampleCount} recettes d’exemple ont été ajoutées pour vous aider à démarrer.</p>
            <button
              type="button"
              className="btn btn--parchment"
              onClick={() => {
                actions.removeSampleMeals();
                notify('Recettes d’exemple retirées');
              }}
            >
              Retirer les exemples
            </button>
          </Card>
        )}

        <Card title="Remise à zéro" icon="warning" className="card--danger">
          <p>Efface tout le contenu de l’application dans ce navigateur. Les profils du logis par défaut sont recréés.</p>
          <button type="button" className="btn btn--danger" onClick={handleReset}>
            Tout effacer
          </button>
        </Card>
      </div>
    </div>
  );
}
