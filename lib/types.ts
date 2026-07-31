// Domain types for the Hugo Reading Tracker.
// See CONTEXT.md for the canonical glossary.

export type Category = "novel" | "novella" | "novelette" | "short-story";

export const CATEGORIES: Category[] = [
  "novel",
  "novella",
  "novelette",
  "short-story",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  novel: "Best Novel",
  novella: "Best Novella",
  novelette: "Best Novelette",
  "short-story": "Best Short Story",
};

export type Outcome = "winner" | "finalist";

/**
 * A single finalist work in one category of one award set. This is immutable
 * reference data (the committed seed) — the user never edits it.
 */
export interface Finalist {
  id: string; // stable slug, unique across the dataset
  category: Category;
  ceremonyYear: number; // the Worldcon year the award was presented (timeline node)
  targetYear: number; // eligibility year; == ceremonyYear for regular Hugos
  isRetro: boolean;
  title: string;
  authors: string[];
  outcome: Outcome; // "winner" may occur more than once per category (ties)
}

/**
 * The user's ordinal opinion on a work. Absence of a record == Unread.
 * "reading" (Currently reading) and "dnf" do NOT count as read.
 */
export type Verdict = "loved" | "liked" | "disliked" | "dnf" | "reading";

export const VERDICTS: Verdict[] = [
  "loved",
  "liked",
  "disliked",
  "dnf",
  "reading",
];

export const VERDICT_LABELS: Record<Verdict, string> = {
  loved: "Loved",
  liked: "Liked",
  disliked: "Didn't like",
  dnf: "DNF",
  reading: "Currently reading",
};

/** Verdicts that count as "read" (finished) for stats and filters. */
export const READ_VERDICTS: Verdict[] = ["loved", "liked", "disliked"];

export function isRead(verdict: Verdict | undefined): boolean {
  return verdict !== undefined && READ_VERDICTS.includes(verdict);
}

/** The user's per-work data. Stored in localStorage, keyed by Finalist.id. */
export interface ReadingRecord {
  verdict: Verdict;
  dateRead?: string; // ISO date (YYYY-MM-DD), optional
}

export type ReadingRecords = Record<string, ReadingRecord>;
