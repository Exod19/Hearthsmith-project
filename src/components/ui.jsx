// =============================================================
//  ui.jsx — Petits composants partagés (en-têtes, modales, toasts)
// =============================================================

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Icon from './icons.jsx';

export const artUrl = (name) => `${import.meta.env.BASE_URL}hearthsmith/nordic-cottage-v2/illustrations/${name}-256.webp`;

export function PageHeader({ icon, art, title, subtitle, actions, children }) {
  return (
    <header className="page-header">
      {art ? (
        <img className="page-header__art" src={artUrl(art)} alt="" width="72" height="72" />
      ) : (
        icon && (
          <span className="page-header__icon" aria-hidden="true">
            <Icon name={icon} size={26} />
          </span>
        )
      )}
      <div className="page-header__text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
      {children}
    </header>
  );
}

export function Card({ title, icon, actions, className = '', children, ...rest }) {
  return (
    <section className={`card ${className}`} {...rest}>
      {(title || actions) && (
        <div className="card__head">
          {title && (
            <h2 className="card__title">
              {icon && <Icon name={icon} size={18} />}
              {title}
            </h2>
          )}
          {actions && <div className="card__actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ icon = 'leaf', art, title, children, action }) {
  return (
    <div className="empty">
      {art ? (
        <img className="empty__art" src={artUrl(art)} alt="" width="120" height="120" loading="lazy" />
      ) : (
        <span className="empty__icon" aria-hidden="true">
          <Icon name={icon} size={36} />
        </span>
      )}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Modal({ title, onClose, children, footer, size = 'md' }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Une seule fois à l'ouverture : focus, touche Échap, défilement bloqué.
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('has-modal');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('has-modal');
      previous?.focus?.();
    };
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="modal__head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

// Sans photo : une couleur unie et un pictogramme discret (le repas reste le héros quand il y en a une).
export function MealImage({ image, className = '' }) {
  return image ? (
    <img className={`meal-image ${className}`} src={image} alt="" loading="lazy" />
  ) : (
    <div className={`meal-image meal-image--placeholder ${className}`} aria-hidden="true">
      <Icon name="bowl" size={32} />
    </div>
  );
}

export function Chip({ active, onClick, children }) {
  return (
    <button type="button" className={`chip ${active ? 'is-active' : ''}`} aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  );
}

export function Progress({ value, max, label }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

// ---- Toasts ----
const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, { tone = 'success', action } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-2), { id, message, tone, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 6000 : 3200);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            <span>{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action.onClick();
                  setToasts((all) => all.filter((x) => x.id !== t.id));
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
