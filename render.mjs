#!/usr/bin/env node
import { readdirSync } from "node:fs";
import path from "node:path";
import { lintPosts } from "./lib/lint.mjs";
import { loadPost } from "./lib/post.mjs";
import { openBrowser, renderPost } from "./lib/render-post.mjs";

const help = `carousel-studio

Turn one JSON file into slide images.

  node render.mjs posts/my-post.json
  node render.mjs posts/*.json
  node render.mjs --all
  node render.mjs --all --out samples
  node render.mjs lint
  node render.mjs lint posts/my-post.json

Instagram and LinkedIn slides are 1080x1350.
X slides are 1600x900, plus a 1080x1350 copy named <id>-01-portrait.png.
Each post also gets <id>.zip and <id>.caption.txt.
`;

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
  console.log(help);
  process.exit(args.length === 0 ? 1 : 0);
}

const lintMode = args[0] === "lint" || args.includes("--lint");
const all = args.includes("--all");
const outFlag = args.indexOf("--out");
const outDir = outFlag === -1 ? "out" : args[outFlag + 1];
const skip = new Set(["lint", "--lint", "--all", "--out", outDir]);
const files = args.filter((arg) => !skip.has(arg) && !arg.startsWith("--"));

function postFiles() {
  if (files.length) return files;
  if (all || lintMode) {
    const dir = path.resolve("posts");
    return readdirSync(dir)
      .filter((name) => name.endsWith(".json"))
      .sort()
      .map((name) => path.join(dir, name));
  }
  return [];
}

async function main() {
  const chosen = postFiles();
  if (chosen.length === 0) {
    console.log(help);
    process.exit(1);
  }
  const posts = chosen.map((file) => loadPost(file));

  if (lintMode) {
    const issues = lintPosts(posts);
    if (issues.length === 0) {
      console.log(`No problems in ${posts.length} ${posts.length === 1 ? "post" : "posts"}.`);
      return;
    }
    for (const issue of issues) console.log(issue.message);
    process.exitCode = 1;
    return;
  }

  const browser = await openBrowser();
  try {
    for (const post of posts) {
      console.log(`${post.id}  ${post.platform}  ${post.subject}  ${post.theme}`);
      const result = await renderPost(post, outDir, browser);
      for (const note of result.notes) console.log(`  ${note}`);
      console.log(`  ${path.basename(result.zipPath)}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
