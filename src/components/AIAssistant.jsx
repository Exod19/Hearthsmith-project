import React, { useMemo, useState } from 'react';

const AI_SYSTEM_PROMPT = `
Tu es l'assistant nutritionnel et organisationnel d'une famille québécoise.

Tu aides à:
- créer des fiches repas structurées;
- compléter les champs vides des fiches existantes;
- estimer les macros quand elles sont absentes;
- générer des menus hebdomadaires à partir des fiches disponibles;
- produire un plan de meal prep réaliste;
- proposer des ajustements selon les contraintes familiales.

Règles importantes:
- Réponds toujours en français québécois.
- Ne donne pas d'avis médical.
- Si tu estimes des macros, indique dans notes que ce sont des estimations.
- Respecte les mealTypes disponibles: dejeuner, diner, souper, collation.
- Respecte les membres disponibles: samuel, anne-marie, jeanne, eleonore.
- Pour les menus, utilise les ids des fiches repas existantes quand c'est possible.
- Si tu crées de nouvelles fiches repas, remplis tous les champs utiles.
- Ne mets jamais d'image réelle. Laisse image vide.
- Retourne toujours un JSON valide, sans markdown, sans texte avant ou après.

Format de réponse obligatoire:
{
  "message": "Résumé humain de ce que tu proposes.",
  "createMeals": [],
  "updateMeals": [],
  "weeklyMenu": null,
  "mealPrepPlan": "",
  "questions": []
}

Structure d'une fiche repas:
{
  "name": "",
  "image": "",
  "mealTypes": [],
  "macros": {
    "calories": "",
    "protein": "",
    "carbs": "",
    "fat": "",
    "fiber": ""
  },
  "assignedTo": [],
  "ingredients": [],
  "instructions": "",
  "notes": ""
}
`;

const AI_PROVIDERS = {
  groq: {
    label: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    mode: 'chatCompletions',
  },
  openai: {
    label: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/responses',
    defaultModel: 'gpt-5-mini',
    mode: 'responses',
  },
  custom: {
    label: 'Custom compatible OpenAI',
    endpoint: '',
    defaultModel: '',
    mode: 'chatCompletions',
  },
};

const DEFAULT_EXAMPLES = [
  'Crée-moi 5 fiches repas simples, familiales, riches en protéines.',
  'Complète les macros manquantes de mes fiches repas existantes.',
  'Produis mon menu hebdomadaire à partir des fiches disponibles.',
  'Fais-moi un plan meal prep pour préparer les repas de la semaine en 2 blocs.',
];

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      throw error;
    }

    const possibleJson = text.slice(firstBrace, lastBrace + 1);
    return JSON.parse(possibleJson);
  }
}

function buildCompactContext({
  meals,
  menus,
  activeMenu,
  mealTypes,
  familyMembers,
}) {
  return {
    mealTypes,
    familyMembers,
    activeMenu,
    menus: menus.map((menu) => ({
      id: menu.id,
      name: menu.name,
      description: menu.description,
      days: menu.days,
    })),
    meals: meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      mealTypes: meal.mealTypes || [],
      macros: meal.macros || {},
      assignedTo: meal.assignedTo || [],
      ingredients: meal.ingredients || [],
      instructions: meal.instructions || '',
      notes: meal.notes || '',
    })),
  };
}

export default function AIAssistant({
  meals = [],
  menus = [],
  activeMenu = null,
  mealTypes = [],
  familyMembers = [],
  onApplyResult,
}) {
  const [provider, setProvider] = useState(
    () => localStorage.getItem('hearthsmith_ai_provider') || 'groq'
  );

  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('hearthsmith_ai_api_key') || ''
  );

  const [model, setModel] = useState(
    () =>
      localStorage.getItem('hearthsmith_ai_model') ||
      AI_PROVIDERS.groq.defaultModel
  );

  const [customEndpoint, setCustomEndpoint] = useState(
    () => localStorage.getItem('hearthsmith_ai_custom_endpoint') || ''
  );

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const activeProvider = AI_PROVIDERS[provider] || AI_PROVIDERS.groq;

  const activeEndpoint =
    provider === 'custom' ? customEndpoint.trim() : activeProvider.endpoint;

  const compactContext = useMemo(
    () =>
      buildCompactContext({
        meals,
        menus,
        activeMenu,
        mealTypes,
        familyMembers,
      }),
    [meals, menus, activeMenu, mealTypes, familyMembers]
  );

  function handleProviderChange(nextProvider) {
    const nextConfig = AI_PROVIDERS[nextProvider] || AI_PROVIDERS.groq;

    setProvider(nextProvider);
    setModel(nextConfig.defaultModel);

    localStorage.setItem('hearthsmith_ai_provider', nextProvider);
    localStorage.setItem('hearthsmith_ai_model', nextConfig.defaultModel);
  }

  function handleSaveApiKey(value) {
    setApiKey(value);
    localStorage.setItem('hearthsmith_ai_api_key', value);
  }

  function handleSaveModel(value) {
    setModel(value);
    localStorage.setItem('hearthsmith_ai_model', value);
  }

  function handleSaveCustomEndpoint(value) {
    setCustomEndpoint(value);
    localStorage.setItem('hearthsmith_ai_custom_endpoint', value);
  }

  async function callAI(userPrompt) {
    if (!activeEndpoint) {
      throw new Error('Aucun endpoint AI configuré.');
    }

    const payload = {
      demande: userPrompt,
      contexteActuel: compactContext,
      historiqueConversation: messages.slice(-8),
    };

    if (activeProvider.mode === 'responses') {
      const response = await fetch(activeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: 'system',
              content: AI_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: JSON.stringify(payload, null, 2),
            },
          ],
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || 'Erreur lors de l’appel AI.');
      }

      const data = await response.json();

      const text =
        data.output_text ||
        data.output
          ?.flatMap((item) => item.content || [])
          ?.map((content) => content.text || '')
          ?.join('') ||
        '';

      if (!text) {
        throw new Error("L'AI n'a pas retourné de texte.");
      }

      return safeJsonParse(text);
    }

    const response = await fetch(activeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: AI_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: JSON.stringify(payload, null, 2),
          },
        ],
        response_format: {
          type: 'json_object',
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || 'Erreur lors de l’appel AI.');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    if (!text) {
      throw new Error("L'AI n'a pas retourné de texte.");
    }

    return safeJsonParse(text);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!apiKey.trim()) {
      setError('Ajoute ta clé API avant de lancer une demande.');
      return;
    }

    if (!model.trim()) {
      setError('Ajoute un modèle AI avant de lancer une demande.');
      return;
    }

    if (!activeEndpoint) {
      setError('Ajoute un endpoint AI valide avant de lancer une demande.');
      return;
    }

    if (!prompt.trim()) return;

    const userPrompt = prompt.trim();

    setBusy(true);
    setError('');
    setPrompt('');
    setLastResult(null);

    try {
      const result = await callAI(userPrompt);

      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: userPrompt,
        },
        {
          role: 'assistant',
          content: result.message || 'Résultat généré.',
          result,
        },
      ]);

      setLastResult(result);
    } catch (err) {
      console.error(err);
      setError(
        "La demande AI a échoué. Vérifie ta clé API, le modèle, le fournisseur ou le format de réponse."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleApplyLastResult() {
    if (!lastResult) return;

    onApplyResult?.(lastResult);
    setLastResult(null);
  }

  return (
    <section className="ai-assistant">
      <div className="ai-assistant__header">
        <div>
          <h2>Assistant AI</h2>
          <p>
            Demande à l’AI de créer des fiches repas, compléter les macros,
            générer un menu hebdomadaire ou préparer ton plan meal prep.
          </p>
        </div>
      </div>

      <div className="ai-assistant__settings">
        <label>
          Fournisseur AI
          <select
            value={provider}
            onChange={(event) => handleProviderChange(event.target.value)}
          >
            {Object.entries(AI_PROVIDERS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </label>

        {provider === 'custom' && (
          <label>
            Endpoint compatible OpenAI
            <input
              type="text"
              value={customEndpoint}
              onChange={(event) =>
                handleSaveCustomEndpoint(event.target.value)
              }
              placeholder="https://api.exemple.com/openai/v1/chat/completions"
            />
          </label>
        )}

        <label>
          Modèle
          <input
            type="text"
            value={model}
            onChange={(event) => handleSaveModel(event.target.value)}
            placeholder={activeProvider.defaultModel || 'Nom du modèle'}
          />
        </label>

        <label>
          Clé API
          <input
            type="password"
            value={apiKey}
            onChange={(event) => handleSaveApiKey(event.target.value)}
            placeholder={
              provider === 'groq'
                ? 'gsk_...'
                : provider === 'openai'
                  ? 'sk-...'
                  : 'clé API'
            }
          />
        </label>

        <p>
          Tu peux changer de fournisseur, de modèle et de clé quand tu veux.
          Ces valeurs sont sauvegardées localement dans ton navigateur.
        </p>
      </div>

      <div className="ai-assistant__examples">
        {DEFAULT_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setPrompt(example)}
          >
            {example}
          </button>
        ))}
      </div>

      <form className="ai-assistant__form" onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ex. Génère-moi un menu hebdomadaire avec les fiches disponibles, en évitant les soupers trop lourds la semaine."
          rows={6}
        />

        <button type="submit" disabled={busy}>
          {busy ? 'L’AI réfléchit...' : 'Envoyer à l’AI'}
        </button>
      </form>

      {error && <p className="ai-assistant__error">{error}</p>}

      <div className="ai-assistant__conversation">
        {messages.length === 0 && (
          <p className="ai-assistant__empty">
            Aucune conversation pour l’instant.
          </p>
        )}

        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={`ai-assistant__message ai-assistant__message--${message.role}`}
          >
            <strong>{message.role === 'user' ? 'Toi' : 'AI'}</strong>
            <p>{message.content}</p>
          </article>
        ))}
      </div>

      {lastResult && (
        <div className="ai-assistant__result">
          <h3>Proposition prête à appliquer</h3>

          <p>{lastResult.message}</p>

          <ul>
            <li>
              Nouvelles fiches:{' '}
              {Array.isArray(lastResult.createMeals)
                ? lastResult.createMeals.length
                : 0}
            </li>
            <li>
              Fiches modifiées:{' '}
              {Array.isArray(lastResult.updateMeals)
                ? lastResult.updateMeals.length
                : 0}
            </li>
            <li>
              Menu hebdomadaire: {lastResult.weeklyMenu ? 'oui' : 'non'}
            </li>
            <li>
              Plan meal prep: {lastResult.mealPrepPlan ? 'oui' : 'non'}
            </li>
          </ul>

          {lastResult.mealPrepPlan && (
            <div className="ai-assistant__meal-prep">
              <h4>Plan meal prep proposé</h4>
              <pre>{lastResult.mealPrepPlan}</pre>
            </div>
          )}

          <details>
            <summary>Voir le JSON complet</summary>
            <pre>{JSON.stringify(lastResult, null, 2)}</pre>
          </details>

          <button type="button" onClick={handleApplyLastResult}>
            Appliquer les changements
          </button>
        </div>
      )}
    </section>
  );
}