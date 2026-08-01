"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { genreFacets, NO_GENRE } from "@/lib/data";

/**
 * Compact multi-select for the ~89 genre values. Kept as a popover rather than
 * a chip row so the filter bar stays the same size; frequency-sorted with
 * counts, with a type-to-narrow box for the long tail.
 */
export function GenreSelect({
  selected,
  onChange,
}: {
  selected: Set<string>; // empty = no genre constraint
  onChange: (next: Set<string>) => void;
}) {
  const facets = useMemo(() => genreFacets(), []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return facets;
    return facets.filter(
      (f) =>
        f.genre.toLowerCase().includes(q) ||
        (f.genre === NO_GENRE && "no genre".includes(q)),
    );
  }, [facets, query]);

  const toggle = (genre: string) => {
    const next = new Set(selected);
    if (next.has(genre)) next.delete(genre);
    else next.add(genre);
    onChange(next);
  };

  const label =
    selected.size === 0
      ? "Any genre"
      : selected.size === 1
        ? genreLabel([...selected][0])
        : `${selected.size} genres`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={
          "rounded-lg border px-3 py-1.5 text-sm transition-colors " +
          (selected.size > 0
            ? "border-stone-800 bg-stone-800 text-white dark:border-stone-200 dark:bg-stone-200 dark:text-stone-900"
            : "border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800")
        }
      >
        {label} ▾
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-1 w-72 rounded-lg border border-stone-200 bg-white p-2 shadow-lg dark:border-stone-700 dark:bg-stone-900">
          <div className="mb-2 flex items-center gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter genres…"
              className="w-full rounded border border-stone-300 bg-transparent px-2 py-1 text-xs outline-none focus:border-stone-500 dark:border-stone-700"
            />
            {selected.size > 0 && (
              <button
                type="button"
                onClick={() => onChange(new Set())}
                className="shrink-0 text-xs text-stone-500 underline hover:text-stone-800 dark:hover:text-stone-200"
              >
                Clear
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {shown.map((f) => (
              <li key={f.genre}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-stone-100 dark:hover:bg-stone-800">
                  <input
                    type="checkbox"
                    checked={selected.has(f.genre)}
                    onChange={() => toggle(f.genre)}
                  />
                  <span className="flex-1 truncate">{genreLabel(f.genre)}</span>
                  <span className="tabular-nums text-stone-400">{f.count}</span>
                </label>
              </li>
            ))}
            {shown.length === 0 && (
              <li className="px-1.5 py-2 text-xs text-stone-400">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function genreLabel(genre: string): string {
  return genre === NO_GENRE ? "(no genre)" : genre;
}
