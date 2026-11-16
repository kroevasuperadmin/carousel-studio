# carousel-studio

A small tool that turns written slide copy into finished carousel images for Instagram, LinkedIn, and X.

You write one JSON file. The tool paints each slide in HTML, screenshots it with headless Chromium, and gives you a PNG per slide, a caption file, and a zip.

No accounts, no API keys, no font downloads at render time. The typefaces come from local font files.

## Install

From this folder:

```
npm install
```

The renderer uses Chrome if it is installed, and otherwise Playwright's Chromium:

```
npx playwright install chromium
```

## Add a post

Create a file in `posts/`. The name can be anything. The `id` inside the file is what the images are named with.

```json
{
  "id": "monday-brief",
  "platform": "instagram",
  "subject": "dossair",
  "theme": "dark",
  "caption": "The caption you will paste into the post.",
  "slides": [
    {
      "layout": "headline",
      "kicker": "Field note",
      "headline": "A brief should fit on one page.",
      "body": "If it needs a meeting, it is not done.",
      "stat": "",
      "cta": "",
      "background": "assets/backgrounds/dossair-field.svg"
    }
  ]
}
```

`platform` is `instagram`, `linkedin`, or `x`.

`subject` picks the brand:

- `dossair` is calm and sharp.
- `sigmahack` is loud, confident, a bit cheeky.
- `ugc` is energetic.

`theme` is `dark`, `light`, or `acid`. Acid is high-contrast lime on near-black. The brand's type and layout stay; the colours switch.

`background` is optional. It can be a path (next to the JSON file, or from the folder you run the command in) or an `http` URL. On most layouts the picture sits behind the words and a dark overlay is added until the text clears 4.5:1 contrast. If it still cannot, the render stops. On the `frame` layout the picture sits inside the frame instead, like a screenshot.

### Layouts

Use one `layout` per slide:

| layout | What it is | What to put in the fields |
| --- | --- | --- |
| `headline` | Oversized headline | `headline`, optional `kicker` and `body` |
| `stat` | Big number | `stat` is the number, `headline` explains it |
| `split` | Two columns | `headline` on the left, `body` on the right |
| `quote` | Quote card | `headline` is the quote, `body` is the credit |
| `checklist` | A short list | one item per line in `body` |
| `compare` | Before and after | two paragraphs in `body`, separated by a blank line |
| `timeline` | Steps | one step per line, written `Mon \| What happened` |
| `frame` | Screenshot frame | `headline` above, `body` under, `background` inside the frame |
| `sticker` | Sticker callout | `headline` is the point, `cta` is the sticker |
| `cta` | Closing slide | `headline` is the ask, `cta` is the button |

Leave unused fields out. They are optional.

### Colours and fonts

Edit `tokens.mjs`. That file is the only place colours and font choices are set. Dossair uses Newsreader and IBM Plex Sans. SigmaHack uses Unbounded and Outfit. UGC System uses Big Shoulders Display and Figtree.

## Render

```
node render.mjs posts/monday-brief.json
node render.mjs posts/*.json
node render.mjs --all
node render.mjs --all --out samples
```

Files land in `out/` unless you pass `--out`.

- Instagram and LinkedIn: `monday-brief-01.png` at 1080×1350.
- X: `monday-brief-01.png` at 1600×900, and `monday-brief-01-portrait.png` at 1080×1350.
- `monday-brief.caption.txt` is the caption.
- `monday-brief.zip` holds the images and the caption.

Every slide has the same corner mark, the same `01 / 06` counter, and the same swipe cue.

## Lint

```
node render.mjs lint
node render.mjs lint posts/monday-brief.json
```

Lint flags two things:

- Two slides whose headlines start with the same four words.
- A slide with more than 35 words across kicker, headline, body, stat, and cta.

It prints the problems and exits with an error code if it finds any.

## Samples

`posts/` has six finished posts. `samples/` has the PNGs, captions, and zips from the last render. To rebuild them:

```
npm run samples
```
