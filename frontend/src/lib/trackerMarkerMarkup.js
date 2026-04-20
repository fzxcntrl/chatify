import { DEFAULT_LOCATION_MARKER, LOCATION_MARKERS } from "./locationMarkers";

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const SHAPED_MARKER_SVGS = {
  compass: `
    <svg viewBox="0 0 72 72" class="tracker-marker-shape-svg" aria-hidden="true">
      <defs>
        <linearGradient id="tracker-compass-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7dd3fc" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
        <linearGradient id="tracker-compass-core" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#eff6ff" />
          <stop offset="100%" stop-color="#dbeafe" />
        </linearGradient>
      </defs>
      <circle cx="36" cy="36" r="25" fill="url(#tracker-compass-ring)" />
      <circle cx="36" cy="36" r="17" fill="url(#tracker-compass-core)" opacity="0.96" />
      <path d="M36 14L45.5 36L36 58L26.5 36Z" fill="#1d4ed8" />
      <path d="M36 18L42 36L36 50L30 36Z" fill="#e0f2fe" />
      <circle cx="36" cy="36" r="4.5" fill="#0f172a" opacity="0.82" />
    </svg>
  `,
  target: `
    <svg viewBox="0 0 72 72" class="tracker-marker-shape-svg" aria-hidden="true">
      <defs>
        <radialGradient id="tracker-target-core" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#fff7ed" />
          <stop offset="100%" stop-color="#ffe4e6" />
        </radialGradient>
      </defs>
      <circle cx="36" cy="36" r="25" fill="#ef4444" />
      <circle cx="36" cy="36" r="18" fill="#ffffff" opacity="0.95" />
      <circle cx="36" cy="36" r="12" fill="#fb923c" />
      <circle cx="36" cy="36" r="6" fill="#ffffff" opacity="0.95" />
      <circle cx="36" cy="36" r="2.5" fill="#b91c1c" />
      <path d="M50 22L57 15" stroke="#7f1d1d" stroke-width="4" stroke-linecap="round" />
      <path d="M52 15L57 15L57 20" stroke="#7f1d1d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <circle cx="36" cy="36" r="24" fill="url(#tracker-target-core)" opacity="0.15" />
    </svg>
  `,
  lightning: `
    <svg viewBox="0 0 72 92" class="tracker-marker-shape-svg" aria-hidden="true">
      <defs>
        <linearGradient id="tracker-lightning-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef3c7" />
          <stop offset="34%" stop-color="#fcd34d" />
          <stop offset="68%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#b45309" />
        </linearGradient>
        <linearGradient id="tracker-lightning-edge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef9c3" />
          <stop offset="100%" stop-color="#fde68a" />
        </linearGradient>
      </defs>
      <path d="M44 3L18 40H36L24 89L56 46H38L44 3Z" fill="url(#tracker-lightning-main)" />
      <path d="M44 3L18 40H36L24 89L56 46H38L44 3Z" fill="none" stroke="url(#tracker-lightning-edge)" stroke-width="4" stroke-linejoin="round" />
      <path d="M39 18L28 37H38L31 67L49 43H39L39 18Z" fill="#fff7c2" opacity="0.58" />
      <path d="M44 10L28 38H42L34 66L52 43H40L44 10Z" fill="#a16207" opacity="0.24" />
    </svg>
  `,
  flame: `
    <svg viewBox="0 0 72 88" class="tracker-marker-shape-svg" aria-hidden="true">
      <defs>
        <linearGradient id="tracker-flame-outer" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#fde68a" />
          <stop offset="38%" stop-color="#fb923c" />
          <stop offset="100%" stop-color="#dc2626" />
        </linearGradient>
        <linearGradient id="tracker-flame-inner" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#fef3c7" />
          <stop offset="100%" stop-color="#f97316" />
        </linearGradient>
      </defs>
      <path d="M39 4C41 18 34 22 34 31C34 40 41 41 41 51C41 58 36 65 27 65C17 65 11 57 11 47C11 30 26 24 28 8C31 13 33 18 33 22C37 19 38 11 39 4Z" transform="translate(11 9) scale(1.15)" fill="url(#tracker-flame-outer)" />
      <path d="M39 18C40 26 35 29 35 36C35 43 40 45 40 53C40 59 36 64 29 64C21 64 16 58 16 50C16 38 26 33 28 21C30 25 31 29 31 32C34 30 36 24 39 18Z" transform="translate(8 5) scale(1.02)" fill="url(#tracker-flame-inner)" opacity="0.92" />
    </svg>
  `,
  star: `
    <svg viewBox="0 0 72 72" class="tracker-marker-shape-svg" aria-hidden="true">
      <defs>
        <linearGradient id="tracker-star-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef3c7" />
          <stop offset="45%" stop-color="#facc15" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>
      <path d="M36 7L43.7 23.1L61.4 25.2L48.2 37.4L51.8 54.8L36 46.2L20.2 54.8L23.8 37.4L10.6 25.2L28.3 23.1Z" fill="url(#tracker-star-main)" />
      <path d="M36 14L41.2 25L53 26.4L44.2 34.6L46.6 46.2L36 40.3L25.4 46.2L27.8 34.6L19 26.4L30.8 25Z" fill="#fff7d6" opacity="0.54" />
    </svg>
  `,
  ghost: `
    <svg viewBox="0 0 72 82" class="tracker-marker-shape-svg" aria-hidden="true">
      <defs>
        <linearGradient id="tracker-ghost-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#cbd5e1" />
        </linearGradient>
      </defs>
      <path d="M36 10C21.1 10 10 21.1 10 36V61L18 54L26 61L36 54L46 61L54 54L62 61V36C62 21.1 50.9 10 36 10Z" fill="url(#tracker-ghost-body)" />
      <circle cx="28" cy="35" r="5" fill="#0f172a" />
      <circle cx="44" cy="35" r="5" fill="#0f172a" />
      <path d="M27 49C30 52 42 52 45 49" stroke="#64748b" stroke-width="4" stroke-linecap="round" fill="none" />
    </svg>
  `,
  skeleton: `
    <svg viewBox="0 0 72 82" class="tracker-marker-shape-svg" aria-hidden="true">
      <defs>
        <linearGradient id="tracker-skeleton-badge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1f2937" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
      </defs>
      <circle cx="36" cy="36" r="26" fill="url(#tracker-skeleton-badge)" />
      <path d="M24 32C24 22 30 16 36 16C42 16 48 22 48 32C48 41 42 46 36 46C30 46 24 41 24 32Z" fill="#f8fafc" />
      <circle cx="30.5" cy="31" r="4" fill="#111827" />
      <circle cx="41.5" cy="31" r="4" fill="#111827" />
      <path d="M34 38H38L36 41Z" fill="#111827" />
      <rect x="27" y="47" width="18" height="9" rx="4.5" fill="#f8fafc" />
      <path d="M31 50V56M36 50V56M41 50V56" stroke="#111827" stroke-width="2" stroke-linecap="round" />
      <path d="M21 64L27 58M45 58L51 64" stroke="#e5e7eb" stroke-width="4" stroke-linecap="round" />
    </svg>
  `,
  ufo: `
    <svg viewBox="0 0 82 72" class="tracker-marker-shape-svg" aria-hidden="true">
      <defs>
        <linearGradient id="tracker-ufo-dome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c4b5fd" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
        <linearGradient id="tracker-ufo-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2dd4bf" />
          <stop offset="100%" stop-color="#4f46e5" />
        </linearGradient>
      </defs>
      <path d="M28 25C28 16 33 10 41 10C49 10 54 16 54 25Z" fill="url(#tracker-ufo-dome)" />
      <ellipse cx="41" cy="37" rx="29" ry="12" fill="url(#tracker-ufo-base)" />
      <ellipse cx="41" cy="34" rx="22" ry="8" fill="#e0f2fe" opacity="0.25" />
      <circle cx="22" cy="39" r="3" fill="#fef08a" />
      <circle cx="34" cy="43" r="3" fill="#fef08a" />
      <circle cx="48" cy="43" r="3" fill="#fef08a" />
      <circle cx="60" cy="39" r="3" fill="#fef08a" />
      <path d="M35 49L29 61M47 49L53 61" stroke="#67e8f9" stroke-width="3" stroke-linecap="round" opacity="0.85" />
    </svg>
  `,
  butterfly: `
    <svg viewBox="0 0 76 76" class="tracker-marker-shape-svg" aria-hidden="true">
      <defs>
        <linearGradient id="tracker-butterfly-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f9a8d4" />
          <stop offset="100%" stop-color="#db2777" />
        </linearGradient>
        <linearGradient id="tracker-butterfly-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c4b5fd" />
          <stop offset="100%" stop-color="#7c3aed" />
        </linearGradient>
      </defs>
      <path d="M34 22C28 10 15 10 12 21C9 33 17 42 31 43C28 35 30 28 34 22Z" fill="url(#tracker-butterfly-left)" />
      <path d="M34 29C27 27 18 31 16 40C14 51 22 58 33 55C30 48 30 38 34 29Z" fill="#ec4899" opacity="0.88" />
      <path d="M42 22C48 10 61 10 64 21C67 33 59 42 45 43C48 35 46 28 42 22Z" fill="url(#tracker-butterfly-right)" />
      <path d="M42 29C49 27 58 31 60 40C62 51 54 58 43 55C46 48 46 38 42 29Z" fill="#8b5cf6" opacity="0.9" />
      <rect x="35" y="19" width="6" height="36" rx="3" fill="#334155" />
      <path d="M38 19C35 11 30 8 26 8M38 19C41 11 46 8 50 8" stroke="#334155" stroke-width="3" stroke-linecap="round" fill="none" />
    </svg>
  `,
  diamond: `
    <svg viewBox="0 0 72 72" class="tracker-marker-shape-svg" aria-hidden="true">
      <defs>
        <linearGradient id="tracker-diamond-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e0f2fe" />
          <stop offset="45%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
      </defs>
      <path d="M21 18H51L61 30L36 58L11 30Z" fill="url(#tracker-diamond-main)" />
      <path d="M21 18L30 30L36 18L42 30L51 18" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" fill="none" />
      <path d="M30 30L36 58L42 30" stroke="#e0f2fe" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.72" fill="none" />
    </svg>
  `,
};

const getMarkerKey = (markerKey) =>
  LOCATION_MARKERS[markerKey] ? markerKey : DEFAULT_LOCATION_MARKER;

const getClassicPinMarkup = () => `
  <div class="tracker-marker-pin">
    <div class="tracker-marker-head">
      <span class="tracker-marker-icon">•</span>
    </div>
    <div class="tracker-marker-tail"></div>
  </div>
`;

const getShapedMarkerMarkup = (markerKey) => {
  const marker = LOCATION_MARKERS[markerKey];
  const fallbackIcon = escapeHtml(marker?.symbol || "•");

  return `
    <div class="tracker-marker-shape-wrap">
      ${
        SHAPED_MARKER_SVGS[markerKey] ||
        `<span class="tracker-marker-shape-fallback">${fallbackIcon}</span>`
      }
    </div>
  `;
};

export const getTrackerMarkerDimensions = (markerKey) => {
  const resolvedMarkerKey = getMarkerKey(markerKey);

  if (resolvedMarkerKey === DEFAULT_LOCATION_MARKER) {
    return {
      iconSize: [34, 48],
      iconAnchor: [17, 44],
    };
  }

  return {
    iconSize: [52, 58],
    iconAnchor: [26, 46],
  };
};

export const getTrackerMarkerMarkup = (markerKey, { variant = "preview", preview = false } = {}) => {
  const resolvedMarkerKey = getMarkerKey(markerKey);
  const classes = [
    "tracker-marker",
    `tracker-marker-${variant}`,
    `tracker-marker-key-${resolvedMarkerKey}`,
  ];

  if (preview) {
    classes.push("tracker-marker-preview");
  }

  if (resolvedMarkerKey !== DEFAULT_LOCATION_MARKER) {
    classes.push("tracker-marker-shaped");
  }

  return `
    <div class="${classes.join(" ")}">
      <div class="tracker-marker-pulse"></div>
      ${
        resolvedMarkerKey === DEFAULT_LOCATION_MARKER
          ? getClassicPinMarkup()
          : getShapedMarkerMarkup(resolvedMarkerKey)
      }
    </div>
  `;
};
