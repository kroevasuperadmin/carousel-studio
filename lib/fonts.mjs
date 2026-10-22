import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fontFiles } from "../tokens.mjs";

const require = createRequire(import.meta.url);

let cached = "";

export function fontCss() {
  if (cached) return cached;
  const faces = [];
  for (const [family, weight, style, pkg, file] of fontFiles) {
    const root = path.dirname(require.resolve(`@fontsource/${pkg}/package.json`));
    const fontPath = path.join(root, "files", file);
    const data = readFileSync(fontPath).toString("base64");
    faces.push(
      `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${data}) format('woff2');}`,
    );
  }
  cached = faces.join("\n");
  return cached;
}
