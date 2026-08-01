import { ALL_FINALISTS, buildTimeline, genreFacets, NO_GENRE } from "@/lib/data";
import { exportCsv, importCsv } from "@/lib/csv";
import { computeStats } from "@/lib/stats";
import type { ReadingRecords } from "@/lib/types";
import { applyFilters, defaultFilters, matchesGenre } from "@/components/FilterBar";

let pass = 0,
  fail = 0;
const ok = (c: boolean, m: string) => {
  if (c) pass++;
  else {
    fail++;
    console.log("  FAIL:", m);
  }
};

// 1. Retro nesting: 2020 ceremony must have a regular set AND a retro-1945 set.
const tl = buildTimeline(ALL_FINALISTS);
const y2020 = tl.find((c) => c.year === 2020)!;
ok(!!y2020, "2020 ceremony present");
ok(y2020.sets.some((s) => !s.isRetro), "2020 has a regular award set");
const retro = y2020.sets.find((s) => s.isRetro);
ok(!!retro && retro.targetYear === 1945, "2020 has a Retro set for target 1945");
ok(!y2020.sets[0].isRetro, "regular set sorts before retro set");
ok(tl[0].year >= tl[tl.length - 1].year, "timeline sorted newest-first");
const cat = y2020.sets[0].categories[0];
ok(cat.finalists[0].outcome === "winner", "winner sorts first in category");

// 2. Stats: DNF excluded from read; winners counted.
const novelWinner = ALL_FINALISTS.find(
  (f) => f.category === "novel" && f.outcome === "winner",
)!;
const novelFinalist = ALL_FINALISTS.find(
  (f) => f.category === "novel" && f.outcome === "finalist",
)!;
const anyDnf = ALL_FINALISTS[10];
const anyWant = ALL_FINALISTS[20];
const recs: ReadingRecords = {
  [novelWinner.id]: { status: "loved" },
  [novelFinalist.id]: { status: "disliked" },
  [anyDnf.id]: { status: "dnf" },
  [anyWant.id]: { status: "want" },
};
const stats = computeStats(ALL_FINALISTS, recs);
ok(stats.readFinalists === 2, `read excludes DNF/want (got ${stats.readFinalists})`);
ok(stats.readWinners === 1, `winners read = 1 (got ${stats.readWinners})`);
ok(stats.wantToRead === 1, `want-to-read counted (got ${stats.wantToRead})`);

// 3. CSV round-trip: export -> import returns identical records.
const csv = exportCsv(ALL_FINALISTS, recs);
const back = importCsv(csv, ALL_FINALISTS);
ok(back.imported === 4, `imported 4 (got ${back.imported})`);
ok(
  JSON.stringify(back.records) === JSON.stringify(recs),
  "round-trip preserves records",
);

// 4. CSV import skips unknown ids, and accepts a legacy "verdict" header.
const bad = `id,verdict\nnot-a-real-id,loved\n${novelWinner.id},liked\n`;
const r2 = importCsv(bad, ALL_FINALISTS);
ok(r2.imported === 1 && r2.skipped === 1, `legacy header + skip (imp ${r2.imported})`);

// 5. Search predicate: author substring, case-insensitive.
const hits = ALL_FINALISTS.filter((f) =>
  f.authors.some((a) => a.toLowerCase().includes("jemisin")),
);
ok(hits.length >= 3, `author search finds Jemisin works (${hits.length})`);

// 6. Enrichment landed and is well-formed.
const genred = ALL_FINALISTS.filter((f) => f.genres && f.genres.length > 0);
ok(genred.length > 1000, `genres present on ${genred.length} works`);
ok(
  genred.every((f) => f.genres!.every((g) => typeof g === "string" && g.length > 0)),
  "all genre values are non-empty strings",
);
// Most-specific-first: a work tagged both should not lead with the umbrella.
const spaceOpera = ALL_FINALISTS.find(
  (f) => f.genres?.includes("space opera") && f.genres.includes("science fiction"),
);
ok(spaceOpera?.genres?.[0] === "space opera", "specific genre sorts before generic");
const described = ALL_FINALISTS.filter((f) => f.description);
ok(described.length > 0 && described.length < 200, `descriptions sparse (${described.length})`);
// A kept description must add something beyond "<year> <form> by <the author
// already shown on the row>". Ones naming a different name (a pen name, or a
// co-author the ballot omits) are informative and allowed.
const emptyDesc = described.filter((f) => {
  const d = f.description!.toLowerCase();
  const m = d.match(/^\d{0,4}\s*(science fiction |fantasy |horror )?(novel|novella|novelette|short story|shortfiction)\s+by\s+(.+)$/);
  if (!m) return false;
  const credited = m[3].replace(/[^a-z\s]/g, " ").split(/\s+/).filter((t) => t.length > 2);
  const ballot = new Set(
    f.authors.flatMap((a) => a.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/)),
  );
  return credited.length > 0 && credited.every((t) => ballot.has(t));
});
ok(emptyDesc.length === 0, `descriptions restating the row: ${emptyDesc.length}`);

// 7. Genre facets: frequency-sorted, includes a (no genre) bucket.
const facets = genreFacets(ALL_FINALISTS);
ok(facets.length > 50, `genre facets built (${facets.length})`);
ok(
  facets.slice(0, -1).every((f, i, a) => i === 0 || a[i - 1].count >= f.count),
  "facets are frequency-sorted",
);
const noneFacet = facets.find((f) => f.genre === NO_GENRE);
ok(!!noneFacet && noneFacet.count > 0, `(no genre) facet present (${noneFacet?.count})`);

// 8. Genre filter: OR semantics; empty set matches everything.
ok(matchesGenre(["space opera"], new Set()), "empty genre filter matches all");
ok(matchesGenre(["space opera", "science fiction"], new Set(["space opera"])), "OR match hits");
ok(!matchesGenre(["fantasy"], new Set(["cyberpunk"])), "non-matching genre excluded");
ok(matchesGenre(undefined, new Set([NO_GENRE])), "(no genre) matches ungenred work");
ok(!matchesGenre(undefined, new Set(["fantasy"])), "ungenred work excluded by real genre");

// 9. Triage queue: Undecided default, newest-first ordering.
const triageFilters = defaultFilters();
triageFilters.statuses = new Set(["undecided"]);
const someId = ALL_FINALISTS[0].id;
const withOne: ReadingRecords = { [someId]: { status: "want" } };
const queue = applyFilters(ALL_FINALISTS, triageFilters, withOne);
ok(
  queue.length === ALL_FINALISTS.length - 1,
  `undecided-only queue drops decided works (${queue.length})`,
);
ok(!queue.some((f) => f.id === someId), "categorized work leaves the queue");
const sorted = [...queue].sort(
  (a, b) => b.ceremonyYear - a.ceremonyYear || a.targetYear - b.targetYear,
);
ok(
  sorted[0].ceremonyYear >= sorted[sorted.length - 1].ceremonyYear,
  "triage queue is newest-first",
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
