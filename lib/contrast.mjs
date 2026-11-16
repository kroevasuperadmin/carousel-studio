import { MIN_CONTRAST } from "../tokens.mjs";

export function channel(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(rgb) {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

export function contrastRatio(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function hexToRgb(hex) {
  const h = String(hex).replace("#", "").trim();
  if (h.length !== 6) throw new Error(`Bad colour: ${hex}`);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function contrastHex(fg, bg) {
  return contrastRatio(hexToRgb(fg), hexToRgb(bg));
}

export function parseCssColor(value) {
  const match = String(value).match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (!match) throw new Error(`Could not read a colour from "${value}".`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function blend(pixel, scrim, alpha) {
  const k = 1 - alpha;
  return [
    pixel[0] * k + scrim[0] * alpha,
    pixel[1] * k + scrim[1] * alpha,
    pixel[2] * k + scrim[2] * alpha,
  ];
}

// 10th percentile: the dim end of the contrast range inside the box.
// A bright speck in a dark field still counts.
function percentileRatio(pixels, textRgb, scrimRgb, alpha) {
  if (pixels.length === 0) return Infinity;
  const ratios = new Float64Array(pixels.length);
  const textL = luminance(textRgb);
  for (let i = 0; i < pixels.length; i++) {
    const rgb = alpha == null ? pixels[i] : blend(pixels[i], scrimRgb, alpha);
    const bgL = luminance(rgb);
    const lighter = Math.max(textL, bgL);
    const darker = Math.min(textL, bgL);
    ratios[i] = (lighter + 0.05) / (darker + 0.05);
  }
  ratios.sort();
  const rank = Math.max(0, Math.floor((ratios.length - 1) * 0.1));
  return ratios[rank];
}

export function sampleBox(png, box) {
  const inset = box.width > 12 && box.height > 12 ? 2 : 0;
  const x0 = Math.max(0, Math.floor(box.x) + inset);
  const y0 = Math.max(0, Math.floor(box.y) + inset);
  const x1 = Math.min(png.width, Math.ceil(box.x + box.width) - inset);
  const y1 = Math.min(png.height, Math.ceil(box.y + box.height) - inset);
  const pixels = [];
  const step = x1 - x0 > 80 || y1 - y0 > 80 ? 2 : 1;
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const i = (png.width * y + x) << 2;
      pixels.push([png.data[i], png.data[i + 1], png.data[i + 2]]);
    }
  }
  return pixels;
}

export function measureRegions(png, regions) {
  let worst = { ratio: Infinity, label: "" };
  for (const region of regions) {
    const pixels = sampleBox(png, region);
    const ratio = percentileRatio(pixels, region.rgb, null, null);
    if (ratio < worst.ratio) worst = { ratio, label: region.label };
  }
  return worst;
}

// Smallest scrim opacity that brings scrim-surface words to 4.5:1.
// Returns null when even a near-solid scrim cannot get there.
export function neededOpacity(png, regions, scrimRgb, { floor = 0, cap = 0.9 } = {}) {
  let required = floor;
  for (const region of regions) {
    if (region.surface === "panel") continue;
    const pixels = sampleBox(png, region);
    if (pixels.length === 0) continue;
    const atCap = percentileRatio(pixels, region.rgb, scrimRgb, cap);
    if (atCap < MIN_CONTRAST) return null;
    const atZero = percentileRatio(pixels, region.rgb, scrimRgb, 0);
    if (atZero >= MIN_CONTRAST) continue;
    let lo = 0;
    let hi = cap;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (percentileRatio(pixels, region.rgb, scrimRgb, mid) >= MIN_CONTRAST) hi = mid;
      else lo = mid;
    }
    required = Math.max(required, hi);
  }
  return Math.min(cap, required + 0.03);
}

export function paletteProblems(name, colors) {
  const pairs = [
    ["text on the background", colors.text, colors.bg],
    ["secondary text on the background", colors.muted, colors.bg],
    ["text on a raised panel", colors.text, colors.raised],
    ["secondary text on a raised panel", colors.muted, colors.raised],
    ["label on the accent", colors.accentInk, colors.accent],
    ["label on the second accent", colors.accent2Ink, colors.accent2],
  ];
  const problems = [];
  for (const [label, fg, bg] of pairs) {
    const ratio = contrastHex(fg, bg);
    if (ratio < MIN_CONTRAST) {
      problems.push(`${name}: ${label} is ${ratio.toFixed(2)}:1 (needs ${MIN_CONTRAST}:1).`);
    }
  }
  return problems;
}

export function formatContrastFailure(postId, slideNumber, ratio, label) {
  const where = label ? ` ("${label}")` : "";
  return (
    `${postId} slide ${slideNumber}${where} is ${ratio.toFixed(2)}:1. ` +
    `Words need ${MIN_CONTRAST}:1. The dark overlay could not get there. ` +
    `Use a darker picture, or adjust the colours in tokens.mjs.`
  );
}
