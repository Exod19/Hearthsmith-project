// =============================================================
//  PriceComparison.jsx — Prix, économies et liste pour commander
// -------------------------------------------------------------
//  Pour chaque article à acheter, trouve le meilleur produit dans
//  chaque magasin retenu (épiceries.ca), calcule le coût selon le
//  nombre d'emballages et propose le plan le moins cher.
// =============================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatQuantity, formatUnit } from '../utils/ingredients.js';
import {
  STORES,
  fetchHistory,
  findOffer,
  money,
  offerFor,
  priceInsight,
  rankProducts,
  refreshPick,
  searchStore,
  storeHasData,
  storeLabel,
  summarize,
} from '../utils/prices.js';
import { Card, EmptyState, Modal, Progress, useToast } from './ui.jsx';

// Image de produit introuvable : on garde la place sans icône brisée.
const hideImage = (e) => {
  e.currentTarget.style.visibility = 'hidden';
};
const matchKey = (item) => item.key.split('|')[0];
const snapshot = (p) => ({ id: p.id, name: p.name, brand: p.brand, size: p.size, price: p.price, image: p.image, link: p.link, discounted: p.discounted, updated: p.updated });

export default function PriceComparison({ groceryList, checks, prices, actions }) {
  const notify = useToast();
  const { stores: chosenStores, picks, packs, skips } = prices;
  const [found, setFound] = useState({}); // item.key → { [store]: { product, results } | null }
  const [history, setHistory] = useState({}); // item.key → insight
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [chooser, setChooser] = useState(null); // { row, store }
  const [showSkipped, setShowSkipped] = useState(false);
  const [allTips, setAllTips] = useState(false);
  const [unavailable, setUnavailable] = useState([]);
  const runRef = useRef(0);

  const toBuy = useMemo(() => groceryList.items.filter((item) => !checks[item.key]?.done), [groceryList, checks]);
  const rows = useMemo(() => toBuy.filter((item) => !skips[matchKey(item)]), [toBuy, skips]);
  const skipped = toBuy.filter((item) => skips[matchKey(item)]);
  // Magasins sans données récentes chez épiceries.ca : retirés de la comparaison.
  const stores = useMemo(() => chosenStores.filter((s) => !unavailable.includes(s)), [chosenStores, unavailable]);
  const signature = `${chosenStores.join(',')}|${rows.map((r) => r.key).join(',')}`;

  // ---- Chargement (réseau poli, résultats en cache local) ----
  useEffect(() => {
    if (!rows.length || !chosenStores.length) return undefined;
    const run = ++runRef.current;
    const alive = () => run === runRef.current;
    (async () => {
      setError('');
      setProgress({ done: 0, total: rows.length * chosenStores.length });
      const available = [];
      for (const store of chosenStores) if (await storeHasData(store)) available.push(store);
      if (!alive()) return;
      setUnavailable(chosenStores.filter((st) => !available.includes(st)));
      const tasks = rows.flatMap((item) => available.map((store) => ({ item, store })));
      setProgress({ done: 0, total: tasks.length });
      let done = 0;
      let failures = 0;
      for (const { item, store } of tasks) {
        if (!alive()) return;
        const pick = picks[matchKey(item)]?.[store];
        let entry = null;
        try {
          if (pick === 'none') entry = null;
          else if (pick) {
            const offer = await refreshPick(item, store, pick);
            entry = offer ? { product: offer.product, results: null } : null;
          } else {
            const { offer, results } = await findOffer(item, store);
            entry = offer ? { product: offer.product, results } : { product: null, results };
          }
        } catch (err) {
          failures += 1;
          console.error(err);
          entry = undefined;
        }
        if (!alive()) return;
        if (entry !== undefined) setFound((f) => ({ ...f, [item.key]: { ...f[item.key], [store]: entry } }));
        done += 1;
        setProgress({ done, total: tasks.length });
      }
      if (failures) setError(`${failures} recherche(s) n’ont pas abouti. Vérifiez votre connexion puis actualisez.`);
      setProgress(null);
    })();
    return () => {
      runRef.current += 1;
    };
    // Les choix manuels sont appliqués directement (setFound) : inutile de tout relancer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  // ---- Offres et plan (recalculés sans réseau) ----
  const table = useMemo(
    () =>
      rows.map((item) => {
        const offers = {};
        for (const store of stores) {
          const product = found[item.key]?.[store]?.product;
          offers[store] = product ? offerFor(item, product, packs[item.key]?.[store]) : null;
        }
        return { item, key: item.key, offers, loaded: Boolean(found[item.key]) };
      }),
    [rows, stores, found, packs]
  );
  const summary = useMemo(() => summarize(table, stores), [table, stores]);
  const planSignature = table.map((r) => `${r.key}:${r.offers[summary.plan[r.key]]?.product.id || ''}`).join(',');

  // Historique des prix pour les produits retenus : spéciaux et conseils.
  useEffect(() => {
    if (progress) return undefined;
    let cancelled = false;
    (async () => {
      for (const row of table) {
        const store = summary.plan[row.key];
        const offer = store && row.offers[store];
        if (!offer || history[row.key]?.id === offer.product.id) continue;
        try {
          const points = await fetchHistory(offer.product.id, store);
          if (cancelled) return;
          setHistory((h) => ({ ...h, [row.key]: { id: offer.product.id, insight: priceInsight(points, store, offer.product) } }));
        } catch {
          /* conseil facultatif */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planSignature, progress]);

  const storesWithData = new Set(table.flatMap((r) => stores.filter((s) => r.offers[s])));
  const loadedCount = table.filter((r) => r.loaded).length;
  const tips = table
    .map((r) => ({ row: r, store: summary.plan[r.key], insight: history[r.key]?.insight }))
    .filter((t) => t.insight && t.store)
    .sort((a, b) => (a.insight.tone === 'warn' ? -1 : 0) - (b.insight.tone === 'warn' ? -1 : 0));
  const specials = table.filter((r) => summary.plan[r.key] && r.offers[summary.plan[r.key]]?.product.discounted).length;

  // ---- Actions ----
  const toggleStore = (id) =>
    actions.updatePrices((p) => ({ ...p, stores: p.stores.includes(id) ? p.stores.filter((s) => s !== id) : [...p.stores, id] }));

  const setPick = (item, store, product) => {
    const key = matchKey(item);
    actions.updatePrices((p) => {
      const forItem = { ...p.picks[key] };
      if (product === undefined) delete forItem[store];
      else forItem[store] = product === null ? 'none' : snapshot(product);
      return { ...p, picks: { ...p.picks, [key]: forItem } };
    });
    if (product !== undefined) {
      setFound((f) => ({ ...f, [item.key]: { ...f[item.key], [store]: product ? { product, results: f[item.key]?.[store]?.results } : null } }));
    } else {
      // Retour au choix automatique : on relance la recherche pour cet article.
      findOffer(item, store).then(({ offer, results }) =>
        setFound((f) => ({ ...f, [item.key]: { ...f[item.key], [store]: { product: offer?.product || null, results } } }))
      );
    }
  };

  const setPacks = (item, store, n) =>
    actions.updatePrices((p) => ({ ...p, packs: { ...p.packs, [item.key]: { ...p.packs[item.key], [store]: Math.max(1, Math.min(20, n)) } } }));

  const toggleSkip = (item) =>
    actions.updatePrices((p) => {
      const next = { ...p.skips };
      if (next[matchKey(item)]) delete next[matchKey(item)];
      else next[matchKey(item)] = true;
      return { ...p, skips: next };
    });

  if (!groceryList.items.length) {
    return <EmptyState icon="🧺" title="Aucun article à comparer">Ajoutez des recettes au menu de la semaine.</EmptyState>;
  }

  return (
    <div className="prices">
      <div className="prices__stores">
        <span className="prices__label">Magasins comparés</span>
        <div className="chips">
          {STORES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip store-chip store-chip--${s.id} ${chosenStores.includes(s.id) ? 'is-active' : ''}`}
              aria-pressed={chosenStores.includes(s.id)}
              onClick={() => toggleStore(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {progress && (
        <div className="prices__progress" role="status">
          <span>
            Recherche des prix… {progress.done} / {progress.total}
          </span>
          <Progress value={progress.done} max={progress.total} label="Recherche des prix" />
          <small className="hint">La première recherche prend une trentaine de secondes ; les suivantes sont instantanées.</small>
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
      {unavailable.length > 0 && (
        <p className="hint">
          ⓘ épiceries.ca n’a pas de prix récents pour {unavailable.map(storeLabel).join(', ')} en ce moment : {unavailable.length > 1 ? 'ces magasins sont' : 'ce magasin est'} mis de côté.
        </p>
      )}

      {!chosenStores.length ? (
        <p className="callout">Choisissez au moins un magasin.</p>
      ) : (
        <>
          <div className="price-summary">
            <div className="price-total price-total--best">
              <span>Meilleur plan</span>
              <strong>{money(summary.optimal)}</strong>
              <small>
                {Object.entries(summary.split)
                  .filter(([, v]) => v.items.length)
                  .map(([s, v]) => `${storeLabel(s)} ${money(v.total)} (${v.items.length})`)
                  .join(' · ') || '—'}
              </small>
            </div>
            {stores.map((s) => {
              const st = summary.perStore[s];
              return (
                <div key={s} className={`price-total ${storesWithData.has(s) ? '' : 'is-empty'}`}>
                  <span>Tout chez {storeLabel(s)}</span>
                  <strong>{st.count ? money(st.total) : '—'}</strong>
                  <small>
                    {!storesWithData.has(s) && !progress
                      ? 'Aucun article trouvé dans ce magasin.'
                      : st.savings > 0.005
                        ? `Le meilleur plan coûte ${money(st.savings)} de moins pour ces ${st.comparable} articles`
                        : st.count
                          ? 'Déjà le meilleur choix'
                          : ''}
                    {st.missing > 0 && storesWithData.has(s) ? ` · ${st.missing} introuvable(s)` : ''}
                  </small>
                </div>
              );
            })}
          </div>

          <p className="hint">
            {loadedCount} / {rows.length} articles analysés · {specials} en spécial cette semaine dans le meilleur plan. Les quantités sont arrondies à l’emballage supérieur ; ajustez-les
            avec − et +.
          </p>

          {tips.length > 0 && (
            <Card
              title="Astuces de la semaine"
              icon="💡"
              className="price-tips"
              actions={
                tips.length > 4 && (
                  <button type="button" className="link" onClick={() => setAllTips((v) => !v)}>
                    {allTips ? 'Réduire' : `Voir les ${tips.length}`}
                  </button>
                )
              }
            >
              <ul>
                {(allTips ? tips : tips.slice(0, 4)).map(({ row, store, insight }) => (
                  <li key={row.key} className={`tip tip--${insight.tone}`}>
                    <strong>
                      {row.item.name} · {storeLabel(store)}
                    </strong>{' '}
                    {insight.text}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="price-table" role="table" aria-label="Comparaison des prix">
            <div className="price-row price-row--head" role="row" style={{ '--cols': stores.length }}>
              <span role="columnheader">Article</span>
              {stores.map((s) => (
                <span key={s} role="columnheader">
                  {storeLabel(s)}
                </span>
              ))}
            </div>
            {table.map((row) => {
              const best = summary.plan[row.key];
              const qty = [formatQuantity(row.item.quantity), formatUnit(row.item.unit, row.item.quantity)].filter(Boolean).join(' ');
              return (
                <div key={row.key} className="price-row" role="row" style={{ '--cols': stores.length }}>
                  <div className="price-row__item" role="cell">
                    <strong>{row.item.name}</strong>
                    <small>{qty || 'quantité non précisée'}</small>
                    <button type="button" className="link" onClick={() => toggleSkip(row.item)}>
                      J’en ai déjà
                    </button>
                  </div>
                  {stores.map((s) => {
                    const offer = row.offers[s];
                    const isBest = best === s && stores.length > 1;
                    return (
                      <div key={s} role="cell" className={`offer ${isBest ? 'is-best' : ''} ${offer ? '' : 'is-missing'}`} data-store={storeLabel(s)}>
                        {offer ? (
                          <>
                            <button type="button" className="offer__product" onClick={() => setChooser({ row, store: s })} title="Changer de produit">
                              {offer.product.image ? <img src={offer.product.image} alt="" loading="lazy" onError={hideImage} /> : <i aria-hidden="true" />}
                              <span>
                                {offer.product.name}
                                <small>
                                  {offer.product.size || 'format ?'} · {money(offer.product.price)}
                                </small>
                              </span>
                            </button>
                            <div className="offer__foot">
                              <span className="stepper" aria-label="Nombre d’emballages">
                                <button type="button" onClick={() => setPacks(row.item, s, offer.packs - 1)} aria-label="Moins">
                                  −
                                </button>
                                <b title={offer.estimated ? 'Quantité estimée' : undefined}>
                                  {offer.packs}
                                  {offer.estimated ? '≈' : ''}
                                </b>
                                <button type="button" onClick={() => setPacks(row.item, s, offer.packs + 1)} aria-label="Plus">
                                  +
                                </button>
                              </span>
                              <strong className="offer__cost">{money(offer.cost)}</strong>
                            </div>
                            <div className="offer__badges">
                              {offer.product.discounted && <em className="badge badge--deal">Spécial</em>}
                              {isBest && <em className="badge badge--best">Meilleur prix</em>}
                            </div>
                          </>
                        ) : row.loaded && found[row.key]?.[s] !== undefined ? (
                          <button type="button" className="offer__none" onClick={() => setChooser({ row, store: s })}>
                            Introuvable · choisir
                          </button>
                        ) : (
                          <span className="offer__loading">…</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {skipped.length > 0 && (
            <p className="hint">
              <button type="button" className="link" onClick={() => setShowSkipped((v) => !v)}>
                {skipped.length} article(s) déjà à la maison
              </button>
              {showSkipped &&
                skipped.map((item) => (
                  <button key={item.key} type="button" className="tag tag--removable" onClick={() => toggleSkip(item)} title="Remettre dans la comparaison">
                    {item.name} ↺
                  </button>
                ))}
            </p>
          )}

          <OrderPanel summary={summary} notify={notify} />
        </>
      )}

      <p className="prices__credit">
        Prix fournis par{' '}
        <a href="https://epiceries.ca" target="_blank" rel="noreferrer">
          épiceries.ca
        </a>
        , mis à jour chaque semaine, à titre indicatif. Vérifiez toujours en magasin.
      </p>

      {chooser && (
        <ProductChooser
          row={chooser.row}
          store={chooser.store}
          current={chooser.row.offers[chooser.store]?.product}
          results={found[chooser.row.key]?.[chooser.store]?.results}
          isManual={Boolean(picks[matchKey(chooser.row.item)]?.[chooser.store])}
          onPick={(product) => {
            setPick(chooser.row.item, chooser.store, product);
            setChooser(null);
          }}
          onClose={() => setChooser(null)}
        />
      )}
    </div>
  );
}

function ProductChooser({ row, store, current, results, isManual, onPick, onClose }) {
  const [query, setQuery] = useState(row.item.name);
  const [list, setList] = useState(() => (results ? rankProducts(results, row.item.name, row.item.category).map((r) => r.product) : []));
  const [busy, setBusy] = useState(false);

  async function search(e) {
    e?.preventDefault();
    if (query.trim().length < 2) return;
    setBusy(true);
    try {
      const res = await searchStore(query.trim().toLowerCase(), store);
      const ranked = rankProducts(res, query, row.item.category).map((r) => r.product);
      setList([...ranked, ...res.filter((p) => !ranked.includes(p))].slice(0, 40));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!list.length) search();
    // Une seule recherche automatique à l'ouverture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal title={`${row.item.name} chez ${storeLabel(store)}`} onClose={onClose} size="lg">
      <form className="picker__bar" onSubmit={search}>
        <input className="input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Rechercher un produit" />
        <button type="submit" className="btn btn--parchment" disabled={busy}>
          {busy ? 'Recherche…' : 'Rechercher'}
        </button>
      </form>
      <p className="hint">L’orthographe compte : essayez le singulier, le pluriel ou un mot plus court (« poivron », « huile d’olive »).</p>
      <ul className="product-list">
        {list.map((p) => (
          <li key={p.id}>
            <button type="button" className={current?.id === p.id ? 'is-current' : ''} onClick={() => onPick(p)}>
              {p.image ? <img src={p.image} alt="" loading="lazy" onError={hideImage} /> : <span className="product-list__ph" aria-hidden="true">🛒</span>}
              <span>
                <strong>{p.name}</strong>
                <small>
                  {[p.brand, p.size].filter(Boolean).join(' · ')}
                  {p.unit ? ` · ${p.unit}` : ''}
                </small>
              </span>
              <span className="product-list__price">
                {money(p.price)}
                {p.discounted && <em className="badge badge--deal">Spécial</em>}
              </span>
            </button>
          </li>
        ))}
        {!list.length && !busy && <li className="muted">Aucun produit trouvé pour cette recherche.</li>}
      </ul>
      <div className="toolbar">
        <button type="button" className="btn btn--ghost" onClick={() => onPick(null)}>
          Ne pas acheter ici
        </button>
        {isManual && (
          <button type="button" className="btn btn--ghost" onClick={() => onPick(undefined)}>
            Revenir au choix automatique
          </button>
        )}
      </div>
    </Modal>
  );
}

/** Une liste par magasin, avec un mode « produit suivant » pour remplir le panier en ligne. */
function OrderPanel({ summary, notify }) {
  const [cursor, setCursor] = useState({});
  const groups = Object.entries(summary.split).filter(([, v]) => v.items.length);
  if (!groups.length) return null;

  const lines = (store, items) =>
    items.map((row) => {
      const o = row.offers[store];
      return `${o.packs} × ${o.product.name}${o.product.size ? ` (${o.product.size})` : ''} — ${money(o.cost)}`;
    });

  function openNext(store, items) {
    const i = cursor[store] || 0;
    const row = items[i];
    if (!row) return;
    // Un seul onglet réutilisé : pas de blocage des fenêtres surgissantes.
    window.open(row.offers[store].product.link, `hearthsmith-${store}`);
    setCursor((c) => ({ ...c, [store]: i + 1 }));
  }

  return (
    <Card title="Commander" icon="🧾" className="order-panel">
      <p>
        Le meilleur plan, regroupé par magasin. Ouvrez chaque produit sur le site de l’épicerie (connecté à votre compte), ajoutez-le au panier, puis passez au suivant. Le paiement et le
        créneau de livraison ou de cueillette se font sur le site de l’épicerie.
      </p>
      <div className="order-grid">
        {groups.map(([store, { total, items }]) => {
          const i = cursor[store] || 0;
          return (
            <section key={store} className="order-store">
              <header>
                <h3>{storeLabel(store)}</h3>
                <strong>{money(total)}</strong>
              </header>
              <ol>
                {items.map((row, idx) => {
                  const o = row.offers[store];
                  return (
                    <li key={row.key} className={idx < i ? 'is-done' : idx === i ? 'is-next' : ''}>
                      <a href={o.product.link} target={`hearthsmith-${store}`} rel="noreferrer" onClick={() => setCursor((c) => ({ ...c, [store]: Math.max(c[store] || 0, idx + 1) }))}>
                        {o.packs} × {o.product.name}
                      </a>
                      <span>{money(o.cost)}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="toolbar">
                <button type="button" className="btn btn--primary btn--sm" onClick={() => openNext(store, items)} disabled={i >= items.length}>
                  {i >= items.length ? '✓ Tout est ouvert' : i === 0 ? `Commencer chez ${storeLabel(store)}` : `Produit suivant (${i + 1}/${items.length})`}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText(`${storeLabel(store)}\n${lines(store, items).join('\n')}\nTotal estimé : ${money(total)}`)
                      .then(() => notify('Liste copiée'), () => notify('Copie impossible', { tone: 'error' }));
                  }}
                >
                  Copier la liste
                </button>
                {i > 0 && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCursor((c) => ({ ...c, [store]: 0 }))}>
                    Recommencer
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}
