/**
 * Enrich data/hugos.json with genre (and a sparse description) from Wikidata.
 *
 * Wikidata is used because it is *award-linked*: we query works tagged as Hugo
 * nominees/winners, so matching happens inside a pre-filtered pool rather than
 * against every book ever published. That is why short fiction — 74% of this
 * dataset — matches as well as novels here, and does not in book-oriented
 * catalogs. See docs/adr/0003.
 *
 * Idempotent: reads data/hugos.json, rewrites it with genres/description.
 * Run after `npm run scrape`.
 *
 * Usage: npm run enrich
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Finalist } from "../lib/types";

// Wikidata items for the four written-fiction Hugo categories.
const AWARD_ITEMS = ["Q255032", "Q549884", "Q1056265", "Q1056251"];

const ENDPOINT = "https://query.wikidata.org/sparql";

interface WdRow {
  wLabel: { value: string };
  authors?: { value: string };
  genres?: { value: string };
  desc?: { value: string };
}

async function fetchWikidata(): Promise<WdRow[]> {
  const values = AWARD_ITEMS.map((q) => `wd:${q}`).join(" ");
  const sparql = `
SELECT ?w ?wLabel ?desc
       (GROUP_CONCAT(DISTINCT ?gLabel;separator="; ") AS ?genres)
       (GROUP_CONCAT(DISTINCT ?aLabel;separator="; ") AS ?authors) WHERE {
  VALUES ?award { ${values} }
  { ?w p:P1411 ?s1 . ?s1 ps:P1411 ?award . } UNION { ?w p:P166 ?s2 . ?s2 ps:P166 ?award . }
  OPTIONAL { ?w wdt:P136 ?g . ?g rdfs:label ?gLabel . FILTER(LANG(?gLabel)="en") }
  OPTIONAL { ?w wdt:P50 ?a . ?a rdfs:label ?aLabel . FILTER(LANG(?aLabel)="en") }
  OPTIONAL { ?w schema:description ?desc . FILTER(LANG(?desc)="en") }
  ?w rdfs:label ?wLabel . FILTER(LANG(?wLabel)="en")
} GROUP BY ?w ?wLabel ?desc`;

  const res = await fetch(`${ENDPOINT}?format=json&query=${encodeURIComponent(sparql)}`, {
    headers: {
      "User-Agent": "hugo-reading-tracker/0.1 (personal project)",
      Accept: "application/sparql-results+json",
    },
  });
  if (!res.ok) throw new Error(`Wikidata query failed: ${res.status}`);
  const json = (await res.json()) as { results: { bindings: WdRow[] } };
  return json.results.bindings;
}

/** Normalize a title for matching: strip case, accents, and punctuation. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Words that carry no information beyond what the row already shows.
const FORM_WORDS = new Set([
  "novel", "novella", "novelette", "novelet", "story", "shortstory",
  "shortfiction", "short", "fiction", "book", "novellette", "work", "series",
  "collection", "anthology", "tale",
]);
const GENERIC_GENRE_WORDS = new Set([
  "science", "sciencefiction", "scifi", "sf", "fantasy", "speculative",
  "horror", "fantastique",
]);
const STOPWORDS = new Set([
  "by", "the", "a", "an", "of", "and", "as", "written", "c", "author",
  "writer", "american", "british", "canadian", "english", "australian",
  "irish", "scottish", "chinese", "japanese", "translated", "pen", "name",
  "aka", "also", "known", "published", "first",
]);

/** Split a string into normalized tokens on the same delimiters everywhere. */
function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[\s,;:./()[\]'’"–—-]+/)
    .map((t) => norm(t))
    .filter(Boolean);
}

/**
 * A description is "formulaic" when, after removing the year, form words,
 * generic genre words, stopwords and the author's own name, nothing
 * substantive remains — e.g. "2024 novel by Robert Jackson Bennett" or
 * "novel by Mary Robinette Kowal". Those duplicate the row and are dropped.
 */
function isFormulaic(desc: string, authors: string[]): boolean {
  // Tokenize author names with the SAME delimiters as the description, so
  // hyphenated surnames ("Moreno-Garcia") and initials line up on both sides.
  const authorTokens = new Set(authors.flatMap(tokenize));
  const tokens = tokenize(desc);

  const meaningful = tokens.filter((t) => {
    if (/^\d{1,4}$/.test(t)) return false; // years / numbers
    if (FORM_WORDS.has(t)) return false;
    if (GENERIC_GENRE_WORDS.has(t)) return false;
    if (STOPWORDS.has(t)) return false;
    if (authorTokens.has(t)) return false;
    if (t.length <= 2) return false;
    return true;
  });
  return meaningful.length === 0;
}

/** Surname-ish tokens (drop initials) used to compare two author credits. */
function authorTokens(names: string[]): Set<string> {
  return new Set(names.flatMap(tokenize).filter((t) => t.length > 2));
}

/**
 * Choose the Wikidata row that actually describes this finalist.
 *
 * Titles are not unique — two distinct works are both called "Palimpsest" —
 * so when a candidate carries author data we require it to overlap the ballot
 * credit. If no candidate names an author we accept the first (Wikidata author
 * data is patchy and a title match is the best signal available); if
 * candidates DO name authors and none overlap, we reject rather than attach
 * another work's genres.
 */
function pickCandidate(candidates: WdRow[], ballotAuthors: string[]): WdRow | null {
  const ballot = authorTokens(ballotAuthors);

  const agrees = (row: WdRow): boolean => {
    const names = row.authors?.value
      ? row.authors.value.split("; ").filter(Boolean)
      : [];
    if (names.length === 0) return false;
    const theirs = authorTokens(names);
    for (const t of theirs) if (ballot.has(t)) return true;
    return false;
  };

  const match = candidates.find(agrees);
  if (match) return match;

  const anyHasAuthors = candidates.some((c) => !!c.authors?.value);
  if (!anyHasAuthors) return candidates[0]; // unverifiable; title match stands
  if (ballot.size === 0) return candidates[0]; // no ballot credit to check
  return null; // authors known on both sides and they disagree -> wrong work
}

async function main() {
  const path = join(process.cwd(), "data", "hugos.json");
  const finalists = JSON.parse(readFileSync(path, "utf8")) as Finalist[];

  process.stdout.write("Querying Wikidata... ");
  const rows = await fetchWikidata();
  console.log(`${rows.length} works`);

  // A title alone is not a key: distinct works share titles (two different
  // 2009 works are both called "Palimpsest"). Keep every candidate per title
  // and disambiguate by author below.
  const index = new Map<string, WdRow[]>();
  for (const row of rows) {
    const key = norm(row.wLabel.value);
    const list = index.get(key);
    if (list) list.push(row);
    else index.set(key, [row]);
  }

  let matched = 0;
  let rejected = 0;
  let withGenre = 0;
  let withDesc = 0;
  let droppedDesc = 0;

  for (const f of finalists) {
    const candidates = index.get(norm(f.title));
    // Clear any previous enrichment so re-runs are idempotent.
    delete (f as Partial<Finalist>).genres;
    delete (f as Partial<Finalist>).description;
    if (!candidates || candidates.length === 0) continue;

    const hit = pickCandidate(candidates, f.authors);
    if (!hit) {
      rejected++;
      continue;
    }
    matched++;

    if (hit.genres?.value) {
      const genres = hit.genres.value
        .split("; ")
        .map((g) => g.trim())
        .filter(Boolean)
        // Most-specific first: put the broad umbrella genres last.
        .sort((a, b) => {
          const generic = (s: string) =>
            ["science fiction", "fantasy", "speculative fiction"].includes(s.toLowerCase())
              ? 1
              : 0;
          return generic(a) - generic(b) || a.localeCompare(b);
        });
      if (genres.length > 0) {
        f.genres = genres;
        withGenre++;
      }
    }

    const desc = hit.desc?.value?.trim();
    if (desc) {
      if (isFormulaic(desc, f.authors)) droppedDesc++;
      else {
        f.description = desc;
        withDesc++;
      }
    }
  }

  writeFileSync(path, JSON.stringify(finalists, null, 2) + "\n");
  const pct = (n: number) => `${Math.round((n / finalists.length) * 100)}%`;
  console.log(
    `\nMatched ${matched}/${finalists.length} (${pct(matched)})\n` +
      `  genres:      ${withGenre} (${pct(withGenre)})\n` +
      `  description: ${withDesc} (${pct(withDesc)})  [dropped ${droppedDesc} formulaic]\n` +
      `  rejected:    ${rejected} title matches whose author disagreed`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
