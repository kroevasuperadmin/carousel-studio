import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const PLATFORMS = ["instagram", "linkedin", "x"];
export const SUBJECTS = ["dossair", "sigmahack", "ugc"];
export const THEMES = ["dark", "light", "acid"];

export const LAYOUTS = [
  "stat",
  "headline",
  "split",
  "quote",
  "checklist",
  "compare",
  "timeline",
  "frame",
  "sticker",
  "cta",
];

const LAYOUT_ALIASES = {
  "big-number": "stat",
  "big-number-stat": "stat",
  number: "stat",
  "oversized-headline": "headline",
  hero: "headline",
  "split-screen": "split",
  "quote-card": "quote",
  "before-after": "compare",
  "before-and-after": "compare",
  screenshot: "frame",
  "screenshot-frame": "frame",
  callout: "sticker",
  "sticker-callout": "sticker",
  closing: "cta",
  "closing-cta": "cta",
};

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export function normalizeLayout(value) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  return LAYOUT_ALIASES[key] || key;
}

export function loadPost(file) {
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Could not read ${file}. ${error.message}`);
  }
  const problems = validatePost(data, file);
  if (problems.length) {
    throw new Error(problems.join("\n"));
  }
  return {
    ...data,
    file,
    slides: data.slides.map((slide) => ({
      ...slide,
      layout: normalizeLayout(slide.layout),
    })),
  };
}

export function validatePost(data, file = "post") {
  const problems = [];
  const where = path.basename(file);
  if (!data || typeof data !== "object") {
    return [`${where} is not a JSON object.`];
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(data.id || "")) {
    problems.push(`${where}: id should be letters, numbers, dashes, or underscores.`);
  }
  if (!PLATFORMS.includes(data.platform)) {
    problems.push(`${where}: platform must be instagram, linkedin, or x.`);
  }
  if (!SUBJECTS.includes(data.subject)) {
    problems.push(`${where}: subject must be dossair, sigmahack, or ugc.`);
  }
  if (!THEMES.includes(data.theme)) {
    problems.push(`${where}: theme must be dark, light, or acid.`);
  }
  if (typeof data.caption !== "string") {
    problems.push(`${where}: caption must be a string.`);
  }
  if (!Array.isArray(data.slides) || data.slides.length === 0) {
    problems.push(`${where}: add at least one slide.`);
  } else {
    data.slides.forEach((slide, index) => {
      const layout = normalizeLayout(slide?.layout);
      if (!LAYOUTS.includes(layout)) {
        problems.push(
          `${where} slide ${index + 1}: layout must be one of ${LAYOUTS.join(", ")}.`,
        );
      }
    });
  }
  return problems;
}

export function resolveBackground(value, jsonFile) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || String(value).startsWith("data:")) return value;
  const candidates = [
    path.resolve(path.dirname(jsonFile || "."), value),
    path.resolve(process.cwd(), value),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return fileToDataUri(candidate);
  }
  throw new Error(
    `Could not find the background "${value}". Put the path next to the JSON file, or relative to the folder you run from.`,
  );
}

function fileToDataUri(file) {
  const ext = path.extname(file).toLowerCase();
  const mime = MIME[ext];
  if (!mime) {
    throw new Error(`Unsupported image type for ${file}. Use png, jpg, webp, gif, or svg.`);
  }
  const buf = readFileSync(file);
  if (ext === ".svg") {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buf.toString("utf8"))}`;
  }
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export function sizesFor(platform) {
  const portrait = { width: 1080, height: 1350, ratio: "portrait", suffix: "" };
  if (platform === "x") {
    return [
      { width: 1600, height: 900, ratio: "landscape", suffix: "" },
      { ...portrait, suffix: "portrait" },
    ];
  }
  return [portrait];
}

export function slideFilename(id, index, suffix) {
  const number = String(index + 1).padStart(2, "0");
  return suffix ? `${id}-${number}-${suffix}.png` : `${id}-${number}.png`;
}
