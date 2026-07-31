"use client";

import { useMemo, useState } from "react";
import { ALL_FINALISTS, buildTimeline } from "@/lib/data";
import { useReadingRecords } from "@/lib/storage";
import {
  defaultFilters,
  FilterBar,
  type Filters,
  filtersActive,
} from "./FilterBar";
import { ImportExportButtons } from "./ImportExportButtons";
import { YearSection } from "./YearSection";

export function Timeline() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const { records } = useReadingRecords();

  const active = filtersActive(filters);

  const timeline = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const filtered = ALL_FINALISTS.filter((f) => {
      if (!filters.categories.has(f.category)) return false;
      if (filters.winnersOnly && f.outcome !== "winner") return false;
      if (
        q &&
        !f.title.toLowerCase().includes(q) &&
        !f.authors.some((a) => a.toLowerCase().includes(q))
      ) {
        return false;
      }
      const state = records[f.id]?.verdict ?? "unread";
      if (!filters.verdicts.has(state)) return false;
      return true;
    });
    return buildTimeline(filtered);
  }, [filters, records]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {timeline.length} ceremony year{timeline.length === 1 ? "" : "s"} shown
        </p>
        <ImportExportButtons />
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {timeline.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-500 dark:border-stone-700">
          No finalists match these filters.
        </p>
      ) : (
        <div className="space-y-3">
          {timeline.map((ceremony, i) => (
            // Remount on filter-activity change so sections auto-open when
            // filtering/searching and collapse back to newest-only otherwise.
            <YearSection
              key={`${ceremony.year}-${active}`}
              ceremony={ceremony}
              defaultOpen={active || i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
