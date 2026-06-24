/**
 * Run: `npm run validate:article-rotation`
 * Smoke test for deterministic rotating internal links (Phase 7).
 */
import { exampleArticle } from "../src/lib/content/examples";
import { selectRotatingArticleLinks } from "../src/lib/articles/internal-links";
import { createArticleRotationKey } from "../src/lib/articles/rotation";
import type { Article } from "../src/types/article";

function baseArticle(overrides: Partial<Article>): Article {
  const a = structuredClone(exampleArticle) as Article;
  return { ...a, ...overrides } as Article;
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function main() {
  const current = baseArticle({
    id: "current",
    slug: "current-article",
    title: "Current",
    status: "published",
    internalLinking: {
      primaryCluster: "cluster-a",
      relatedClusters: ["cluster-b"],
      requiredLinks: ["required-one"],
      excludedLinks: ["excluded-x"],
      rotationStrategy: "mixed",
      maxLinks: 4,
    },
    relatedArticleSlugs: ["explicit-one"],
  });

  const requiredOne = baseArticle({
    id: "r1",
    slug: "required-one",
    title: "Required One",
    status: "published",
    internalLinking: {
      primaryCluster: "cluster-a",
      relatedClusters: [],
      rotationStrategy: "mixed",
      maxLinks: 6,
    },
    relatedArticleSlugs: [],
  });

  const sameA = baseArticle({
    id: "s1",
    slug: "same-a",
    title: "Same A",
    status: "published",
    internalLinking: {
      primaryCluster: "cluster-a",
      relatedClusters: [],
      rotationStrategy: "mixed",
      maxLinks: 6,
    },
    relatedArticleSlugs: [],
  });

  const relatedB = baseArticle({
    id: "rb",
    slug: "related-b",
    title: "Related B",
    status: "published",
    internalLinking: {
      primaryCluster: "cluster-b",
      relatedClusters: [],
      rotationStrategy: "mixed",
      maxLinks: 6,
    },
    relatedArticleSlugs: [],
  });

  const explicitOne = baseArticle({
    id: "e1",
    slug: "explicit-one",
    title: "Explicit One",
    status: "published",
    internalLinking: {
      primaryCluster: "cluster-z",
      relatedClusters: [],
      rotationStrategy: "mixed",
      maxLinks: 6,
    },
    relatedArticleSlugs: [],
  });

  const fallback = baseArticle({
    id: "f1",
    slug: "fallback-one",
    title: "Fallback",
    status: "published",
    internalLinking: {
      primaryCluster: "cluster-z",
      relatedClusters: [],
      rotationStrategy: "mixed",
      maxLinks: 6,
    },
    relatedArticleSlugs: [],
  });

  const excluded = baseArticle({
    id: "ex",
    slug: "excluded-x",
    title: "Excluded",
    status: "published",
    internalLinking: {
      primaryCluster: "cluster-a",
      relatedClusters: [],
      rotationStrategy: "mixed",
      maxLinks: 6,
    },
    relatedArticleSlugs: [],
  });

  const draft = baseArticle({
    id: "d",
    slug: "draft-only",
    title: "Draft",
    status: "draft",
    internalLinking: {
      primaryCluster: "cluster-a",
      relatedClusters: [],
      rotationStrategy: "mixed",
      maxLinks: 6,
    },
    relatedArticleSlugs: [],
  });

  const fixed = new Date("2026-05-11T12:00:00.000Z");
  const all = [current, requiredOne, sameA, relatedB, explicitOne, fallback, excluded, draft];

  const r1 = selectRotatingArticleLinks({
    currentArticle: current,
    allPublishedArticles: all,
    date: fixed,
  });
  const r2 = selectRotatingArticleLinks({
    currentArticle: current,
    allPublishedArticles: all,
    date: fixed,
  });

  assert(r1.links.length <= 4, "maxLinks");
  assert(
    r1.links.every((l) => l.slug !== "current-article"),
    "no self link",
  );
  assert(!r1.links.some((l) => l.slug === "excluded-x"), "respect excluded");
  assert(!r1.links.some((l) => l.slug === "draft-only"), "only published");
  assert(r1.links[0]?.slug === "required-one", "required first");
  assert(r1.rotationKey === r2.rotationKey, "stable rotation key");
  assert(JSON.stringify(r1.links) === JSON.stringify(r2.links), "deterministic selection");

  const otherWeek = new Date("2026-06-01T12:00:00.000Z");
  const r3 = selectRotatingArticleLinks({
    currentArticle: current,
    allPublishedArticles: all,
    date: otherWeek,
  });
  assert(
    createArticleRotationKey(current.slug, fixed) !==
      createArticleRotationKey(current.slug, otherWeek),
    "rotation key differs across ISO weeks",
  );
  assert(r1.rotationKey !== r3.rotationKey, "rotationKey field tracks week");

  process.stdout.write("Article rotation validation OK.\n");
}

main();
