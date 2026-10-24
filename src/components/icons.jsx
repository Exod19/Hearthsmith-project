// =============================================================
//  icons.jsx — Pictogrammes fonctionnels (guide de marque V2, registre A)
// -------------------------------------------------------------
//  Trait 1,75 px, extrémités arrondies, sans ombre ; la couleur
//  suit le texte (currentColor). 20 px en navigation, 18 px en
//  métadonnées, 24 px pour un bouton icône.
// =============================================================

const PATHS = {
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5V5.5M20 18v3H6.5M8.5 7.5h7" /></>,
  basket: <><path d="M4 10h16l-1.6 8.6a2 2 0 0 1-2 1.4H7.6a2 2 0 0 1-2-1.4z" /><path d="M8.5 10L12 4l3.5 6M9.5 14v2.5M14.5 14v2.5" /></>,
  pot: <><path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M2 10h20M9.5 6.5c0-1.2 1-1.6 1-2.8M14 6.5c0-1.2 1-1.6 1-2.8" /></>,
  home: <><path d="M3 11l9-7 9 7" /><path d="M5.5 9.5V20h13V9.5M10 20v-5h4v5" /></>,
  sparkle: <><path d="M11 3l1.7 4.8L17.5 9.5l-4.8 1.7L11 16l-1.7-4.8L4.5 9.5l4.8-1.7z" /><path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" /></>,
  settings: <><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth="3" />,
  printer: <><path d="M7 9V3.5h10V9" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v6.5H7z" /></>,
  download: <path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4 20.5h16" />,
  upload: <path d="M12 20.5v-11M7.5 14L12 9.5l4.5 4.5M4 3.5h16" />,
  trash: <path d="M4 7h16M9.5 7V4h5v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>,
  swap: <path d="M7 4L3.5 7.5 7 11M3.5 7.5H17M17 13l3.5 3.5L17 20M20.5 16.5H7" />,
  warning: <><path d="M12 3.5l9.5 16.5h-19z" /><path d="M12 10v4.5M12 17.5v.01" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.3-4.3" /></>,
  camera: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7l1.8-3h4.4L16 7" /><circle cx="12" cy="13.5" r="3.5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.3c1.8.8 3 2.8 3 5.7" /></>,
  note: <><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v4h4M8.5 12h7M8.5 16h7" /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  leaf: <><path d="M5 19C5 11 11 5 20 5c0 9-6 15-14 15" /><path d="M5 19l7-7" /></>,
  meat: <><path d="M14.5 4a5.5 5.5 0 0 1 5.5 5.5c0 3.3-3 5.5-6 5.5l-4.5 4.5-3-3L11 12c0-3.5 1-8 3.5-8z" /><path d="M5 20l1.5-1.5" /></>,
  egg: <path d="M12 3c3.6 0 6.5 5.2 6.5 9.8a6.5 6.5 0 0 1-13 0C5.5 8.2 8.4 3 12 3z" />,
  wheat: <path d="M12 21V5M12 9.5L9 6.5M12 9.5l3-3M12 14l-3-3M12 14l3-3M12 18.5l-3-3M12 18.5l3-3" />,
  jar: <><rect x="6" y="8" width="12" height="13" rx="2.5" /><path d="M7.5 4h9v4h-9zM9 13h6" /></>,
  snow: <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />,
  bowl: <><path d="M3 11.5h18a9 9 0 0 1-18 0z" /><path d="M8.5 7.5c0-1.2 1-1.6 1-2.8M12.5 7.5c0-1.2 1-1.6 1-2.8M16.5 7.5c0-1.2 1-1.6 1-2.8" /></>,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  pulse: <path d="M3 12h4l3-7 4 14 3-7h4" />,
  key: <><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16.5 6.5l3 3" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  box: <><path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z" /><path d="M3.5 7.5l8.5 4 8.5-4M12 11.5v9" /></>,
  send: <path d="M4 12L20 4l-6 16-3-7z" />,
  tag: <><path d="M3.5 12V4H11.5l9 9-8 8z" /><circle cx="7.5" cy="8" r="1.2" /></>,
  flame: <path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4.2 2-6.3C9.6 8.8 10 10.4 10 10.4S12 7.5 12 3z" />,
  utensils: <path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M17 21V3c-2 0-3.5 3-3.5 7.5H17" />,
  list: <><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M8 12l3 3 5-6" /></>,
};

export default function Icon({ name, size = 20, className = '', title }) {
  const shape = PATHS[name];
  if (!shape) return null;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {shape}
    </svg>
  );
}
