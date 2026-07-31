"use client";

import { useReadingRecords } from "@/lib/storage";
import { isRead, type Verdict } from "@/lib/types";

// Ordinal verdicts (best -> worst) with compact pill labels + colors.
const PILLS: { verdict: Verdict; short: string; full: string; active: string }[] = [
  { verdict: "loved", short: "Loved", full: "Loved", active: "bg-loved text-white border-loved" },
  { verdict: "liked", short: "Liked", full: "Liked", active: "bg-liked text-white border-liked" },
  { verdict: "disliked", short: "Disliked", full: "Didn't like", active: "bg-disliked text-white border-disliked" },
  { verdict: "dnf", short: "DNF", full: "Did not finish", active: "bg-dnf text-white border-dnf" },
  { verdict: "reading", short: "Reading", full: "Currently reading", active: "bg-reading text-white border-reading" },
];

export function VerdictPicker({ finalistId }: { finalistId: string }) {
  const { records, hydrated, setVerdict, setDateRead } = useReadingRecords();
  const record = records[finalistId];
  const current = record?.verdict;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {PILLS.map((p) => {
        const selected = current === p.verdict;
        return (
          <button
            key={p.verdict}
            type="button"
            title={p.full}
            aria-pressed={selected}
            disabled={!hydrated}
            onClick={() => setVerdict(finalistId, selected ? null : p.verdict)}
            className={
              "rounded-full border px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-40 " +
              (selected
                ? p.active
                : "border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800")
            }
          >
            {p.short}
          </button>
        );
      })}

      {isRead(current) && (
        <input
          type="date"
          aria-label="Date read"
          value={record?.dateRead ?? ""}
          onChange={(e) => setDateRead(finalistId, e.target.value)}
          className="ml-1 rounded border border-stone-300 bg-transparent px-1.5 py-0.5 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-400"
        />
      )}
    </div>
  );
}
