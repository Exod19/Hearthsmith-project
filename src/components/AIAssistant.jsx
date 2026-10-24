// =============================================================
//  AIAssistant.jsx — Assistant IA (clé API fournie par l'usager)
// -------------------------------------------------------------
//  L'IA reçoit les recettes, le menu actif et les profils du
//  logis, puis renvoie un JSON que l'on applique sur demande.
// =============================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { DAYS, MEAL_TYPES } from '../data/defaults.js';
import { Card, PageHeader, useToast } from './ui.jsx';

const SYSTEM_PROMPT = `
Tu es l'assistant nutritionnel et organisationnel d'une famille québécoise.

Tu aides à créer des fiches repas, compléter les fiches existantes (macros manquantes),
générer des menus hebdomadaires, produire un plan de meal prep et adapter les repas
aux profils des membres du logis (restrictions, aversions, objectifs).

Règles :
- Réponds en français québécois.
- Ne donne pas d'avis médical.
- Respecte les restrictions et aversions des membres actifs.
- Si tu estimes des macros, indique-le dans « notes ».
- mealTypes possibles : dejeuner, diner, souper, collation.
- assignedTo : ids des membres (laisser vide si pour tout le monde).
- ingredients : tableau de chaînes « quantité unité produit, préparation » (ex. « 1 tête de brocoli, en fleurettes »,
  « 200 g poulet »). Le produit vient avant la virgule ; la préparation après.
- instructions : une étape par ligne.
- Pour un menu, utilise les ids des fiches existantes ou de celles que tu crées
  (donne alors un id unique aux nouvelles fiches, ex. « ai_poulet_citron »).
- Jours du menu : lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche.
- Retourne uniquement du JSON valide, sans markdown.

Format de réponse :
{
  "message": "Résumé de ce que tu proposes.",
  "createMeals": [{ "id": "", "name": "", "mealTypes": [], "macros": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0 }, "servings": 4, "prepTime": 30, "assignedTo": [], "ingredients": [], "instructions": "", "notes": "" }],
  "updateMeals": [{ "id": "id existant", "...champs à modifier": "" }],
  "weeklyMenu": null ou { "name": "", "days": { "lundi": { "dejeuner": "id", "diner": "id", "souper": "id", "collations": ["id"] } } },
  "mealPrepPlan": "",
  "questions": []
}
`;

const PROVIDERS = {
  groq: { label: 'Groq', endpoint: 'https://api.groq.com/openai/v1/chat/completions', model: 'openai/gpt-oss-120b', mode: 'chat', keyHint: 'gsk_…' },
  openai: { label: 'OpenAI', endpoint: 'https://api.openai.com/v1/responses', model: 'gpt-5-mini', mode: 'responses', keyHint: 'sk-…' },
  custom: { label: 'Compatible OpenAI', endpoint: '', model: '', mode: 'chat', keyHint: 'clé API' },
};

const EXAMPLES = [
  'Crée 5 recettes simples et familiales, riches en protéines.',
  'Complète les macros manquantes de mes recettes.',
  'Produis le menu de la semaine avec mes recettes.',
  'Fais un plan de meal prep en 2 blocs pour cette semaine.',
];

const STORE = {
  get: (k, fallback = '') => {
    try {
      return localStorage.getItem(`hearthsmith_ai_${k}`) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(`hearthsmith_ai_${k}`, v);
    } catch {
      /* stockage indisponible : la valeur reste en mémoire */
    }
  },
};

/** Extrait l'objet JSON d'une réponse (blocs ```json, réflexion <think>, texte autour). */
function parseJson(text) {
  const clean = text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/```(?:json)?/gi, '')
    .trim();
  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(clean.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function buildContext({ meals, menu, members }) {
  return {
    jours: DAYS.map((d) => d.id),
    typesDeRepas: MEAL_TYPES.map((t) => t.id),
    membres: members
      .filter((m) => m.activeProfile)
      .map((m) => ({
        id: m.id,
        nom: m.name,
        role: m.role,
        age: m.age,
        objectif: m.objective,
        restrictions: m.restrictions,
        conditions: m.conditions,
        aime: m.likes,
        evite: m.dislikes,
        cibles: { calories: m.calories, proteines: m.protein, glucides: m.carbs, lipides: m.fat, fibres: m.fiber },
      })),
    menuActif: { id: menu.id, nom: menu.name, jours: menu.days },
    recettes: meals.map((m) => ({
      id: m.id,
      name: m.name,
      mealTypes: m.mealTypes,
      macros: m.macros,
      assignedTo: m.assignedTo,
      ingredients: m.ingredients,
    })),
  };
}

// ---- Modèles offerts par le fournisseur ----
// Les fournisseurs retirent régulièrement des modèles : on lit la liste réelle avec la clé.
const NOT_CHAT = /whisper|tts|guard|embed|moderation|audio|image|dall-e|transcribe|realtime|search|playai|orpheus|compound|babbage|davinci/i;
const PREFERRED_MODELS = [/gpt-oss-120b/, /llama-4-maverick/, /llama.*70b/, /kimi-k2/, /qwen3?-32b/, /gpt-5-mini/, /gpt-4\.1-mini/, /gpt-4o-mini/];

async function listModels(endpoint, apiKey) {
  const url = endpoint.replace(/\/(chat\/completions|responses)\/?$/, '/models');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error(res.status === 401 ? 'Clé API refusée.' : `Liste des modèles indisponible (${res.status}).`);
  const data = await res.json();
  return (data.data || [])
    .filter((m) => m.active !== false)
    .map((m) => m.id)
    .filter((id) => !NOT_CHAT.test(id))
    .sort();
}

const pickModel = (ids) => PREFERRED_MODELS.map((re) => ids.find((id) => re.test(id))).find(Boolean) || ids[0];

const JSON_REMINDER = 'Ta réponse précédente n’était pas un objet JSON valide. Renvoie uniquement l’objet JSON demandé, complet, sans texte autour.';

async function requestAI({ provider, endpoint, model, apiKey, messages, jsonMode }) {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };
  const body =
    provider.mode === 'responses'
      ? { model, input: messages, max_output_tokens: 8000 }
      : { model, temperature: 0.3, max_tokens: 8000, ...(jsonMode && { response_format: { type: 'json_object' } }), messages };

  const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!response.ok) {
    const details = await response.json().catch(() => null);
    const error = new Error(response.status === 401 ? 'Clé API refusée.' : details?.error?.message || `Erreur ${response.status}`);
    error.code = details?.error?.code;
    throw error;
  }
  const data = await response.json();
  const choice = data.choices?.[0];
  const text =
    provider.mode === 'responses'
      ? data.output_text || data.output?.flatMap((o) => o.content || []).map((c) => c.text || '').join('') || ''
      : choice?.message?.content || '';
  const truncated = choice?.finish_reason === 'length' || data.status === 'incomplete';
  return { text, truncated };
}

/**
 * Appelle l'IA et renvoie toujours un objet de résultat :
 * JSON valide → proposition applicable ; sinon un second essai,
 * puis, au pire, le texte brut affiché comme simple réponse.
 */
async function callAI({ provider, endpoint, model, apiKey, request, context, history, jsonMode = true }) {
  const user = JSON.stringify({ demande: request, contexte: context, historique: history }, null, 1);
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: user },
  ];
  const opts = { provider, endpoint, model, apiKey, jsonMode };

  let { text, truncated } = await requestAI({ ...opts, messages });
  let result = text && parseJson(text);
  if (result) return result;

  if (truncated) throw new Error('La réponse a été coupée parce qu’elle était trop longue. Demandez moins d’éléments à la fois (par exemple 3 recettes).');

  // Second essai : on rappelle le format attendu.
  ({ text, truncated } = await requestAI({ ...opts, messages: [...messages, { role: 'assistant', content: text || '…' }, { role: 'user', content: JSON_REMINDER }] }));
  result = text && parseJson(text);
  if (result) return result;
  if (!text) throw new Error('L’IA n’a rien renvoyé. Essayez un autre modèle dans la configuration.');

  // Dernier recours : afficher la réponse telle quelle, sans changement applicable.
  return { message: `${text.trim().slice(0, 3000)}\n\n(Réponse libre : rien à appliquer automatiquement. Essayez un autre modèle pour obtenir une proposition applicable.)` };
}

export default function AIAssistant({ meals, menu, members, actions, draft, onDraftUsed, onGoTo }) {
  const notify = useToast();
  const [providerId, setProviderId] = useState(() => STORE.get('provider', 'groq'));
  const [apiKey, setApiKey] = useState(() => STORE.get('api_key'));
  const [model, setModel] = useState(() => STORE.get('model', PROVIDERS.groq.model));
  const [customEndpoint, setCustomEndpoint] = useState(() => STORE.get('custom_endpoint'));
  const [showSettings, setShowSettings] = useState(() => !STORE.get('api_key'));
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [models, setModels] = useState([]);
  const [modelsError, setModelsError] = useState('');
  const promptRef = useRef(null);
  const logRef = useRef(null);

  const provider = PROVIDERS[providerId] || PROVIDERS.groq;
  const endpoint = providerId === 'custom' ? customEndpoint.trim() : provider.endpoint;
  const context = useMemo(() => buildContext({ meals, menu, members }), [meals, menu, members]);

  // Demande préparée depuis un autre onglet (ex. Membres du logis).
  useEffect(() => {
    if (!draft) return;
    setPrompt(draft);
    onDraftUsed();
    promptRef.current?.focus();
  }, [draft, onDraftUsed]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  // Liste des modèles disponibles dès qu'une clé est saisie ; corrige un modèle retiré.
  useEffect(() => {
    if (!apiKey.trim() || !endpoint) {
      setModels([]);
      return undefined;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const ids = await listModels(endpoint, apiKey.trim());
        if (cancelled) return;
        setModels(ids);
        setModelsError('');
        if (ids.length && !ids.includes(model)) {
          const next = pickModel(ids);
          setModel(next);
          STORE.set('model', next);
        }
      } catch (err) {
        if (!cancelled) setModelsError(err.message);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // Le modèle courant n'est vérifié qu'au changement de clé ou de fournisseur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, endpoint]);

  const save = (key, setter) => (value) => {
    setter(value);
    STORE.set(key, value);
  };

  function changeProvider(id) {
    setProviderId(id);
    STORE.set('provider', id);
    save('model', setModel)(PROVIDERS[id].model);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const request = prompt.trim();
    if (!request) return;
    if (!apiKey.trim() || !model.trim() || !endpoint) {
      setShowSettings(true);
      setError('Configurez le fournisseur, le modèle et la clé API avant d’envoyer une demande.');
      return;
    }
    setBusy(true);
    setError('');
    setPending(null);
    setMessages((m) => [...m, { role: 'user', content: request }]);
    setPrompt('');
    try {
      const args = { provider, endpoint, model, apiKey, request, context, history: messages.slice(-6).map(({ role, content }) => ({ role, content })) };
      let result;
      try {
        result = await callAI(args).catch((err) =>
          // Certains modèles refusent le mode JSON imposé : on réessaie sans.
          /response_format|json/i.test(err.message) && err.code !== 'model_not_found' ? callAI({ ...args, jsonMode: false }) : Promise.reject(err)
        );
      } catch (err) {
        if (err.code !== 'model_not_found') throw err;
        // Modèle retiré par le fournisseur : on bascule sur un modèle disponible et on réessaie.
        const ids = await listModels(endpoint, apiKey);
        const next = pickModel(ids.filter((id) => id !== model));
        if (!next) throw err;
        setModels(ids);
        save('model', setModel)(next);
        notify(`Le modèle « ${model} » n’existe plus : bascule sur « ${next} ».`);
        result = await callAI({ ...args, model: next });
      }
      setMessages((m) => [...m, { role: 'assistant', content: result.message || 'Proposition prête.', questions: result.questions }]);
      const hasChanges = result.createMeals?.length || result.updateMeals?.length || result.weeklyMenu || result.mealPrepPlan;
      setPending(hasChanges ? result : null);
    } catch (err) {
      console.error(err);
      setError(`La demande a échoué : ${err.message}`);
      setMessages((m) => m.slice(0, -1));
      setPrompt(request);
    } finally {
      setBusy(false);
    }
  }

  function applyPending() {
    actions.applyAIResult(pending);
    const parts = [];
    if (pending.createMeals?.length) parts.push(`${pending.createMeals.length} recette(s) ajoutée(s)`);
    if (pending.updateMeals?.length) parts.push(`${pending.updateMeals.length} recette(s) mise(s) à jour`);
    if (pending.weeklyMenu) parts.push('menu de la semaine rempli');
    if (pending.mealPrepPlan) parts.push('plan de meal prep ajouté');
    notify(parts.join(', ') || 'Changements appliqués');
    setPending(null);
  }

  const configured = Boolean(apiKey && model && endpoint);

  return (
    <div className="page">
      <PageHeader
        icon="✨"
        title="Assistant"
        subtitle="Demandez des recettes, un menu complet ou un plan de meal prep. L’assistant connaît vos recettes, votre semaine et les profils du logis."
        actions={
          <button type="button" className="btn btn--parchment" onClick={() => setShowSettings((v) => !v)} aria-expanded={showSettings}>
            ⚙ {configured ? `${provider.label} · ${model}` : 'Configurer'}
          </button>
        }
      />

      {showSettings && (
        <Card title="Connexion à l’IA" icon="🔑" className="ai-settings">
          <div className="field-row">
            <label className="field">
              <span>Fournisseur</span>
              <select className="input" value={providerId} onChange={(e) => changeProvider(e.target.value)}>
                {Object.entries(PROVIDERS).map(([id, p]) => (
                  <option key={id} value={id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Modèle</span>
              {models.length ? (
                <select className="input" value={model} onChange={(e) => save('model', setModel)(e.target.value)}>
                  {!models.includes(model) && <option value={model}>{model}</option>}
                  {models.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              ) : (
                <input className="input" value={model} onChange={(e) => save('model', setModel)(e.target.value)} placeholder={provider.model || 'nom du modèle'} />
              )}
            </label>
            <label className="field">
              <span>Clé API</span>
              <input className="input" type="password" autoComplete="off" value={apiKey} onChange={(e) => save('api_key', setApiKey)(e.target.value)} placeholder={provider.keyHint} />
            </label>
          </div>
          {providerId === 'custom' && (
            <label className="field">
              <span>Adresse de l’API (compatible OpenAI)</span>
              <input className="input" value={customEndpoint} onChange={(e) => save('custom_endpoint', setCustomEndpoint)(e.target.value)} placeholder="https://…/v1/chat/completions" />
            </label>
          )}
          {modelsError && <p className="form-error">{modelsError}</p>}
          <p className="hint">
            🔒 La clé reste dans ce navigateur et n’est envoyée qu’au fournisseur choisi. N’utilisez pas cette page sur un ordinateur partagé.
          </p>
          {configured && (
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setShowSettings(false)}>
              ✓ Terminé
            </button>
          )}
        </Card>
      )}

      <div className="ai-layout">
        <Card className="ai-chat">
          <div className="ai-log" ref={logRef} aria-live="polite">
            {messages.length === 0 && (
              <div className="ai-welcome">
                <span aria-hidden="true">🔮</span>
                <p>Par où commencer ? Essayez une de ces demandes :</p>
                <div className="ai-examples">
                  {EXAMPLES.map((ex) => (
                    <button key={ex} type="button" className="chip" onClick={() => setPrompt(ex)}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`bubble bubble--${m.role}`}>
                <p>{m.content}</p>
                {m.questions?.length > 0 && (
                  <ul>
                    {m.questions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {busy && (
              <div className="bubble bubble--assistant bubble--typing" aria-label="L’assistant réfléchit">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <form className="ai-form" onSubmit={handleSubmit}>
            <textarea
              ref={promptRef}
              className="input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e);
              }}
              placeholder="Ex. Génère le menu de la semaine en évitant les soupers trop lourds du lundi au jeudi."
              aria-label="Votre demande"
            />
            <button type="submit" className="btn btn--primary" disabled={busy || !prompt.trim()}>
              {busy ? 'Réflexion…' : 'Envoyer ➤'}
            </button>
          </form>
        </Card>

        <aside>
          {pending ? (
            <Card title="Proposition à appliquer" icon="📦" className="ai-pending">
              <ul className="ai-summary">
                {pending.createMeals?.length > 0 && (
                  <li>
                    <strong>{pending.createMeals.length}</strong> nouvelle(s) recette(s)
                    <small>{pending.createMeals.map((m) => m.name).join(', ')}</small>
                  </li>
                )}
                {pending.updateMeals?.length > 0 && (
                  <li>
                    <strong>{pending.updateMeals.length}</strong> recette(s) mise(s) à jour
                  </li>
                )}
                {pending.weeklyMenu && <li>🗓 Menu de la semaine pour « {menu.name} »</li>}
                {pending.mealPrepPlan && <li>🧑‍🍳 Plan de meal prep</li>}
              </ul>
              <details>
                <summary>Voir le détail technique</summary>
                <pre>{JSON.stringify(pending, null, 2)}</pre>
              </details>
              <div className="toolbar">
                <button type="button" className="btn btn--primary" onClick={applyPending}>
                  ✓ Appliquer
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setPending(null)}>
                  Ignorer
                </button>
              </div>
            </Card>
          ) : (
            <Card title="Ce que l’assistant voit" icon="👁">
              <ul className="ai-summary">
                <li>
                  <strong>{meals.length}</strong> recettes
                </li>
                <li>
                  🗓 Semaine « {menu.name} »
                </li>
                <li>
                  <strong>{members.filter((m) => m.activeProfile).length}</strong> profils actifs
                  <button type="button" className="link" onClick={() => onGoTo('logis')}>
                    Voir
                  </button>
                </li>
              </ul>
              <p className="hint">Rien n’est modifié sans votre accord : chaque proposition s’applique en un clic.</p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
