import assert from "node:assert/strict";
import test from "node:test";
import { hookKey, lintPosts, slideWordCount } from "../lib/lint.mjs";

function slide(headline, extra = "") {
  return { layout: "headline", kicker: "", headline, body: extra, stat: "", cta: "" };
}

test("35 words is allowed and 36 is not", () => {
  const ok = slide("One two three four", Array.from({ length: 31 }, (_, i) => `w${i}`).join(" "));
  const over = slide("One two three four", Array.from({ length: 32 }, (_, i) => `w${i}`).join(" "));
  assert.equal(slideWordCount(ok), 35);
  assert.equal(slideWordCount(over), 36);
  assert.equal(lintPosts([{ id: "ok", slides: [ok] }]).length, 0);
  const issues = lintPosts([{ id: "long", slides: [over] }]);
  assert.equal(issues.length, 1);
  assert.match(issues[0].message, /36 words/);
});

test("the same first four words are flagged across slides", () => {
  const posts = [
    {
      id: "one",
      slides: [
        slide("Ship the quiet version today"),
        slide("Ship the quiet version tomorrow, please"),
      ],
    },
  ];
  const issues = lintPosts(posts);
  assert.equal(issues.length, 1);
  assert.match(issues[0].message, /ship the quiet version/);
});

test("different openings are fine", () => {
  const posts = [
    { id: "a", slides: [slide("Keep the decision on the page")] },
    { id: "b", slides: [slide("Cut the tour out of the brief")] },
  ];
  assert.equal(lintPosts(posts).length, 0);
  assert.equal(hookKey("Keep the decision, on the page."), "keep the decision on");
});
