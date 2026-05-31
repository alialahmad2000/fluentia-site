// ============================================================================
// Atelier motion + color tokens (JS). CSS tokens live in atelier-tokens.css.
// ============================================================================

export const EASE_REVEAL = [0.25, 0.46, 0.45, 0.94]; // slow cinematic ease-out (default)
export const EASE_EMPHASIS = [0.16, 1, 0.30, 1];

export const DUR = { reveal: 0.7, emphasis: 0.9, hover: 0.35 };
export const STAGGER = 0.07; // seconds between siblings

// Hex mirror of the CSS palette — for inline SVG / charts only.
export const C = {
  nb: "#060e1c",
  nd: "#0a1225",
  nm: "#142143",
  nv: "#1a2d50",
  sky: "#38bdf8",
  skyLight: "#7dd3fc",
  gold: "#fbbf24",
  terra: "#c8553d",
  cream: "#f3eee6",
  white: "#e8edf5",
  soft: "#b8c2d4",
  muted: "#7a8599",
};
