import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import JSZip from "jszip";
import { MIN_CONTRAST, paletteFor, subjects } from "../tokens.mjs";
import {
  formatContrastFailure,
  hexToRgb,
  measureRegions,
  neededOpacity,
  paletteProblems,
  parseCssColor,
} from "./contrast.mjs";
import { resolveBackground, sizesFor, slideFilename } from "./post.mjs";
import { slideDocument } from "./markup.mjs";

const LAUNCH_ARGS = ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"];

export async function openBrowser() {
  const options = { headless: true, args: LAUNCH_ARGS };
  try {
    return await chromium.launch({ ...options, channel: "chrome" });
  } catch {
    return await chromium.launch(options);
  }
}

export async function renderPost(post, outDir, browser) {
  const colors = paletteFor(post.subject, post.theme);
  const problems = paletteProblems(`${post.subject} ${post.theme}`, colors);
  if (problems.length) {
    throw new Error(problems.join(" "));
  }
  const prepared = { ...post, colors };
  mkdirSync(outDir, { recursive: true });
  clearPrevious(outDir, post.id);

  const context = await browser.newContext({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const written = [];
  const notes = [];

  try {
    for (const size of sizesFor(post.platform)) {
      for (let index = 0; index < post.slides.length; index++) {
        const slide = post.slides[index];
        const picture = resolveBackground(slide.background, post.file);
        const fullBleed = Boolean(picture) && slide.layout !== "frame";
        const html = slideDocument({
          post: prepared,
          slide,
          index,
          total: post.slides.length,
          size,
          picture,
          fullBleed,
        });
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.setContent(html, { waitUntil: "load" });
        await page.evaluate(async () => {
          await document.fonts.ready;
        });
        await waitForImages(page);
        const meta = subjects[prepared.subject];
        const missing = await page.evaluate(async ({ display, text, weight }) => {
          const wanted = [
            [`${weight} 48px "${display}"`, display],
            [`400 20px "${text}"`, text],
          ];
          const quote = document.querySelector(".quote-text");
          if (quote && getComputedStyle(quote).fontStyle === "italic") {
            wanted.push([`400 italic 64px "${display}"`, `${display} italic`]);
          }
          const bad = [];
          for (const [query, name] of wanted) {
            const faces = await document.fonts.load(query);
            if (!faces.length) bad.push(name);
          }
          await document.fonts.ready;
          return bad;
        }, { display: meta.display, text: meta.text, weight: meta.displayWeight });
        if (missing.length) {
          throw new Error(`Font did not load: ${missing.join(", ")}.`);
        }
        await fitSlide(page, prepared, index);
        const scrim = await settleContrast(page, prepared, index);
        const buffer = await page.screenshot({ type: "png", animations: "disabled" });
        const filename = slideFilename(post.id, index, size.suffix);
        const file = path.join(outDir, filename);
        writeFileSync(file, buffer);
        written.push(file);
        const png = PNG.sync.read(buffer);
        if (png.width !== size.width || png.height !== size.height) {
          throw new Error(
            `${filename} came out ${png.width}x${png.height}. Expected ${size.width}x${size.height}.`,
          );
        }
        notes.push(
          `${filename}  ${size.width}x${size.height}  ${slide.layout}  contrast ${scrim.ratio.toFixed(2)}:1  scrim ${scrim.alpha.toFixed(2)}`,
        );
      }
    }
  } finally {
    await context.close();
  }

  const captionName = `${post.id}.caption.txt`;
  const captionPath = path.join(outDir, captionName);
  const caption = post.caption.endsWith("\n") ? post.caption : `${post.caption}\n`;
  writeFileSync(captionPath, caption);

  const zipPath = path.join(outDir, `${post.id}.zip`);
  const zip = new JSZip();
  for (const file of written) zip.file(path.basename(file), readFileSync(file));
  zip.file(captionName, caption);
  writeFileSync(zipPath, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));

  return { pngs: written, captionPath, zipPath, notes };
}

async function waitForImages(page) {
  await page.waitForFunction(
    () => [...document.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0),
    { timeout: 20000 },
  );
}

async function fitSlide(page, post, index) {
  for (let attempt = 0; attempt < 7; attempt++) {
    const bad = await page.evaluate(overflowReport);
    if (bad.length === 0) return;
    if (attempt === 6) {
      throw new Error(
        `${post.id} slide ${index + 1} does not fit: ${bad[0]}. Shorten the line or lower the type in tokens.`,
      );
    }
    await page.evaluate(() => {
      const root = document.documentElement;
      for (const name of ["--display-size", "--body-size"]) {
        const current = parseFloat(getComputedStyle(root).getPropertyValue(name));
        if (current) root.style.setProperty(name, `${Math.max(18, current * 0.9)}px`);
      }
    });
  }
}

function overflowReport() {
  const chrome = document.querySelector(".chrome");
  const slide = document.querySelector(".slide");
  const limit = chrome.getBoundingClientRect().top - 16;
  const box = slide.getBoundingClientRect();
  const bad = [];
  for (const el of document.querySelectorAll("[data-contrast]")) {
    if (el.closest(".chrome")) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    const label = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 42);
    if (rect.bottom > limit + 1) bad.push(`"${label}" collides with the footer`);
    if (rect.right > box.right - 32) bad.push(`"${label}" runs off the right edge`);
    if (rect.left < 24) bad.push(`"${label}" runs off the left edge`);
  }
  return bad;
}

async function settleContrast(page, post, index) {
  const fullBleed = await page.evaluate(() => document.documentElement.classList.contains("has-image"));
  // Rotation inflates the measured box past the sticker fill.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll(".badge")) el.style.transform = "none";
  });
  const regions = await readRegions(page);
  await setMeasure(page, true);
  await setAlpha(page, 0);
  let png = await grab(page);

  const fail = (ratio, label) => {
    throw new Error(formatContrastFailure(post.id, index + 1, ratio, label));
  };

  if (fullBleed) {
    const panels = measureRegions(png, regions.filter((region) => region.surface === "panel"));
    if (panels.ratio < MIN_CONTRAST) fail(panels.ratio, panels.label);
    const scrim = hexToRgb(post.colors.scrim);
    let alpha = neededOpacity(png, regions, scrim, { floor: 0.22, cap: 0.9 });
    if (alpha == null) {
      const worst = measureRegions(png, regions);
      fail(worst.ratio, worst.label);
    }
    for (let attempt = 0; attempt < 4; attempt++) {
      await setAlpha(page, alpha);
      png = await grab(page);
      const worst = measureRegions(png, regions);
      // Keep a little room above 4.5 so a small paint difference still passes.
      const target = attempt === 3 ? MIN_CONTRAST : 5.2;
      if (worst.ratio >= target) {
        await setMeasure(page, false);
        return { alpha, ratio: worst.ratio };
      }
      alpha = Math.min(0.92, alpha + 0.06);
    }
    const worst = measureRegions(png, regions);
    fail(worst.ratio, worst.label);
  }

  const worst = measureRegions(png, regions);
  await setMeasure(page, false);
  if (worst.ratio < MIN_CONTRAST) fail(worst.ratio, worst.label);
  return { alpha: 0, ratio: worst.ratio };
}

async function setAlpha(page, alpha) {
  await page.evaluate((value) => {
    document.documentElement.style.setProperty("--scrim-alpha", String(value));
  }, alpha);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function setMeasure(page, on) {
  await page.evaluate((value) => {
    document.body.classList.toggle("measure", value);
    if (!value) {
      for (const el of document.querySelectorAll(".badge")) el.style.transform = "";
    }
  }, on);
}

async function grab(page) {
  const buffer = await page.screenshot({ type: "png", animations: "disabled" });
  return PNG.sync.read(buffer);
}

async function readRegions(page) {
  const raw = await page.evaluate(() => {
    const list = [];
    for (const el of document.querySelectorAll("[data-contrast]")) {
      const rect = el.getBoundingClientRect();
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!text || rect.width < 2 || rect.height < 2) continue;
      list.push({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        color: getComputedStyle(el).color,
        surface: el.getAttribute("data-surface") || "scrim",
        label: text.slice(0, 70),
      });
    }
    return list;
  });
  return raw.map((region) => ({ ...region, rgb: parseCssColor(region.color) }));
}

function clearPrevious(outDir, id) {
  if (!existsSync(outDir)) return;
  for (const name of readdirSync(outDir)) {
    if (name === `${id}.zip` || name === `${id}.caption.txt` || name.startsWith(`${id}-`)) {
      unlinkSync(path.join(outDir, name));
    }
  }
}
