"use client";

import {
  type Category,
  CATEGORIES,
  CATEGORY_LABELS,
  type Verdict,
  VERDICTS,
  VERDICT_LABELS,
} from "@/lib/types";

export type VerdictFilter = Verdict | "unread";
export const VERDICT_FILTERS: VerdictFilter[] = [...VERDICTS, "unread"];
const VERDICT_FILTER_LABELS: Record<VerdictFilter, string> = {
  ...VERDICT_LABELS,
  unread: "Unread",
};

export interface Filters {
  query: string;
  categories: Set<Category>;
  winnersOnly: boolean;
  verdicts: Set<VerdictFilter>;
}

export function defaultFilters(): Filters {
  return {
    query: "",
    categories: new Set(CATEGORIES),
    winnersOnly: false,
    verdicts: new Set(VERDICT_FILTERS),
  };
}

export function filtersActive(f: Filters): boolean {
  return (
    f.query.trim() !== "" ||
    f.winnersOnly ||
    f.categories.size !== CATEGORIES.length ||
    f.verdicts.size !== VERDICT_FILTERS.length
  );
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
          Verdict
        </span>
        {VERDICT_FILTERS.map((v) => (
          <Chip
            key={v}
            label={VERDICT_FILTER_LABELS[v]}
            active={filters.verdicts.has(v)}
            onClick={() =>
              onChange({ ...filters, verdicts: toggle(filters.verdicts, v) })
            }
          />
        ))}
      </div>
    </div>
  );
}
