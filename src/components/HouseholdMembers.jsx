import React, { useMemo, useRef, useState } from 'react';
import './HouseholdMembers.css';

const uid = () => crypto?.randomUUID?.() || `member-${Date.now()}-${Math.random()}`;

const DEFAULT_MEMBERS = [
  {
    id: uid(),
    name: 'Anne-Marie',
    role: 'Adulte',
    age: '34 ans',
    avatar: '',
    objective: 'Manger simple et compatible avec ses besoins de santé pour se sentir bien au quotidien.',
    activeProfile: true,
    height: '168 cm',
    currentWeight: '64 kg',
    targetWeight: '60 kg',
    activity: 'Modérée',
    nutritionGoal: 'Santé métabolique / Perte de poids',
    calories: '1600',
    protein: '110 g',
    carbs: '120 g',
    fat: '55 g',
    fiber: '28 g',
    hydration: '2 L',
    restrictions: ['Sans gluten', 'Sans lactose', 'Faible FODMAP', 'Éviter les légumineuses'],
    conditions: ['Stéatose hépatique'],
    severity: 'Important',
    likes: ['Poulet', 'Dinde', 'Saumon', 'Riz', 'Patates', 'Quinoa', 'Légumes rôtis', 'Soupes simples'],
    dislikes: ['Légumineuses', 'Oignons crus', 'Aubergines', 'Plats trop épicés', 'Produits laitiers réguliers'],
    habits: {
      schedule: 'Travail de bureau · 9h–17h',
      homeMeals: 'Souper + fins de semaine',
      lunch: 'Lunchs froids ou faciles à préparer',
      training: '3x / semaine',
      sleep: 'Variable',
      kitchenTime: '30 à 45 min / jour',
      notes: 'Préfère les lunchs froids et simples.',
    },
    tags: ['Sans gluten', 'Sans lactose', 'Faible FODMAP', 'Stéatose hépatique'],
  },
  {
    id: uid(),
    name: 'Samuel',
    role: 'Adulte',
    age: '34 ans',
    avatar: '',
    objective: 'Atteindre ses cibles de protéines et de fibres tout en gardant des repas efficaces.',
    activeProfile: true,
    height: '188 cm',
    currentWeight: '267 lb',
    targetWeight: '',
    activity: 'Active',
    nutritionGoal: 'Haute protéine / recomposition',
    calories: '2400',
    protein: '145 g',
    carbs: '250 g',
    fat: '50 g',
    fiber: '35 g',
    hydration: '2.5 L',
    restrictions: [],
    conditions: [],
    severity: 'Informationnel',
    likes: ['Oeufs', 'Poulet', 'Riz', 'Patates', 'Cottage', 'Épinards'],
    dislikes: [],
    habits: {
      schedule: 'Travail variable',
      homeMeals: 'Déjeuner + souper',
      lunch: 'Lunchs simples à réchauffer',
      training: 'Cardio + musculation',
      sleep: 'À améliorer',
      kitchenTime: '30 à 45 min / jour',
      notes: 'Prioriser protéines et fibres.',
    },
    tags: ['Haute protéine', 'Fibres'],
  },
];

function listToText(list) {
  return Array.isArray(list) ? list.join('\n') : '';
}

function textToList(text) {
  return text
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function HouseholdMembers() {
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('hearthsmith.householdMembers');
      return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
    } catch {
      return DEFAULT_MEMBERS;
    }
  });

  const [selectedId, setSelectedId] = useState(() => members[0]?.id);
  const [editing, setEditing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      from: 'user',
      text: 'Peux-tu analyser mon profil et me dire s’il manque quelque chose?',
      time: '10:32',
    },
    {
      from: 'ai',
      text: 'Ton profil est déjà très complet. Tu pourrais préciser ton niveau exact de sensibilité FODMAP, tes collations préférées et ton niveau d’énergie moyen.',
      time: '10:33',
    },
  ]);

  const fileInputRef = useRef(null);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedId) || members[0],
    [members, selectedId]
  );

  function persist(nextMembers) {
    setMembers(nextMembers);
    localStorage.setItem('hearthsmith.householdMembers', JSON.stringify(nextMembers));
  }

  function updateSelected(patch) {
    const nextMembers = members.map((member) =>
      member.id === selectedMember.id ? { ...member, ...patch } : member
    );
    persist(nextMembers);
  }

  function updateSelectedNested(section, patch) {
    updateSelected({
      [section]: {
        ...selectedMember[section],
        ...patch,
      },
    });
  }

  function addMember() {
    const newMember = {
      id: uid(),
      name: 'Nouveau membre',
      role: 'Adulte',
      age: '',
      avatar: '',
      objective: 'Définir l’objectif principal de ce membre.',
      activeProfile: true,
      height: '',
      currentWeight: '',
      targetWeight: '',
      activity: '',
      nutritionGoal: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      hydration: '',
      restrictions: [],
      conditions: [],
      severity: 'Informationnel',
      likes: [],
      dislikes: [],
      habits: {
        schedule: '',
        homeMeals: '',
        lunch: '',
        training: '',
        sleep: '',
        kitchenTime: '',
        notes: '',
      },
      tags: ['Profil à compléter'],
    };

    const nextMembers = [...members, newMember];
    persist(nextMembers);
    setSelectedId(newMember.id);
    setEditing(true);
  }

  function deleteMember() {
    if (members.length <= 1) return;

    const confirmed = window.confirm(`Supprimer la fiche de ${selectedMember.name}?`);
    if (!confirmed) return;

    const nextMembers = members.filter((member) => member.id !== selectedMember.id);
    persist(nextMembers);
    setSelectedId(nextMembers[0]?.id);
    setEditing(false);
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await readImageAsDataUrl(file);
    updateSelected({ avatar: dataUrl });

    event.target.value = '';
  }

  function sendChatMessage(text = chatInput) {
    const clean = text.trim();
    if (!clean) return;

    const now = new Date();
    const time = now.toLocaleTimeString('fr-CA', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setChatMessages((prev) => [
      ...prev,
      { from: 'user', text: clean, time },
      {
        from: 'ai',
        text: 'Je l’ai noté. Lorsque le connecteur IA sera branché, je pourrai ajuster automatiquement la fiche, les repas recommandés et le menu hebdo.',
        time,
      },
    ]);

    setChatInput('');
  }

  if (!selectedMember) {
    return (
      <section className="hs-page">
        <button className="hs-btn hs-btn-primary" onClick={addMember}>
          + Ajouter un membre
        </button>
      </section>
    );
  }

  return (
    <section className="hs-household-page">
      <header className="hs-household-header">
        <div>
          <div className="hs-title-row">
            <span className="hs-title-icon">⌂</span>
            <h1>Membres du logis</h1>
          </div>
          <p>Gérez les profils de chaque membre de votre logis pour des recommandations personnalisées.</p>
        </div>

        <div className="hs-header-actions">
          <button className="hs-btn hs-btn-primary" onClick={addMember}>
            ✚ Ajouter un membre
          </button>
          <button className="hs-help-btn" title="Aide">
            ?
          </button>
        </div>
      </header>

      <div className="hs-household-layout">
        <aside className="hs-member-list hs-scroll-card">
          <h2>Membres du logis</h2>

          <div className="hs-member-stack">
            {members.map((member) => (
              <button
                key={member.id}
                className={`hs-member-card ${member.id === selectedMember.id ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedId(member.id);
                  setEditing(false);
                }}
              >
                <Avatar member={member} size="small" />
                <span>
                  <strong>{member.name}</strong>
                  <small>
                    {member.role}
                    {member.age ? ` · ${member.age}` : ''}
                  </small>
                  <span className="hs-tag-row">
                    {(member.tags || []).slice(0, 3).map((tag) => (
                      <em key={tag}>{tag}</em>
                    ))}
                  </span>
                </span>
              </button>
            ))}

            <button className="hs-add-member-card" onClick={addMember}>
              <span>＋</span>
              Ajouter un membre
            </button>
          </div>
        </aside>

        <main className="hs-profile-main">
          <section className="hs-hero-card hs-frame-card">
            <div className="hs-profile-portrait-wrap">
              <Avatar member={selectedMember} size="large" />
              <button className="hs-camera-btn" onClick={() => fileInputRef.current?.click()}>
                📷
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="hs-profile-heading">
              {editing ? (
                <>
                  <input
                    className="hs-title-input"
                    value={selectedMember.name}
                    onChange={(event) => updateSelected({ name: event.target.value })}
                  />
                  <div className="hs-inline-fields">
                    <input
                      value={selectedMember.role}
                      onChange={(event) => updateSelected({ role: event.target.value })}
                      placeholder="Rôle"
                    />
                    <input
                      value={selectedMember.age}
                      onChange={(event) => updateSelected({ age: event.target.value })}
                      placeholder="Âge"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2>{selectedMember.name}</h2>
                  <p>
                    {selectedMember.role}
                    {selectedMember.age ? ` · ${selectedMember.age}` : ''}
                  </p>
                </>
              )}

              <div className="hs-objective">
                <strong>Objectif principal</strong>
                {editing ? (
                  <textarea
                    value={selectedMember.objective}
                    onChange={(event) => updateSelected({ objective: event.target.value })}
                  />
                ) : (
                  <p>{selectedMember.objective}</p>
                )}
              </div>
            </div>

            <div className="hs-profile-actions">
              <button className="hs-btn hs-btn-parchment" onClick={() => setEditing((value) => !value)}>
                ✎ {editing ? 'Terminer' : 'Modifier la fiche'}
              </button>

              {editing && (
                <>
                  <button className="hs-btn hs-btn-danger" onClick={deleteMember}>
                    Supprimer
                  </button>
                  {selectedMember.avatar && (
                    <button className="hs-btn hs-btn-ghost" onClick={() => updateSelected({ avatar: '' })}>
                      Retirer la photo
                    </button>
                  )}
                </>
              )}

              <button className="hs-btn hs-btn-primary" onClick={() => sendChatMessage('Analyse ce profil et propose des améliorations.')}>
                💬 Discuter avec l’IA
              </button>

              <div className="hs-active-profile">
                <span />
                Profil actif
                <small>Utilisé dans les recommandations de menus et de recettes.</small>
              </div>
            </div>
          </section>

          <section className="hs-profile-grid">
            <Panel title="Données physiques & nutritionnelles" icon="⚕">
              <FieldGrid>
                <EditableField label="Grandeur" value={selectedMember.height} editing={editing} onChange={(value) => updateSelected({ height: value })} />
                <EditableField label="Poids actuel" value={selectedMember.currentWeight} editing={editing} onChange={(value) => updateSelected({ currentWeight: value })} />
                <EditableField label="Poids cible" value={selectedMember.targetWeight} editing={editing} onChange={(value) => updateSelected({ targetWeight: value })} />
                <EditableField label="Activité" value={selectedMember.activity} editing={editing} onChange={(value) => updateSelected({ activity: value })} />
                <EditableField label="Objectif" value={selectedMember.nutritionGoal} editing={editing} onChange={(value) => updateSelected({ nutritionGoal: value })} />
              </FieldGrid>

              <h4>Cibles nutritionnelles <small>par jour</small></h4>
              <div className="hs-macro-row">
                <Macro label="Calories" value={selectedMember.calories} editing={editing} onChange={(value) => updateSelected({ calories: value })} />
                <Macro label="Protéines" value={selectedMember.protein} editing={editing} onChange={(value) => updateSelected({ protein: value })} />
                <Macro label="Glucides" value={selectedMember.carbs} editing={editing} onChange={(value) => updateSelected({ carbs: value })} />
                <Macro label="Lipides" value={selectedMember.fat} editing={editing} onChange={(value) => updateSelected({ fat: value })} />
                <Macro label="Fibres" value={selectedMember.fiber} editing={editing} onChange={(value) => updateSelected({ fiber: value })} />
                <Macro label="Hydratation" value={selectedMember.hydration} editing={editing} onChange={(value) => updateSelected({ hydration: value })} />
              </div>
            </Panel>

            <Panel title="Santé, restrictions & précautions" icon="🛡">
              <EditableList
                title="Restrictions alimentaires"
                values={selectedMember.restrictions}
                editing={editing}
                onChange={(values) => updateSelected({ restrictions: values })}
              />

              <EditableList
                title="Conditions à considérer"
                values={selectedMember.conditions}
                editing={editing}
                onChange={(values) => updateSelected({ conditions: values })}
                danger
              />

              <div className="hs-severity">
                <strong>Niveau de sévérité</strong>
                {editing ? (
                  <select
                    value={selectedMember.severity}
                    onChange={(event) => updateSelected({ severity: event.target.value })}
                  >
                    <option>Informationnel</option>
                    <option>Important</option>
                    <option>Critique</option>
                  </select>
                ) : (
                  <span>{selectedMember.severity}</span>
                )}
              </div>
            </Panel>

            <Panel title="Préférences alimentaires" icon="❤">
              <div className="hs-two-columns">
                <EditableList
                  title="Aime"
                  values={selectedMember.likes}
                  editing={editing}
                  onChange={(values) => updateSelected({ likes: values })}
                  positive
                />
                <EditableList
                  title="N’aime pas / éviter"
                  values={selectedMember.dislikes}
                  editing={editing}
                  onChange={(values) => updateSelected({ dislikes: values })}
                  danger
                />
              </div>
            </Panel>

            <Panel title="Habitudes de vie & mode de vie" icon="☼">
              <FieldGrid>
                <EditableField label="Horaire" value={selectedMember.habits.schedule} editing={editing} onChange={(value) => updateSelectedNested('habits', { schedule: value })} />
                <EditableField label="Repas à la maison" value={selectedMember.habits.homeMeals} editing={editing} onChange={(value) => updateSelectedNested('habits', { homeMeals: value })} />
                <EditableField label="Lunch à prévoir" value={selectedMember.habits.lunch} editing={editing} onChange={(value) => updateSelectedNested('habits', { lunch: value })} />
                <EditableField label="Entraînement" value={selectedMember.habits.training} editing={editing} onChange={(value) => updateSelectedNested('habits', { training: value })} />
                <EditableField label="Sommeil" value={selectedMember.habits.sleep} editing={editing} onChange={(value) => updateSelectedNested('habits', { sleep: value })} />
                <EditableField label="Temps en cuisine" value={selectedMember.habits.kitchenTime} editing={editing} onChange={(value) => updateSelectedNested('habits', { kitchenTime: value })} />
                <EditableField label="Notes" value={selectedMember.habits.notes} editing={editing} onChange={(value) => updateSelectedNested('habits', { notes: value })} />
              </FieldGrid>
            </Panel>
          </section>

          <section className="hs-warning-banner">
            <span className="hs-warning-icon">⚠</span>
            <div>
              <strong>Attention pour {selectedMember.name}</strong>
              <p>
                Le menu de cette semaine pourrait contenir des repas qui entrent en conflit avec ce profil.
              </p>
            </div>
            <button className="hs-btn hs-btn-parchment">Voir les détails ›</button>
          </section>

          <p className="hs-tip">✧ Conseil : plus les profils sont complets, meilleures seront les suggestions de menus et de recettes pour votre logis.</p>
        </main>

        <aside className="hs-ai-panel hs-frame-card">
          <div className="hs-ai-header">
            <span className="hs-ai-orb">✦</span>
            <div>
              <h2>Assistant du profil</h2>
              <strong>{selectedMember.name}</strong>
              <p>L’IA connaît son profil et peut proposer des ajustements personnalisés.</p>
            </div>
          </div>

          <div className="hs-chat-log">
            {chatMessages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`hs-message ${message.from}`}>
                <p>{message.text}</p>
                <small>{message.time}</small>
              </div>
            ))}
          </div>

          <form
            className="hs-chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendChatMessage();
            }}
          >
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Écrire un message..."
            />
            <button type="submit">➤</button>
          </form>

          <div className="hs-ai-actions">
            <button onClick={() => sendChatMessage('Propose des repas compatibles avec ce profil.')}>🍲 Proposer des repas compatibles</button>
            <button onClick={() => sendChatMessage('Ajuste mes macros selon mon objectif.')}>⚖ Ajuster mes macros</button>
            <button onClick={() => sendChatMessage('Vérifie le menu de la semaine pour ce profil.')}>✨ Vérifier ce menu pour moi</button>
            <button onClick={() => sendChatMessage('Suggère des collations compatibles.')}>🍎 Suggestions de collations</button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Avatar({ member, size = 'small' }) {
  return (
    <span className={`hs-avatar hs-avatar-${size}`}>
      {member.avatar ? <img src={member.avatar} alt={member.name} /> : <strong>{getInitials(member.name)}</strong>}
    </span>
  );
}

function Panel({ title, icon, children }) {
  return (
    <section className="hs-panel hs-frame-card">
      <h3>
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function FieldGrid({ children }) {
  return <div className="hs-field-grid">{children}</div>;
}

function EditableField({ label, value, editing, onChange }) {
  return (
    <label className="hs-field">
      <span>{label}</span>
      {editing ? (
        <input value={value || ''} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <strong>{value || '—'}</strong>
      )}
    </label>
  );
}

function Macro({ label, value, editing, onChange }) {
  return (
    <label className="hs-macro">
      <span>✦</span>
      {editing ? (
        <input value={value || ''} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <strong>{value || '—'}</strong>
      )}
      <small>{label}</small>
    </label>
  );
}

function EditableList({ title, values, editing, onChange, positive = false, danger = false }) {
  return (
    <div className="hs-list-block">
      <h4>{title}</h4>

      {editing ? (
        <textarea
          value={listToText(values)}
          onChange={(event) => onChange(textToList(event.target.value))}
          placeholder="Un élément par ligne"
        />
      ) : (
        <ul className={positive ? 'is-positive' : danger ? 'is-danger' : ''}>
          {(values || []).length ? (
            values.map((item) => <li key={item}>{item}</li>)
          ) : (
            <li className="is-empty">Aucun élément</li>
          )}
        </ul>
      )}
    </div>
  );
}