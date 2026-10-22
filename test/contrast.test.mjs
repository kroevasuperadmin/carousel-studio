import assert from "node:assert/strict";
import test from "node:test";
import { PNG } from "pngjs";
import { contrastHex, hexToRgb, measureRegions, neededOpacity } from "../lib/contrast.mjs";

function solid(width, height, rgb) {
  const png = new PNG({ width, height });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = rgb[0];
    png.data[i + 1] = rgb[1];
    png.data[i + 2] = rgb[2];
    png.data[i + 3] = 255;
  }
  return png;
}

test("black on white clears 4.5 and white on white does not", () => {
  assert.ok(contrastHex("#000000", "#ffffff") > 4.5);
  assert.ok(contrastHex("#ffffff", "#ffffff") < 4.5);
});

test("a light word on a white picture needs a dark scrim", () => {
  const png = solid(80, 40, [255, 255, 255]);
  const regions = [
    {
      x: 0,
      y: 0,
      width: 80,
      height: 40,
      rgb: hexToRgb("#F4F7F6"),
      surface: "scrim",
      label: "word",
    },
  ];
  const alpha = neededOpacity(png, regions, hexToRgb("#070C0D"), { floor: 0, cap: 0.9 });
  assert.ok(alpha > 0.4 && alpha < 0.85);
});

test("dark type on a white card cannot be saved by a dark scrim", () => {
  const png = solid(80, 40, [255, 255, 255]);
  const regions = [
    {
      x: 0,
      y: 0,
      width: 80,
      height: 40,
      rgb: hexToRgb("#111111"),
      surface: "scrim",
      label: "word",
    },
  ];
  assert.equal(neededOpacity(png, regions, hexToRgb("#000000"), { floor: 0, cap: 0.9 }), null);
});

test("measureRegions reads the pixels that are actually there", () => {
  const png = solid(40, 20, [255, 255, 255]);
  const worst = measureRegions(png, [
    { x: 0, y: 0, width: 40, height: 20, rgb: [255, 255, 255], surface: "panel", label: "same" },
  ]);
  assert.ok(worst.ratio < 1.1);
});
