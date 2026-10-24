// =============================================================
//  HouseholdMembers.jsx — Profils des membres du logis
// -------------------------------------------------------------
//  Les profils servent à repérer les repas du menu qui entrent
//  en conflit (restrictions, aversions) et à guider l'assistant.
// =============================================================

import { useMemo, useRef, useState } from 'react';
import { DAYS } from '../data/defaults.js';
import { resizeImageFile } from '../utils/files.js';
import { findConflicts } from '../utils/nutrition.js';
import { PageHeader, useToast } from './ui.jsx';
import './HouseholdMembers.css';

const DAY_LABELS = Object.fromEntries(DAYS.map((d) => [d.id, d.short]));

const listToText = (list) => (Array.isArray(list) ? list.join('\n') : '');
const textToList = (text) => text.split('\n').map((s) => s.trim()).filter(Boolean);

const getInitials = (name = '') =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function Avatar({ member, size = 'small' }) {
  return (
    <span className={`hs-avatar hs-avatar-${size}`}>
      {member.avatar ? <img src={member.avatar} alt="" /> : <strong>{getInitials(member.name)}</strong>}
    </span>
  );
}

export default function HouseholdMembers({ members, menu, mealsById, actions, onOpenMeal, onAskAssistant }) {
  const notify = useToast();
  const [selectedId, setSelectedId] = useState(() => members[0]?.id);
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef(null);

  const member = members.find((m) => m.id === selectedId) || members[0];

  const conflicts = useMemo(
    () => (member ? findConflicts(member, menu, mealsById, DAY_LABELS) : []),
    [member, menu, mealsById]
  );

  const conflictCounts = useMemo(
    () => Object.fromEntries(members.map((m) => [m.id, m.activeProfile ? findConflicts(m, menu, mealsById, DAY_LABELS).length : 0])),
    [members, menu, mealsById]
  );

  if (!member) {
    return (
      <div className="page">
        <PageHeader icon="⌂" title="Membres du logis" subtitle="Ajoutez les personnes pour qui vous cuisinez." />
        <button type="button" className="btn btn--primary" onClick={() => setSelectedId(actions.addMember())}>
          ＋ Ajouter un membre
        </button>
      </div>
    );
  }

  const update = (patch) => actions.updateMember(member.id, patch);
  const updateHabits = (patch) => update({ habits: { ...member.habits, ...patch } });

  function addMember() {
    const id = actions.addMember();
    setSelectedId(id);
    setEditing(true);
  }

  function deleteMember() {
    if (!window.confirm(`Supprimer le profil de ${member.name} ?`)) return;
    actions.deleteMember(member.id);
    setSelectedId(members.find((m) => m.id !== member.id)?.id);
    setEditing(false);
    notify('Profil supprimé');
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      update({ avatar: await resizeImageFile(file, 320, 0.85) });
    } catch (error) {
      notify(error.message, { tone: 'error' });
    }
  }

  const ask = (text) => onAskAssistant(`Pour ${member.name} : ${text}`);

  return (
    <section className="hs-household-page">
      <PageHeader
        icon="⌂"
        title="Membres du logis"
        subtitle="Des profils complets permettent de repérer les repas à éviter et de mieux guider l’assistant."
        actions={
          <button type="button" className="btn btn--primary" onClick={addMember}>
            ＋ Ajouter un membre
          </button>
        }
      />

      <div className="hs-household-layout">
        <aside className="hs-member-list hs-scroll-card" aria-label="Membres">
          <h2>Membres du logis</h2>
          <div className="hs-member-stack">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`hs-member-card ${m.id === member.id ? 'is-active' : ''} ${m.activeProfile ? '' : 'is-inactive'}`}
                aria-current={m.id === member.id}
                onClick={() => {
                  setSelectedId(m.id);
                  setEditing(false);
                }}
              >
                <Avatar member={m} />
                <span>
                  <strong>
                    {m.name}
                    {conflictCounts[m.id] > 0 && (
                      <i className="hs-alert-dot" title={`${conflictCounts[m.id]} repas à vérifier`}>
                        {conflictCounts[m.id]}
                      </i>
                    )}
                  </strong>
                  <small>
                    {m.role}
                    {m.age ? ` · ${m.age}` : ''}
                  </small>
                  <span className="hs-tag-row">
                    {(m.tags || []).slice(0, 3).map((tag) => (
                      <em key={tag}>{tag}</em>
                    ))}
                  </span>
                </span>
              </button>
            ))}
            <button type="button" className="hs-add-member-card" onClick={addMember}>
              <span>＋</span>
              Ajouter un membre
            </button>
          </div>
        </aside>

        <main className="hs-profile-main" key={`${member.id}-${editing}`}>
          <section className="hs-hero-card hs-frame-card">
            <div className="hs-profile-portrait-wrap">
              <Avatar member={member} size="large" />
              <button type="button" className="hs-camera-btn" onClick={() => fileInputRef.current?.click()} aria-label="Changer la photo">
                📷
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
            </div>

            <div className="hs-profile-heading">
              {editing ? (
                <>
                  <input className="hs-title-input" value={member.name} onChange={(e) => update({ name: e.target.value })} aria-label="Nom" />
                  <div className="hs-inline-fields">
                    <input value={member.role} onChange={(e) => update({ role: e.target.value })} placeholder="Rôle (Adulte, Enfant…)" aria-label="Rôle" />
                    <input value={member.age} onChange={(e) => update({ age: e.target.value })} placeholder="Âge" aria-label="Âge" />
                  </div>
                  <input
                    className="hs-tags-input"
                    value={(member.tags || []).join(', ')}
                    onChange={(e) => update({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                    placeholder="Étiquettes, séparées par des virgules"
                    aria-label="Étiquettes"
                  />
                </>
              ) : (
                <>
                  <h2>{member.name}</h2>
                  <p>
                    {member.role}
                    {member.age ? ` · ${member.age}` : ''}
                  </p>
                </>
              )}

              <div className="hs-objective">
                <strong>Objectif principal</strong>
                {editing ? (
                  <textarea value={member.objective} onChange={(e) => update({ objective: e.target.value })} aria-label="Objectif principal" />
                ) : (
                  <p>{member.objective || <em className="muted">À définir</em>}</p>
                )}
              </div>
            </div>

            <div className="hs-profile-actions">
              <button type="button" className={`btn ${editing ? 'btn--primary' : 'btn--parchment'}`} onClick={() => setEditing((v) => !v)}>
                {editing ? '✓ Terminer' : '✎ Modifier la fiche'}
              </button>
              {editing && (
                <>
                  {member.avatar && (
                    <button type="button" className="btn btn--ghost" onClick={() => update({ avatar: '' })}>
                      Retirer la photo
                    </button>
                  )}
                  <button type="button" className="btn btn--danger" onClick={deleteMember}>
                    🗑 Supprimer
                  </button>
                </>
              )}
              <label className="switch">
                <input type="checkbox" checked={member.activeProfile} onChange={(e) => update({ activeProfile: e.target.checked })} />
                <span>
                  Profil actif
                  <small>Pris en compte dans les alertes et par l’assistant.</small>
                </span>
              </label>
            </div>
          </section>

          <section className="hs-profile-grid">
            <Panel title="Données physiques & nutritionnelles" icon="⚕">
              <div className="hs-field-grid">
                <EditableField label="Grandeur" value={member.height} editing={editing} onChange={(v) => update({ height: v })} />
                <EditableField label="Poids actuel" value={member.currentWeight} editing={editing} onChange={(v) => update({ currentWeight: v })} />
                <EditableField label="Poids cible" value={member.targetWeight} editing={editing} onChange={(v) => update({ targetWeight: v })} />
                <EditableField label="Activité" value={member.activity} editing={editing} onChange={(v) => update({ activity: v })} />
                <EditableField label="Objectif" value={member.nutritionGoal} editing={editing} onChange={(v) => update({ nutritionGoal: v })} />
              </div>
              <h4>
                Cibles nutritionnelles <small>par jour</small>
              </h4>
              <div className="hs-macro-row">
                <Macro label="Calories" value={member.calories} editing={editing} onChange={(v) => update({ calories: v })} />
                <Macro label="Protéines" value={member.protein} editing={editing} onChange={(v) => update({ protein: v })} />
                <Macro label="Glucides" value={member.carbs} editing={editing} onChange={(v) => update({ carbs: v })} />
                <Macro label="Lipides" value={member.fat} editing={editing} onChange={(v) => update({ fat: v })} />
                <Macro label="Fibres" value={member.fiber} editing={editing} onChange={(v) => update({ fiber: v })} />
                <Macro label="Hydratation" value={member.hydration} editing={editing} onChange={(v) => update({ hydration: v })} />
              </div>
            </Panel>

            <Panel title="Santé, restrictions & précautions" icon="🛡">
              <EditableList title="Restrictions alimentaires" values={member.restrictions} editing={editing} onChange={(v) => update({ restrictions: v })} />
              <EditableList title="Conditions à considérer" values={member.conditions} editing={editing} onChange={(v) => update({ conditions: v })} danger />
              <div className="hs-severity">
                <strong>Niveau de sévérité</strong>
                {editing ? (
                  <select value={member.severity} onChange={(e) => update({ severity: e.target.value })}>
                    <option>Informationnel</option>
                    <option>Important</option>
                    <option>Critique</option>
                  </select>
                ) : (
                  <span>{member.severity}</span>
                )}
              </div>
            </Panel>

            <Panel title="Préférences alimentaires" icon="❤">
              <div className="hs-two-columns">
                <EditableList title="Aime" values={member.likes} editing={editing} onChange={(v) => update({ likes: v })} positive />
                <EditableList title="N’aime pas / éviter" values={member.dislikes} editing={editing} onChange={(v) => update({ dislikes: v })} danger />
              </div>
            </Panel>

            <Panel title="Habitudes de vie" icon="☼">
              <div className="hs-field-grid">
                <EditableField label="Horaire" value={member.habits.schedule} editing={editing} onChange={(v) => updateHabits({ schedule: v })} />
                <EditableField label="Repas à la maison" value={member.habits.homeMeals} editing={editing} onChange={(v) => updateHabits({ homeMeals: v })} />
                <EditableField label="Lunch à prévoir" value={member.habits.lunch} editing={editing} onChange={(v) => updateHabits({ lunch: v })} />
                <EditableField label="Entraînement" value={member.habits.training} editing={editing} onChange={(v) => updateHabits({ training: v })} />
                <EditableField label="Sommeil" value={member.habits.sleep} editing={editing} onChange={(v) => updateHabits({ sleep: v })} />
                <EditableField label="Temps en cuisine" value={member.habits.kitchenTime} editing={editing} onChange={(v) => updateHabits({ kitchenTime: v })} />
                <EditableField label="Notes" value={member.habits.notes} editing={editing} onChange={(v) => updateHabits({ notes: v })} />
              </div>
            </Panel>
          </section>
        </main>

        <aside className="hs-ai-panel hs-frame-card" aria-label="Compatibilité avec le menu">
          <div className="hs-ai-header">
            <span className="hs-ai-orb" aria-hidden="true">
              ✦
            </span>
            <div>
              <h2>Compatibilité du menu</h2>
              <strong>{member.name}</strong>
              <p>Repas de « {menu.name} » qui contiennent un ingrédient à éviter selon ce profil.</p>
            </div>
          </div>

          <div className="hs-compat">
            {!member.activeProfile ? (
              <p className="hs-compat__ok">Profil inactif : aucune vérification.</p>
            ) : conflicts.length === 0 ? (
              <p className="hs-compat__ok">✓ Aucun conflit détecté cette semaine.</p>
            ) : (
              <ul className="hs-compat__list">
                {conflicts.map((c) => (
                  <li key={c.meal.id}>
                    <button type="button" onClick={() => onOpenMeal(c.meal.id)}>
                      <strong>{c.meal.name}</strong>
                      <span>{c.days.join(', ')}</span>
                    </button>
                    <div className="hs-compat__reasons">
                      {c.reasons.map((r) => (
                        <em key={r.source}>{r.source}</em>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="hint">Vérification par mots-clés : confirmez toujours avec les étiquettes des produits.</p>
          </div>

          <div className="hs-ai-actions">
            <button type="button" onClick={() => ask('propose 5 recettes compatibles avec son profil.')}>🍲 Recettes compatibles</button>
            <button type="button" onClick={() => ask('vérifie le menu de la semaine et propose des remplacements si nécessaire.')}>✨ Vérifier le menu</button>
            <button type="button" onClick={() => ask('suggère des collations compatibles avec son profil.')}>🍎 Idées de collations</button>
            <button type="button" onClick={() => ask('analyse son profil et dis-moi ce qui manque pour de meilleures recommandations.')}>🔍 Compléter le profil</button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Panel({ title, icon, children }) {
  return (
    <section className="hs-panel hs-frame-card">
      <h3>
        <span aria-hidden="true">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function EditableField({ label, value, editing, onChange }) {
  return (
    <label className="hs-field">
      <span>{label}</span>
      {editing ? <input value={value || ''} onChange={(e) => onChange(e.target.value)} /> : <strong>{value || '—'}</strong>}
    </label>
  );
}

function Macro({ label, value, editing, onChange }) {
  return (
    <label className="hs-macro">
      <span aria-hidden="true">✦</span>
      {editing ? <input value={value || ''} onChange={(e) => onChange(e.target.value)} aria-label={label} /> : <strong>{value || '—'}</strong>}
      <small>{label}</small>
    </label>
  );
}

// Texte brut gardé localement pour permettre les lignes vides pendant la saisie.
function EditableList({ title, values, editing, onChange, positive = false, danger = false }) {
  const [text, setText] = useState(() => listToText(values));
  return (
    <div className="hs-list-block">
      <h4>{title}</h4>
      {editing ? (
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(textToList(e.target.value));
          }}
          placeholder="Un élément par ligne"
          aria-label={title}
        />
      ) : (
        <ul className={positive ? 'is-positive' : danger ? 'is-danger' : ''}>
          {(values || []).length ? values.map((item) => <li key={item}>{item}</li>) : <li className="is-empty">Aucun élément</li>}
        </ul>
      )}
    </div>
  );
}
