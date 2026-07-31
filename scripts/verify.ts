import { ALL_FINALISTS, buildTimeline } from "@/lib/data";
import { exportCsv, importCsv } from "@/lib/csv";
import { computeStats } from "@/lib/stats";
import type { ReadingRecords } from "@/lib/types";

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
const recs: ReadingRecords = {
  [novelWinner.id]: { verdict: "loved" },
  [novelFinalist.id]: { verdict: "disliked" },
  [anyDnf.id]: { verdict: "dnf" },
};
const stats = computeStats(ALL_FINALISTS, recs);
ok(stats.readFinalists === 2, `read excludes DNF (got ${stats.readFinalists})`);
ok(stats.readWinners === 1, `winners read = 1 (got ${stats.readWinners})`);

// 3. CSV round-trip: export -> import returns identical records.
const csv = exportCsv(ALL_FINALISTS, recs);
const back = importCsv(csv, ALL_FINALISTS);
ok(back.imported === 3, `imported 3 (got ${back.imported})`);
ok(
  JSON.stringify(back.records) === JSON.stringify(recs),
  "round-trip preserves records",
);

// 4. CSV import skips unknown ids.
const bad = `id,verdict\nnot-a-real-id,loved\n${novelWinner.id},liked\n`;
const r2 = importCsv(bad, ALL_FINALISTS);
ok(r2.imported === 1 && r2.skipped === 1, `unknown skipped (imp ${r2.imported})`);

// 5. Search predicate: author substring, case-insensitive.
const hits = ALL_FINALISTS.filter((f) =>
  f.authors.some((a) => a.toLowerCase().includes("jemisin")),
);
ok(hits.length >= 3, `author search finds Jemisin works (${hits.length})`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
