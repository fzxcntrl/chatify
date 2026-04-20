import { DEFAULT_LOCATION_MARKER, LOCATION_MARKERS } from "./locationMarkers";

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getMarkerKey = (markerKey) =>
  LOCATION_MARKERS[markerKey] ? markerKey : DEFAULT_LOCATION_MARKER;

const getMarkerLabelMarkup = (label) => {
  if (!label) return "";

  return `
    <div class="tracker-marker-label">
      <span class="tracker-marker-label-text">${escapeHtml(label)}</span>
    </div>
  `;
};

const getClassicPinMarkup = () => `
  <div class="tracker-marker-pin">
    <div class="tracker-marker-head">
      <span class="tracker-marker-icon">•</span>
    </div>
    <div class="tracker-marker-tail"></div>
  </div>
`;

const getEmojiMarkerMarkup = (markerKey) => `
  <div class="tracker-marker-emoji-wrap">
    <span class="tracker-marker-emoji">${escapeHtml(LOCATION_MARKERS[markerKey]?.symbol || "📍")}</span>
  </div>
`;

export const getTrackerMarkerDimensions = (markerKey, { preview = false, hasLabel = false } = {}) => {
  const resolvedMarkerKey = getMarkerKey(markerKey);

  if (preview) {
    if (resolvedMarkerKey === DEFAULT_LOCATION_MARKER) {
      return {
        iconSize: [34, 48],
        iconAnchor: [17, 44],
      };
    }

    return {
      iconSize: [46, 46],
      iconAnchor: [23, 23],
    };
  }

  if (resolvedMarkerKey === DEFAULT_LOCATION_MARKER) {
    return {
      iconSize: [132, hasLabel ? 86 : 56],
      iconAnchor: [66, hasLabel ? 76 : 46],
    };
  }

  return {
    iconSize: [132, hasLabel ? 90 : 52],
    iconAnchor: [66, hasLabel ? 78 : 40],
  };
};

export const getTrackerMarkerMarkup = (
  markerKey,
  { variant = "preview", preview = false, label = "" } = {}
) => {
  const resolvedMarkerKey = getMarkerKey(markerKey);
  const classes = [
    "tracker-marker",
    `tracker-marker-${variant}`,
    `tracker-marker-key-${resolvedMarkerKey}`,
  ];

  if (preview) {
    classes.push("tracker-marker-preview");
  } else {
    classes.push("tracker-marker-live");
  }

  if (resolvedMarkerKey !== DEFAULT_LOCATION_MARKER) {
    classes.push("tracker-marker-emoji-mode");
  }

  return `
    <div class="${classes.join(" ")}">
      ${preview ? "" : getMarkerLabelMarkup(label)}
      <div class="tracker-marker-pulse"></div>
      ${
        resolvedMarkerKey === DEFAULT_LOCATION_MARKER
          ? getClassicPinMarkup()
          : getEmojiMarkerMarkup(resolvedMarkerKey)
      }
    </div>
  `;
};
