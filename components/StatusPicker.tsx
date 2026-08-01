"use client";

import { useReadingRecords } from "@/lib/storage";
import { isRead, type Status, VERDICT_GROUP_START } from "@/lib/types";

// Each status with its compact pill label + active (selected) classes.
// Classes are full static strings so Tailwind keeps them.
const PILLS: { status: Status; short: string; full: string; active: string }[] = [
  { status: "want", short: "Want", full: "Want to read", active: "bg-want text-white border-want" },
  { status: "skip", short: "Skip", full: "Not interested", active: "bg-skip text-white border-skip" },
  { status: "reading", short: "Reading", full: "Currently reading", active: "bg-reading text-white border-reading" },
  { status: "loved", short: "Loved", full: "Loved", active: "bg-loved text-white border-loved" },
  { status: "liked", short: "Liked", full: "Liked", active: "bg-liked text-white border-liked" },
  { status: "disliked", short: "Disliked", full: "Didn't like", active: "bg-disliked text-white border-disliked" },
  { status: "dnf", short: "DNF", full: "Did not finish", active: "bg-dnf text-white border-dnf" },
];

export function StatusPicker({ finalistId }: { finalistId: string }) {
  const { records, hydrated, setStatus, setDateRead } = useReadingRecords();
  const record = records[finalistId];
  const current = record?.status;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {PILLS.map((p, i) => {
        const selected = current === p.status;
        return (
          <span key={p.status} className="flex items-center gap-1">
            {i === VERDICT_GROUP_START && (
              <span
                aria-hidden
                className="mx-0.5 h-4 w-px bg-stone-300 dark:bg-stone-700"
              />
            )}
            <button
              type="button"
              title={p.full}
              aria-pressed={selected}
              disabled={!hydrated}
              onClick={() => setStatus(finalistId, selected ? null : p.status)}
              className={
                "rounded-full border px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-40 " +
                (selected
                  ? p.active
                  : "border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800")
              }
            >
              {p.short}
            </button>
          </span>
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
