import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { PNG } from "pngjs";
import { loadPost } from "../lib/post.mjs";
import { openBrowser, renderPost } from "../lib/render-post.mjs";

test("a slide is the right size and a white picture gets a dark overlay", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "carousel-"));
  const sheet = new PNG({ width: 32, height: 32 });
  for (let i = 0; i < sheet.data.length; i += 4) {
    sheet.data[i] = 255;
    sheet.data[i + 1] = 255;
    sheet.data[i + 2] = 255;
    sheet.data[i + 3] = 255;
  }
  writeFileSync(path.join(dir, "white.png"), PNG.sync.write(sheet));
  writeFileSync(
    path.join(dir, "post.json"),
    JSON.stringify({
      id: "smoke",
      platform: "instagram",
      subject: "dossair",
      theme: "dark",
      caption: "Smoke caption.",
      slides: [
        { layout: "headline", kicker: "Check", headline: "Words stay sharp.", body: "A short line." },
        {
          layout: "headline",
          kicker: "Photo",
          headline: "On top of white.",
          body: "Still readable.",
          background: "white.png",
        },
      ],
    }),
  );

  const browser = await openBrowser();
  try {
    const result = await renderPost(loadPost(path.join(dir, "post.json")), dir, browser);
    const plain = PNG.sync.read(readFileSync(result.pngs[0]));
    assert.equal(plain.width, 1080);
    assert.equal(plain.height, 1350);
    const photo = PNG.sync.read(readFileSync(result.pngs[1]));
    const pixel = (photo.width * 48 + 48) << 2;
    const sum = photo.data[pixel] + photo.data[pixel + 1] + photo.data[pixel + 2];
    assert.ok(sum < 420, `the overlay should darken white, got channel sum ${sum}`);
    assert.match(readFileSync(path.join(dir, "smoke.caption.txt"), "utf8"), /Smoke caption/);
    assert.ok(readFileSync(path.join(dir, "smoke.zip")).length > 500);
  } finally {
    await browser.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
