// Shapes the flat seed (data/hugos.json) into the ceremony-year timeline:
//   ceremony year -> award set(s) (regular + retro) -> category groups -> finalists.

import rawData from "@/data/hugos.json";
import { type Category, CATEGORIES, type Finalist } from "./types";

export const ALL_FINALISTS = rawData as Finalist[];

/** Sentinel used by the genre filter for works with no genre data. */
export const NO_GENRE = "__none__";

/**
 * All genre values present in the seed, most frequent first, with counts.
 * Frequency-sorted so the useful facets ("science fiction", "fantasy") lead
 * and the ~50 single-work values remain reachable at the bottom.
 */
export function genreFacets(
  finalists: Finalist[] = ALL_FINALISTS,
): { genre: string; count: number }[] {
  const counts = new Map<string, number>();
  let none = 0;
  for (const f of finalists) {
    if (!f.genres || f.genres.length === 0) {
      none++;
      continue;
    }
    for (const g of f.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  const list = [...counts.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));
  if (none > 0) list.push({ genre: NO_GENRE, count: none });
  return list;
}

export interface CategoryGroup {
  category: Category;
  finalists: Finalist[]; // winners first
}

export interface AwardSet {
  key: string; // unique within its ceremony year
  isRetro: boolean;
  targetYear: number;
  categories: CategoryGroup[];
}

export interface CeremonyYear {
  year: number;
  sets: AwardSet[]; // regular set first, then retro sets
}

function sortFinalists(a: Finalist, b: Finalist): number {
  if (a.outcome !== b.outcome) return a.outcome === "winner" ? -1 : 1;
  return a.title.localeCompare(b.title);
}

export function buildTimeline(finalists: Finalist[]): CeremonyYear[] {
  // year -> targetYear(setKey) -> category -> finalists
  const years = new Map<number, Map<number, Finalist[]>>();
  for (const f of finalists) {
    let sets = years.get(f.ceremonyYear);
    if (!sets) years.set(f.ceremonyYear, (sets = new Map()));
    let arr = sets.get(f.targetYear);
    if (!arr) sets.set(f.targetYear, (arr = []));
    arr.push(f);
  }

  const result: CeremonyYear[] = [];
  for (const [year, sets] of years) {
    const awardSets: AwardSet[] = [];
    for (const [targetYear, items] of sets) {
      const isRetro = items[0].isRetro;
      const categories: CategoryGroup[] = [];
      for (const category of CATEGORIES) {
        const catItems = items
          .filter((f) => f.category === category)
          .sort(sortFinalists);
        if (catItems.length > 0) {
          categories.push({ category, finalists: catItems });
        }
      }
      awardSets.push({
        key: `${year}-${targetYear}`,
        isRetro,
        targetYear,
        categories,
      });
    }
    // Regular set (isRetro false) first, then retro sets by target year.
    awardSets.sort((a, b) => {
      if (a.isRetro !== b.isRetro) return a.isRetro ? 1 : -1;
      return a.targetYear - b.targetYear;
    });
    result.push({ year, sets: awardSets });
  }

  result.sort((a, b) => b.year - a.year); // newest first
  return result;
}
