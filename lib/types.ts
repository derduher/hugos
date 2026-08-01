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
  // Enrichment from Wikidata (see scripts/enrich-hugos.ts). Both are sparse:
  // genres land on ~73% of works, description on far fewer (formulaic ones
  // that merely restate year/form/author are dropped).
  genres?: string[]; // most-specific first
  description?: string;
}

/**
 * The user's ordinal opinion on a work. Absence of a record == Unread.
 * "reading" (Currently reading) and "dnf" do NOT count as read.
 */
export type Status =
  | "want" // Want to read (intent)
  | "skip" // Not interested (intent)
  | "reading" // Currently reading
  | "loved"
  | "liked"
  | "disliked"
  | "dnf";

// Order matters: intent group first, then verdict group. The UI draws a divider
// between the two groups (after "skip").
export const STATUSES: Status[] = [
  "want",
  "skip",
  "reading",
  "loved",
  "liked",
  "disliked",
  "dnf",
];

/** Index where the verdict group begins (used to place the UI divider). */
export const VERDICT_GROUP_START = 2;

export const STATUS_LABELS: Record<Status, string> = {
  want: "Want to read",
  skip: "Not interested",
  reading: "Currently reading",
  loved: "Loved",
  liked: "Liked",
  disliked: "Didn't like",
  dnf: "DNF",
};

/** Statuses that count as "read" (finished) for stats and filters. */
export const READ_STATUSES: Status[] = ["loved", "liked", "disliked"];

export function isRead(status: Status | undefined): boolean {
  return status !== undefined && READ_STATUSES.includes(status);
}

/** The user's per-work data. Stored in localStorage, keyed by Finalist.id. */
export interface ReadingRecord {
  status: Status;
  dateRead?: string; // ISO date (YYYY-MM-DD), optional
}

export type ReadingRecords = Record<string, ReadingRecord>;
