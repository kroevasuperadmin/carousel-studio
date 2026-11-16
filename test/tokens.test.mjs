import assert from "node:assert/strict";
import test from "node:test";
import { imageInk, paletteFor, palettes, subjects } from "../tokens.mjs";
import { contrastHex, paletteProblems } from "../lib/contrast.mjs";

test("every theme clears 4.5 on the pairs the layouts paint", () => {
  const names = [];
  for (const subject of Object.keys(subjects)) {
    for (const theme of ["dark", "light"]) names.push([`${subject} ${theme}`, paletteFor(subject, theme)]);
  }
  names.push(["acid", paletteFor("dossair", "acid")]);
  const problems = names.flatMap(([name, colors]) => paletteProblems(name, colors));
  assert.deepEqual(problems, []);
});

test("light type still clears 4.5 on a solid scrim", () => {
  const scrims = new Set();
  for (const subject of Object.keys(palettes)) {
    for (const theme of ["dark", "light"]) scrims.add(palettes[subject][theme].scrim);
  }
  scrims.add(paletteFor("ugc", "acid").scrim);
  for (const scrim of scrims) {
    assert.ok(contrastHex(imageInk.text, scrim) >= 4.5, imageInk.text);
    assert.ok(contrastHex(imageInk.muted, scrim) >= 4.5, imageInk.muted);
    assert.ok(contrastHex("#E5FF57", scrim) >= 4.5);
    assert.ok(contrastHex("#C6E86A", scrim) >= 4.5);
  }
});
