import React, { useMemo, useState } from 'react';

const severityLabels = {
  information: 'Information',
  attention: 'Attention',
  important: 'Important',
  critical: 'Critique',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatTarget(value, suffix) {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}${suffix}`;
}

export default function HouseholdMembers({
  members = [],
  meals = [],
  activeMenu = null,
  onAddMember,
  onUpdateMember,
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(
    members[0]?.id || null
  );

  const selectedMember = useMemo(() => {
    return members.find((member) => member.id === selectedMemberId) || members[0];
  }, [members, selectedMemberId]);

  const activeAlerts = useMemo(() => {
    if (!selectedMember) return [];

    const memberName = selectedMember.name || 'ce membre';
    const restrictions = selectedMember.restrictions || [];

    if (!restrictions.length && !selectedMember.healthConsiderations?.length) {
      return [];
    }

    return [
      {
        id: 'alert_profile_001',
        severity: 'important',
        title: `Attention pour ${memberName}`,
        message:
          'Le menu de cette semaine pourrait contenir des repas qui entrent en conflit avec ce profil.',
        details: restrictions.slice(0, 3),
      },
    ];
  }, [selectedMember, activeMenu, meals]);

  const handleAdd = () => {
    const newId = onAddMember?.();
    if (newId) setSelectedMemberId(newId);
  };

  if (!selectedMember) {
    return (
      <section className="hs-members-page">
        <div className="hs-members-empty hs-panel">
          <h1 className="hs-page-title">Membres du logis</h1>
          <p className="hs-page-kicker">
            Créez un premier profil pour personnaliser vos menus.
          </p>
          <button className="hs-button" type="button" onClick={handleAdd}>
            + Ajouter un membre
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="hs-members-page">
      <header className="hs-members-header hs-card">
        <div>
          <h1 className="hs-page-title">
            <span aria-hidden="true">🏠</span> Membres du logis
          </h1>
          <p className="hs-page-kicker">
            Gérez les portraits de chaque membre pour des recommandations personnalisées.
          </p>
        </div>

        <div className="hs-members-header__actions">
          <button className="hs-button" type="button" onClick={handleAdd}>
            + Ajouter un membre
          </button>
          <button className="hs-button hs-button--secondary" type="button">
            ?
          </button>
        </div>
      </header>

      <div className="hs-members-layout">
        <aside className="hs-members-sidebar hs-panel">
          <h2 className="hs-section-title">Membres du logis</h2>

          <div className="hs-member-list">
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                className={`hs-member-list-item ${
                  selectedMember?.id === member.id ? 'is-active' : ''
                }`}
                onClick={() => setSelectedMemberId(member.id)}
              >
                <div className="hs-member-list-item__avatar">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.name} />
                  ) : (
                    <span>{getInitials(member.name)}</span>
                  )}
                </div>

                <div className="hs-member-list-item__content">
                  <strong>{member.name}</strong>
                  <span>
                    {member.role}
                    {member.age ? ` · ${member.age} ans` : ''}
                  </span>

                  <div className="hs-member-tags">
                    {(member.tags || []).slice(0, 3).map((tag) => (
                      <span className="hs-badge" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              className="hs-member-add-card"
              onClick={handleAdd}
            >
              <span>＋</span>
              Ajouter un membre
            </button>
          </div>
        </aside>

        <main className="hs-members-main">
          <section className="hs-member-hero hs-card">
            <div className="hs-member-portrait">
              {selectedMember.avatarUrl ? (
                <img src={selectedMember.avatarUrl} alt={selectedMember.name} />
              ) : (
                <span>{getInitials(selectedMember.name)}</span>
              )}
              <button type="button" className="hs-member-portrait__camera">
                📷
              </button>
            </div>

            <div className="hs-member-hero__content">
              <h2>{selectedMember.name}</h2>
              <p>
                {selectedMember.role}
                {selectedMember.age ? ` · ${selectedMember.age} ans` : ''}
              </p>

              <div className="hs-member-objective">
                <span aria-hidden="true">🎯</span>
                <div>
                  <strong>Objectif principal</strong>
                  <p>{selectedMember.objective || 'Aucun objectif défini.'}</p>
                </div>
              </div>
            </div>

            <div className="hs-member-hero__actions">
              <button
                className="hs-button hs-button--secondary"
                type="button"
                onClick={() =>
                  onUpdateMember?.(selectedMember.id, {
                    name: prompt('Nom du membre', selectedMember.name) || selectedMember.name,
                  })
                }
              >
                ✎ Modifier la fiche
              </button>
              <button className="hs-button" type="button">
                💬 Discuter avec l’IA
              </button>

              <div className="hs-member-active-status">
                <span className="hs-status-dot" />
                <div>
                  <strong>Profil actif</strong>
                  <p>Utilisé dans les recommandations de menus et recettes.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="hs-member-grid">
            <article className="hs-card">
              <h3 className="hs-section-title">Données physiques & nutritionnelles</h3>

              <dl className="hs-data-list">
                <div>
                  <dt>Grandeur</dt>
                  <dd>{formatTarget(selectedMember.heightCm, ' cm')}</dd>
                </div>
                <div>
                  <dt>Poids actuel</dt>
                  <dd>{formatTarget(selectedMember.currentWeightKg, ' kg')}</dd>
                </div>
                <div>
                  <dt>Poids cible</dt>
                  <dd>{formatTarget(selectedMember.targetWeightKg, ' kg')}</dd>
                </div>
                <div>
                  <dt>Activité</dt>
                  <dd>{selectedMember.activityLevel || '—'}</dd>
                </div>
              </dl>

              <h4>Cibles nutritionnelles <span>par jour</span></h4>

              <div className="hs-nutrition-targets">
                <div>
                  <strong>{formatTarget(selectedMember.nutritionTargets?.calories, '')}</strong>
                  <span>Calories</span>
                </div>
                <div>
                  <strong>{formatTarget(selectedMember.nutritionTargets?.proteinG, ' g')}</strong>
                  <span>Protéines</span>
                </div>
                <div>
                  <strong>{formatTarget(selectedMember.nutritionTargets?.carbsG, ' g')}</strong>
                  <span>Glucides</span>
                </div>
                <div>
                  <strong>{formatTarget(selectedMember.nutritionTargets?.fatG, ' g')}</strong>
                  <span>Lipides</span>
                </div>
                <div>
                  <strong>{formatTarget(selectedMember.nutritionTargets?.fiberG, ' g')}</strong>
                  <span>Fibres</span>
                </div>
                <div>
                  <strong>{formatTarget(selectedMember.nutritionTargets?.hydrationL, ' L')}</strong>
                  <span>Hydratation</span>
                </div>
              </div>

              <button className="hs-button hs-button--secondary" type="button">
                ✨ Compléter / ajuster avec l’IA
              </button>
            </article>

            <article className="hs-card">
              <h3 className="hs-section-title">Santé, restrictions & précautions</h3>

              <h4>Restrictions alimentaires</h4>
              <ul className="hs-simple-list">
                {(selectedMember.restrictions || []).map((restriction) => (
                  <li key={restriction}>{restriction}</li>
                ))}
              </ul>

              <h4>Conditions à considérer</h4>
              <div className="hs-health-list">
                {(selectedMember.healthConsiderations || []).map((item) => (
                  <div className="hs-health-item" key={item.label}>
                    <span className={`hs-severity-dot is-${item.severity}`} />
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.notes}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="hs-button hs-button--secondary" type="button">
                Modifier
              </button>
            </article>

            <article className="hs-card">
              <h3 className="hs-section-title">Préférences alimentaires</h3>

              <div className="hs-preferences-columns">
                <div>
                  <h4>Aime</h4>
                  <ul className="hs-check-list">
                    {(selectedMember.preferences?.likes || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4>N’aime pas / éviter</h4>
                  <ul className="hs-warning-list">
                    {(selectedMember.preferences?.dislikes || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedMember.preferences?.notes && (
                <p className="hs-member-note">{selectedMember.preferences.notes}</p>
              )}
            </article>

            <article className="hs-card">
              <h3 className="hs-section-title">Habitudes de vie & mode de vie</h3>

              <dl className="hs-data-list">
                <div>
                  <dt>Horaire</dt>
                  <dd>{selectedMember.lifestyle?.schedule || '—'}</dd>
                </div>
                <div>
                  <dt>Lunch à prévoir</dt>
                  <dd>{selectedMember.lifestyle?.lunchNeeds || '—'}</dd>
                </div>
                <div>
                  <dt>Entraînement</dt>
                  <dd>{selectedMember.lifestyle?.training || '—'}</dd>
                </div>
                <div>
                  <dt>Sommeil</dt>
                  <dd>{selectedMember.lifestyle?.sleep || '—'}</dd>
                </div>
                <div>
                  <dt>Temps cuisine</dt>
                  <dd>{selectedMember.lifestyle?.cookingTime || '—'}</dd>
                </div>
              </dl>
            </article>
          </section>

          {activeAlerts.length > 0 && (
            <section className="hs-member-alert hs-card">
              <div className="hs-member-alert__icon">⚠️</div>
              <div>
                <strong>{activeAlerts[0].title}</strong>
                <p>{activeAlerts[0].message}</p>
              </div>
              <button className="hs-button hs-button--secondary" type="button">
                Voir les détails →
              </button>
            </section>
          )}
        </main>

        <aside className="hs-profile-assistant hs-panel">
          <div className="hs-profile-assistant__header">
            <div>
              <h2 className="hs-section-title">Assistant du profil</h2>
              <strong>{selectedMember.name}</strong>
              <p>
                L’IA connaît son profil et peut proposer des ajustements personnalisés.
              </p>
            </div>
            <button type="button" className="hs-icon-button-dark">
              ×
            </button>
          </div>

          <div className="hs-profile-chat">
            <div className="hs-profile-message is-user">
              Peux-tu analyser mon profil et me dire s’il manque quelque chose?
              <span>10:32</span>
            </div>

            <div className="hs-profile-message is-ai">
              Ton profil est déjà très complet. Je pourrais encore préciser le niveau de sensibilité FODMAP, les collations préférées et le niveau d’énergie.
              <span>10:33</span>
            </div>

            <div className="hs-profile-message is-user">
              Ajoute que je préfère les lunchs froids et sans réchauffe.
              <span>10:34</span>
            </div>

            <div className="hs-profile-message is-ai">
              C’est ajouté au profil.
              <span>10:35</span>
            </div>
          </div>

          <div className="hs-profile-chat-input">
            <input type="text" placeholder="Écrire un message..." />
            <button type="button">➤</button>
          </div>

          <div className="hs-profile-actions">
            <button type="button">🍲 Proposer des repas compatibles</button>
            <button type="button">⚖️ Ajuster mes macros</button>
            <button type="button">✨ Vérifier ce menu pour moi</button>
            <button type="button">🥣 Suggestions de collations</button>
          </div>
        </aside>
      </div>

      <p className="hs-members-tip">
        ✨ Conseil : plus les profils sont complets, meilleures seront les suggestions de menus et de recettes pour votre logis.
      </p>
    </section>
  );
}