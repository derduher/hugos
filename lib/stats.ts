// Pure progress/stat helpers. "Read" excludes DNF and Currently-reading.

import {
  type Category,
  CATEGORIES,
  type Finalist,
  isRead,
  type ReadingRecords,
} from "./types";

export interface CategoryStat {
  category: Category;
  totalFinalists: number;
  readFinalists: number;
  totalWinners: number;
  readWinners: number;
}

export interface OverallStats {
  byCategory: Record<Category, CategoryStat>;
  totalFinalists: number;
  readFinalists: number;
  totalWinners: number;
  readWinners: number;
}

function emptyStat(category: Category): CategoryStat {
  return {
    category,
    totalFinalists: 0,
    readFinalists: 0,
    totalWinners: 0,
    readWinners: 0,
  };
}

export function computeStats(
  finalists: Finalist[],
  records: ReadingRecords,
): OverallStats {
  const byCategory = Object.fromEntries(
    CATEGORIES.map((c) => [c, emptyStat(c)]),
  ) as Record<Category, CategoryStat>;

  for (const f of finalists) {
    const stat = byCategory[f.category];
    const read = isRead(records[f.id]?.verdict);
    stat.totalFinalists++;
    if (read) stat.readFinalists++;
    if (f.outcome === "winner") {
      stat.totalWinners++;
      if (read) stat.readWinners++;
    }
  }

  const overall: OverallStats = {
    byCategory,
    totalFinalists: 0,
    readFinalists: 0,
    totalWinners: 0,
    readWinners: 0,
  };
  for (const c of CATEGORIES) {
    const s = byCategory[c];
    overall.totalFinalists += s.totalFinalists;
    overall.readFinalists += s.readFinalists;
    overall.totalWinners += s.totalWinners;
    overall.readWinners += s.readWinners;
  }
  return overall;
}

export function pct(read: number, total: number): number {
  return total === 0 ? 0 : Math.round((read / total) * 100);
}
