const WORD_LIMIT = 35;

export function wordsOf(value) {
  return String(value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function slideWordCount(slide) {
  return ["kicker", "headline", "body", "stat", "cta"].reduce(
    (sum, key) => sum + wordsOf(slide?.[key]).length,
    0,
  );
}

export function hookKey(headline) {
  const words = wordsOf(headline)
    .join(" ")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  return words.slice(0, 4).join(" ");
}

export function lintPosts(posts) {
  const issues = [];
  const seen = new Map();

  for (const post of posts) {
    post.slides.forEach((slide, index) => {
      const count = slideWordCount(slide);
      if (count > WORD_LIMIT) {
        issues.push({
          id: post.id,
          slide: index + 1,
          kind: "words",
          message: `${post.id} slide ${index + 1} has ${count} words. The limit is ${WORD_LIMIT}.`,
        });
      }

      const hook = hookKey(slide.headline);
      if (!hook) return;
      const hit = { id: post.id, slide: index + 1, hook };
      if (!seen.has(hook)) seen.set(hook, []);
      seen.get(hook).push(hit);
    });
  }

  for (const [hook, hits] of seen) {
    if (hits.length < 2) continue;
    const places = hits.map((hit) => `${hit.id} slide ${hit.slide}`).join(" and ");
    issues.push({
      id: hits[0].id,
      slide: hits[0].slide,
      kind: "hook",
      message: `${places} open with the same words: "${hook}". Change one of the headlines.`,
    });
  }

  return issues;
}
