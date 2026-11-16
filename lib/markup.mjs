import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { imageInk, subjects } from "../tokens.mjs";
import { fontCss } from "./fonts.mjs";

const slideCss = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "slide.css"), "utf8");

const ARROW = `<svg class="arrow" viewBox="0 0 36 14" width="36" height="14" aria-hidden="true"><path d="M1 7 H28" stroke="currentColor" stroke-width="2" fill="none"/><path d="M24 2 L33 7 L24 12" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rich(value) {
  return esc(value).replace(/\n/g, "<br>");
}

export function linesOf(value) {
  return String(value ?? "")
    .split(/\n/)
    .map((line) => line.trim().replace(/^([-*•]|\d+[.)])\s+/, ""))
    .filter(Boolean);
}

export function pairOf(value) {
  const blocks = String(value ?? "")
    .trim()
    .split(/\n\s*\n|^\s*---\s*$/m)
    .map((part) => part.trim())
    .filter(Boolean);
  return [blocks[0] || "", blocks[1] || ""];
}

export function eventsOf(value) {
  return linesOf(value).map((line) => {
    const bits = line.split(/\s+\|\s+/);
    if (bits.length >= 2) return { when: bits[0], what: bits.slice(1).join(" ") };
    return { when: "", what: line };
  });
}

export function displaySize(text, layout, subject, landscape) {
  const len = [...String(text ?? "")].length || 1;
  let size;
  if (layout === "stat") {
    const n = String(text ?? "").trim().length;
    size = landscape ? (n <= 5 ? 168 : n <= 9 ? 124 : 96) : n <= 5 ? 220 : n <= 9 ? 160 : 116;
  } else if (layout === "quote") {
    size = landscape ? (len <= 46 ? 56 : 44) : len <= 42 ? 70 : len <= 70 ? 58 : 46;
  } else if (layout === "split") {
    size = landscape ? 46 : 56;
  } else if (layout === "headline" || layout === "cta" || layout === "sticker") {
    size = landscape
      ? len <= 34 ? 68 : len <= 56 ? 54 : 44
      : len <= 30 ? 92 : len <= 48 ? 76 : len <= 68 ? 62 : 52;
  } else {
    size = landscape ? 48 : 58;
  }
  const factor = subject === "sigmahack" ? 0.78 : subject === "ugc" ? 1.04 : 1;
  return Math.round(size * factor);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function kicker(slide, subject, embedded) {
  if (!slide.kicker) return "";
  const tab = subject === "dossair" && !embedded;
  const surface = tab || embedded ? "panel" : "scrim";
  const cls = tab ? "kicker tab" : embedded ? "kicker muted" : "kicker";
  return `<p class="${cls}" data-contrast data-surface="${surface}">${rich(slide.kicker)}</p>`;
}

function block(className, content, surface = "scrim") {
  if (!String(content ?? "").trim()) return "";
  return `<p class="${className}" data-contrast data-surface="${surface}">${rich(content)}</p>`;
}

function brand(post, surface) {
  const name = subjects[post.subject].name;
  return `<div class="brand" data-contrast data-surface="${surface}">${esc(name)}</div>`;
}

function rule() {
  return `<i class="rule" aria-hidden="true"></i>`;
}

function stat(post, slide) {
  return `<main class="main">
    ${kicker(slide, post.subject, false)}
    <div class="stat-row">
      <p class="display figure" data-contrast data-surface="scrim">${rich(slide.stat)}</p>
      <div class="stat-copy">
        ${rule()}
        <h1 class="headline" data-contrast data-surface="scrim">${rich(slide.headline)}</h1>
        ${block("body", slide.body)}
      </div>
    </div>
  </main>`;
}

function headline(post, slide) {
  const bar = post.subject === "ugc" ? rule() : "";
  return `<main class="main">
    ${kicker(slide, post.subject, false)}
    <div>
      ${bar}
      <h1 class="display hero" data-contrast data-surface="scrim">${rich(slide.headline)}</h1>
      ${block("body", slide.body)}
    </div>
  </main>`;
}

function split(post, slide) {
  const accent = post.subject === "sigmahack";
  const surface = accent ? "panel" : "scrim";
  const kick = accent
    ? slide.kicker
      ? `<p class="kicker" data-contrast data-surface="panel">${rich(slide.kicker)}</p>`
      : ""
    : kicker(slide, post.subject, false);
  return `<main class="main">
    <div class="cols">
      <section class="col col-a${accent ? " fill-accent" : ""}">
        ${brand(post, surface)}
        ${kick}
        <h1 class="display" data-contrast data-surface="${surface}">${rich(slide.headline)}</h1>
      </section>
      <section class="col col-b">
        ${block("body", slide.body)}
      </section>
    </div>
  </main>`;
}

function quote(post, slide) {
  return `<main class="main">
    <div class="card">
      ${kicker(slide, post.subject, true)}
      <blockquote class="display quote-text" data-contrast data-surface="panel">${rich(slide.headline)}</blockquote>
      ${block("attrib muted", slide.body, "panel")}
    </div>
  </main>`;
}

function checklist(post, slide) {
  const markSurface = post.subject === "sigmahack" ? "panel" : "scrim";
  const items = linesOf(slide.body)
    .map(
      (item, index) => `<li>
        <span class="mark-wrap">
          <i class="tick" aria-hidden="true"></i>
          <span class="mark" data-contrast data-surface="${markSurface}">${pad(index + 1)}</span>
        </span>
        <span class="item" data-contrast data-surface="scrim">${rich(item)}</span>
      </li>`,
    )
    .join("");
  return `<main class="main">
    ${kicker(slide, post.subject, false)}
    <h1 class="display" data-contrast data-surface="scrim">${rich(slide.headline)}</h1>
    <ul class="list">${items}</ul>
  </main>`;
}

function compare(post, slide) {
  const [before, after] = pairOf(slide.body);
  const [beforeLabel, afterLabel] = subjects[post.subject].compare;
  return `<main class="main">
    ${kicker(slide, post.subject, false)}
    <h1 class="display" data-contrast data-surface="scrim">${rich(slide.headline)}</h1>
    <div class="panels">
      <section class="panel before">
        <span class="tag" data-contrast data-surface="panel">${esc(beforeLabel)}</span>
        <p data-contrast data-surface="panel">${rich(before)}</p>
      </section>
      <section class="panel after">
        <span class="tag" data-contrast data-surface="panel">${esc(afterLabel)}</span>
        <p data-contrast data-surface="panel">${rich(after)}</p>
      </section>
    </div>
  </main>`;
}

function timeline(post, slide) {
  const events = eventsOf(slide.body)
    .map(
      (event) => `<li>
        <i class="node" aria-hidden="true"></i>
        ${event.when ? `<span class="when" data-contrast data-surface="scrim">${rich(event.when)}</span>` : ""}
        <span class="what" data-contrast data-surface="scrim">${rich(event.what)}</span>
      </li>`,
    )
    .join("");
  return `<main class="main">
    ${kicker(slide, post.subject, false)}
    <h1 class="display" data-contrast data-surface="scrim">${rich(slide.headline)}</h1>
    <ol class="steps">${events}</ol>
  </main>`;
}

function frame(post, slide, picture) {
  const screen = picture
    ? `<img class="shot" alt="" src="${esc(picture)}">`
    : `<div class="mock" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>`;
  return `<main class="main">
    ${kicker(slide, post.subject, false)}
    <h1 class="display" data-contrast data-surface="scrim">${rich(slide.headline)}</h1>
    <div class="device">
      <div class="crops" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="dots" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="screen">${screen}</div>
      <div class="home" aria-hidden="true"></div>
    </div>
    ${block("caption", slide.body)}
  </main>`;
}

function sticker(post, slide) {
  const label = slide.cta || slide.stat || "";
  return `<main class="main">
    ${kicker(slide, post.subject, false)}
    <div>
      <h1 class="display hero" data-contrast data-surface="scrim">${rich(slide.headline)}</h1>
      ${block("body", slide.body)}
    </div>
  </main>
  ${label ? `<div class="badge" data-contrast data-surface="panel">${rich(label)}</div>` : ""}`;
}

function cta(post, slide) {
  const bar = post.subject === "ugc" ? rule() : "";
  let action = "";
  if (slide.cta) {
    if (post.subject === "dossair") {
      action = `<div class="action quiet"><span data-contrast data-surface="scrim">${rich(slide.cta)}</span>${rule()}</div>`;
    } else {
      action = `<div class="action fill"><span data-contrast data-surface="panel">${rich(slide.cta)}</span></div>`;
    }
  }
  return `<main class="main">
    ${kicker(slide, post.subject, false)}
    <div>
      ${bar}
      <h1 class="display hero" data-contrast data-surface="scrim">${rich(slide.headline)}</h1>
      ${block("body", slide.body)}
      ${action}
    </div>
  </main>`;
}

const DRAW = {
  stat,
  headline,
  split,
  quote,
  checklist,
  compare,
  timeline,
  frame,
  sticker,
  cta,
};

function styleOf(vars) {
  return Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}

export function slideDocument({ post, slide, index, total, size, picture, fullBleed }) {
  const meta = subjects[post.subject];
  const source = slide.layout === "stat" ? slide.stat : slide.headline;
  const displayPx = displaySize(source, slide.layout, post.subject, size.ratio === "landscape");
  const overImage = fullBleed && post.theme === "light";
  const vars = {
    "--w": `${size.width}px`,
    "--h": `${size.height}px`,
    "--bg": post.colors.bg,
    "--raised": post.colors.raised,
    "--ink": overImage ? imageInk.text : post.colors.text,
    "--muted": overImage ? imageInk.muted : post.colors.muted,
    "--accent": post.colors.accent,
    "--accent-ink": post.colors.accentInk,
    "--accent-2": post.colors.accent2,
    "--accent-2-ink": post.colors.accent2Ink,
    "--line": post.colors.line,
    "--scrim": post.colors.scrim,
    "--scrim-alpha": "0",
    "--panel-bg": post.colors.bg,
    "--panel-ink": post.colors.text,
    "--panel-muted": post.colors.muted,
    "--display": `'${meta.display}'`,
    "--text-face": `'${meta.text}'`,
    "--display-weight": String(meta.displayWeight),
    "--tracking": meta.tracking,
    "--sticker-rotate": meta.stickerRotate,
    "--display-size": `${displayPx}px`,
  };
  const inner = DRAW[slide.layout](post, slide, picture);
  const mark = slide.layout === "split" ? "" : brand(post, "scrim");
  const bleed = fullBleed ? `<img class="bg" alt="" src="${esc(picture)}">` : "";
  return `<!DOCTYPE html>
<html data-ratio="${size.ratio}" data-subject="${post.subject}" data-theme="${post.theme}" data-layout="${slide.layout}" class="${fullBleed ? "has-image" : ""}" style="${styleOf(vars)}">
<head>
<meta charset="utf-8">
<style>${fontCss()}\n${slideCss}</style>
</head>
<body>
<article class="slide">
  ${bleed}
  <div class="scrim"></div>
  ${mark}
  ${inner}
  <footer class="chrome">
    <span class="counter" data-contrast data-surface="scrim">${pad(index + 1)} / ${pad(total)}</span>
    <span class="swipe"><span data-contrast data-surface="scrim">Swipe</span>${ARROW}</span>
  </footer>
</article>
</body>
</html>`;
}
