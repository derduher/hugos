"use client";

import { NO_GENRE } from "@/lib/data";
import {
  type Category,
  CATEGORIES,
  CATEGORY_LABELS,
  type Finalist,
  type ReadingRecords,
  type Status,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/types";
import { GenreSelect } from "./GenreSelect";

export type StatusFilter = Status | "undecided";
export const STATUS_FILTERS: StatusFilter[] = [...STATUSES, "undecided"];
const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  ...STATUS_LABELS,
  undecided: "Undecided",
};

export interface Filters {
  query: string;
  categories: Set<Category>;
  winnersOnly: boolean;
  statuses: Set<StatusFilter>;
  /** Empty = no genre constraint. Otherwise OR: match ANY selected genre. */
  genres: Set<string>;
}

export function defaultFilters(): Filters {
  return {
    query: "",
    categories: new Set(CATEGORIES),
    winnersOnly: false,
    statuses: new Set(STATUS_FILTERS),
    genres: new Set(),
  };
}

export function filtersActive(f: Filters): boolean {
  return (
    f.query.trim() !== "" ||
    f.winnersOnly ||
    f.categories.size !== CATEGORIES.length ||
    f.statuses.size !== STATUS_FILTERS.length ||
    f.genres.size > 0
  );
}

/** Does a finalist pass the genre constraint? OR semantics; empty = pass. */
export function matchesGenre(
  finalistGenres: string[] | undefined,
  selected: Set<string>,
): boolean {
  if (selected.size === 0) return true;
  const has = finalistGenres && finalistGenres.length > 0;
  if (!has) return selected.has(NO_GENRE);
  return finalistGenres!.some((g) => selected.has(g));
}

/**
 * The single filter predicate, shared by the Timeline and Triage so both views
 * always agree on what a given filter set means.
 */
export function applyFilters(
  finalists: Finalist[],
  filters: Filters,
  records: ReadingRecords,
): Finalist[] {
  const q = filters.query.trim().toLowerCase();
  return finalists.filter((f) => {
    if (!filters.categories.has(f.category)) return false;
    if (filters.winnersOnly && f.outcome !== "winner") return false;
    if (!matchesGenre(f.genres, filters.genres)) return false;
    if (
      q &&
      !f.title.toLowerCase().includes(q) &&
      !f.authors.some((a) => a.toLowerCase().includes(q)) &&
      !(f.genres ?? []).some((g) => g.toLowerCase().includes(q))
    ) {
      return false;
    }
    const state = records[f.id]?.status ?? "undecided";
    return filters.statuses.has(state);
  });
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors " +
        (active
          ? "border-stone-800 bg-stone-800 text-white dark:border-stone-200 dark:bg-stone-200 dark:text-stone-900"
          : "border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800")
      }
    >
      {label}
    </button>
  );
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white/60 p-4 dark:border-stone-800 dark:bg-stone-900/30">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={filters.query}
          placeholder="Search title or author…"
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="flex-1 min-w-[12rem] rounded-lg border border-stone-300 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700"
        />
        <GenreSelect
          selected={filters.genres}
          onChange={(genres) => onChange({ ...filters, genres })}
        />
        <label className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400">
          <input
            type="checkbox"
            checked={filters.winnersOnly}
            onChange={(e) => onChange({ ...filters, winnersOnly: e.target.checked })}
          />
          🏆 Winners only
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold uppercase text-stone-400">
          Category
        </span>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={CATEGORY_LABELS[c]}
            active={filters.categories.has(c)}
            onClick={() =>
              onChange({ ...filters, categories: toggle(filters.categories, c) })
            }
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold uppercase text-stone-400">
          Status
        </span>
        {STATUS_FILTERS.map((s) => (
          <Chip
            key={s}
            label={STATUS_FILTER_LABELS[s]}
            active={filters.statuses.has(s)}
            onClick={() =>
              onChange({ ...filters, statuses: toggle(filters.statuses, s) })
            }
          />
        ))}
      </div>
    </div>
  );
}
