/**
 * Scrape Hugo Award finalists (all four written-fiction categories, all years)
 * from Wikipedia and write data/hugos.json.
 *
 * Re-runnable. Source of truth is Wikipedia's per-category tables, which list
 * winners and finalists year-by-year. Retro Hugos are detected by year (their
 * eligibility years never had regular Hugos) and filed under the ceremony year
 * they were actually awarded — see CONTEXT.md and docs/adr/0001.
 *
 * Usage: npm run scrape
 */
import * as cheerio from "cheerio";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Category, Finalist, Outcome } from "../lib/types";

const PAGES: Record<Category, string> = {
  novel: "Hugo_Award_for_Best_Novel",
  novella: "Hugo_Award_for_Best_Novella",
  novelette: "Hugo_Award_for_Best_Novelette",
  "short-story": "Hugo_Award_for_Best_Short_Story",
};

// Retro Hugo eligibility year -> the ceremony year it was actually awarded.
// These eligibility years never had a regular Hugo, so any table row with one
// of these years is unambiguously a Retro Hugo.
const RETRO_CEREMONY: Record<number, number> = {
  1939: 2014,
  1941: 2016,
  1943: 2018,
  1944: 2019,
  1945: 2020,
  1946: 1996,
  1951: 2001,
  1954: 2004,
};

async function fetchPageHtml(page: string): Promise<string> {
  const url =
    `https://en.wikipedia.org/w/api.php?action=parse&page=${page}` +
    `&prop=text&format=json&formatversion=2`;
  const res = await fetch(url, {
    headers: { "User-Agent": "hugo-reading-tracker/0.1 (personal project)" },
  });
  if (!res.ok) throw new Error(`Fetch ${page} failed: ${res.status}`);
  const json = (await res.json()) as { parse: { text: string } };
  return json.parse.text;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Clean a title/author cell: drop refs, trailing winner/footnote markers, quotes. */
function cleanText(raw: string): string {
  let s = raw
    .replace(/\[[^\]]*\]/g, "") // [11] style refs
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[*†‡]+$/g, "")
    .trim();
  // Strip a *balanced* wrapping pair of double quotes (Wikipedia wraps short
  // fiction titles in quotes). Leave unbalanced quotes alone so titles like
  // `"Repent, Harlequin!" Said the Ticktockman` or `Shadow Over Mars" (...)`
  // keep their meaningful quotation marks.
  const isDq = (c: string) => c === '"' || c === "“" || c === "”";
  if (s.length >= 2 && isDq(s[0]) && isDq(s[s.length - 1])) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function extractAuthors($: cheerio.CheerioAPI, td: cheerio.Cheerio<any>): string[] {
  const names: string[] = [];
  td.find(".fn").each((_, el) => {
    const t = cleanText($(el).text());
    if (t) names.push(t);
  });
  if (names.length === 0) {
    const t = cleanText(td.text());
    if (t && t.toLowerCase() !== "no award") names.push(t);
  }
  return names;
}

function parseCategory(
  category: Category,
  html: string,
): Finalist[] {
  const $ = cheerio.load(html);
  const out: Finalist[] = [];
  const seenIds = new Set<string>();

  // Pick every wikitable whose header row mentions "Year" (the winners/finalists
  // tables). Other tables on the page (records, etc.) are skipped.
  const tables = $("table.wikitable").filter((_, t) => {
    const header = $(t).find("tr").first().text().toLowerCase();
    return header.includes("year") && header.includes("author");
  });

  tables.each((_, table) => {
    let currentYear: number | null = null;

    $(table)
      .find("tr")
      .each((_, tr) => {
        const row = $(tr);

        // Year is carried by a <th scope=row|rowgroup> with a 4-digit number.
        const yearTh = row.find("th").filter((_, th) => /\b(1[89]\d\d|20\d\d)\b/.test($(th).text()));
        if (yearTh.length > 0) {
          const m = yearTh.first().text().match(/\b(1[89]\d\d|20\d\d)\b/);
          if (m) currentYear = parseInt(m[1], 10);
        }
        if (currentYear == null) return; // header / pre-table rows

        const tds = row.find("> td");
        if (tds.length < 2) return; // not a data row

        const authorTd = tds.eq(0);
        const titleTd = tds.eq(1);

        const title = cleanText(titleTd.text());
        if (!title || title.toLowerCase() === "no award") return; // outcome note, not a work

        const authors = extractAuthors($, authorTd);

        // Winner marker: a trailing "*" on the author cell (per page legend),
        // or a highlighted (lightyellow) row background.
        const authorRaw = authorTd.text().trim();
        const rowStyle = (row.attr("style") || "").toLowerCase();
        const outcome: Outcome =
          /\*\s*$/.test(authorRaw) || rowStyle.includes("lightyellow")
            ? "winner"
            : "finalist";

        const year = currentYear;
        const isRetro = year in RETRO_CEREMONY;
        const ceremonyYear = isRetro ? RETRO_CEREMONY[year] : year;
        const targetYear = year;

        // Build a stable, unique id.
        let base = `${ceremonyYear}${isRetro ? `-retro${targetYear}` : ""}-${category}-${slugify(
          title,
        )}`;
        let id = base;
        let n = 2;
        while (seenIds.has(id)) id = `${base}-${n++}`;
        seenIds.add(id);

        out.push({
          id,
          category,
          ceremonyYear,
          targetYear,
          isRetro,
          title,
          authors,
          outcome,
        });
      });
  });

  return out;
}

async function main() {
  const all: Finalist[] = [];
  for (const category of Object.keys(PAGES) as Category[]) {
    process.stdout.write(`Fetching ${category}... `);
    const html = await fetchPageHtml(PAGES[category]);
    const rows = parseCategory(category, html);
    console.log(`${rows.length} finalists`);
    all.push(...rows);
  }

  // Stable sort: ceremony year desc, retro after regular, category, winners first.
  const catOrder: Record<Category, number> = {
    novel: 0,
    novella: 1,
    novelette: 2,
    "short-story": 3,
  };
  all.sort((a, b) => {
    if (a.ceremonyYear !== b.ceremonyYear) return b.ceremonyYear - a.ceremonyYear;
    if (a.isRetro !== b.isRetro) return a.isRetro ? 1 : -1;
    if (a.targetYear !== b.targetYear) return a.targetYear - b.targetYear;
    if (catOrder[a.category] !== catOrder[b.category])
      return catOrder[a.category] - catOrder[b.category];
    if (a.outcome !== b.outcome) return a.outcome === "winner" ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  const dir = join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "hugos.json"), JSON.stringify(all, null, 2) + "\n");

  const winners = all.filter((f) => f.outcome === "winner").length;
  const retro = all.filter((f) => f.isRetro).length;
  console.log(
    `\nWrote ${all.length} finalists (${winners} winners, ${retro} retro) to data/hugos.json`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
