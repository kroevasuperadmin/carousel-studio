// Colours and fonts live here. The renderer does not hard-code them anywhere else.
// Change a value, then render again.

export const MIN_CONTRAST = 4.5;

// Ink used when a light theme has a full-bleed picture. The scrim is dark,
// so the words switch to light. Panel fills keep the theme's own ink.
export const imageInk = {
  text: "#F4F7F6",
  muted: "#D7E0DC",
};

export const subjects = {
  dossair: {
    name: "Dossair",
    display: "Newsreader",
    text: "IBM Plex Sans",
    displayWeight: 500,
    tracking: "-0.02em",
    stickerRotate: "0deg",
    compare: ["Before", "After"],
  },
  sigmahack: {
    name: "SigmaHack",
    display: "Unbounded",
    text: "Outfit",
    displayWeight: 800,
    tracking: "-0.03em",
    stickerRotate: "-7deg",
    compare: ["Before", "Better"],
  },
  ugc: {
    name: "UGC System",
    display: "Big Shoulders Display",
    text: "Figtree",
    displayWeight: 700,
    tracking: "-0.02em",
    stickerRotate: "6deg",
    compare: ["Was", "Now"],
  },
};

const acid = {
  bg: "#080A06",
  raised: "#151A0E",
  text: "#E5FF57",
  muted: "#C6E86A",
  accent: "#DEFF4A",
  accentInk: "#141A08",
  accent2: "#DEFF4A",
  accent2Ink: "#141A08",
  line: "#3A4A28",
  scrim: "#050705",
};

export const palettes = {
  dossair: {
    dark: {
      bg: "#101618",
      raised: "#1A2428",
      text: "#E7F0F1",
      muted: "#B7C9CB",
      accent: "#8FE0D4",
      accentInk: "#06211E",
      accent2: "#8FE0D4",
      accent2Ink: "#06211E",
      line: "#2A3A3E",
      scrim: "#070C0D",
    },
    light: {
      bg: "#E4EEEF",
      raised: "#F5F9F9",
      text: "#122226",
      muted: "#3C5558",
      accent: "#0F5C56",
      accentInk: "#F3FFFD",
      accent2: "#0F5C56",
      accent2Ink: "#F3FFFD",
      line: "#C3D2D4",
      scrim: "#070C0D",
    },
  },
  sigmahack: {
    dark: {
      bg: "#141018",
      raised: "#221C2A",
      text: "#F6F1EA",
      muted: "#CDBFD0",
      accent: "#FF6A33",
      accentInk: "#1C0904",
      accent2: "#FF6A33",
      accent2Ink: "#1C0904",
      line: "#3C3346",
      scrim: "#0C090E",
    },
    light: {
      bg: "#F6F0E8",
      raised: "#FFFCF7",
      text: "#1B1220",
      muted: "#5C4B58",
      accent: "#8E220A",
      accentInk: "#FFF8F4",
      accent2: "#8E220A",
      accent2Ink: "#FFF8F4",
      line: "#E3D5C8",
      scrim: "#0C090E",
    },
  },
  ugc: {
    dark: {
      bg: "#1A0A14",
      raised: "#2A1220",
      text: "#FFF3EC",
      muted: "#F0C6D4",
      accent: "#FF4D93",
      accentInk: "#2A0614",
      accent2: "#FFC43A",
      accent2Ink: "#241802",
      line: "#4C2838",
      scrim: "#14060E",
    },
    light: {
      bg: "#FFF1E8",
      raised: "#FFFFFF",
      text: "#1E1016",
      muted: "#6E4452",
      accent: "#BE125F",
      accentInk: "#FFF7FA",
      accent2: "#FFC43A",
      accent2Ink: "#1E1404",
      line: "#F0D0C2",
      scrim: "#14060E",
    },
  },
};

export function paletteFor(subject, theme) {
  if (theme === "acid") return acid;
  const group = palettes[subject];
  if (!group || !group[theme]) {
    throw new Error(`No colours for ${subject} / ${theme}.`);
  }
  return group[theme];
}

// Local font files from the fontsource packages. No network font calls.
export const fontFiles = [
  ["Newsreader", 400, "normal", "newsreader", "newsreader-latin-400-normal.woff2"],
  ["Newsreader", 500, "normal", "newsreader", "newsreader-latin-500-normal.woff2"],
  ["Newsreader", 600, "normal", "newsreader", "newsreader-latin-600-normal.woff2"],
  ["Newsreader", 400, "italic", "newsreader", "newsreader-latin-400-italic.woff2"],
  ["Newsreader", 500, "italic", "newsreader", "newsreader-latin-500-italic.woff2"],
  ["IBM Plex Sans", 400, "normal", "ibm-plex-sans", "ibm-plex-sans-latin-400-normal.woff2"],
  ["IBM Plex Sans", 500, "normal", "ibm-plex-sans", "ibm-plex-sans-latin-500-normal.woff2"],
  ["IBM Plex Sans", 600, "normal", "ibm-plex-sans", "ibm-plex-sans-latin-600-normal.woff2"],
  ["Unbounded", 500, "normal", "unbounded", "unbounded-latin-500-normal.woff2"],
  ["Unbounded", 700, "normal", "unbounded", "unbounded-latin-700-normal.woff2"],
  ["Unbounded", 800, "normal", "unbounded", "unbounded-latin-800-normal.woff2"],
  ["Outfit", 400, "normal", "outfit", "outfit-latin-400-normal.woff2"],
  ["Outfit", 500, "normal", "outfit", "outfit-latin-500-normal.woff2"],
  ["Outfit", 600, "normal", "outfit", "outfit-latin-600-normal.woff2"],
  ["Big Shoulders Display", 500, "normal", "big-shoulders-display", "big-shoulders-display-latin-500-normal.woff2"],
  ["Big Shoulders Display", 700, "normal", "big-shoulders-display", "big-shoulders-display-latin-700-normal.woff2"],
  ["Big Shoulders Display", 800, "normal", "big-shoulders-display", "big-shoulders-display-latin-800-normal.woff2"],
  ["Figtree", 400, "normal", "figtree", "figtree-latin-400-normal.woff2"],
  ["Figtree", 500, "normal", "figtree", "figtree-latin-500-normal.woff2"],
  ["Figtree", 600, "normal", "figtree", "figtree-latin-600-normal.woff2"],
  ["Figtree", 700, "normal", "figtree", "figtree-latin-700-normal.woff2"],
];
