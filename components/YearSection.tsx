"use client";

import { useMemo, useState } from "react";
import type { CeremonyYear } from "@/lib/data";
import { useReadingRecords } from "@/lib/storage";
import { isRead } from "@/lib/types";
import { AwardSetGroup } from "./AwardSetGroup";
import { ProgressBar } from "./ProgressBar";

export function YearSection({
  ceremony,
  defaultOpen = false,
}: {
  ceremony: CeremonyYear;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { records } = useReadingRecords();

  const { total, read, hasRetro } = useMemo(() => {
    let total = 0;
    let read = 0;
    let hasRetro = false;
    for (const set of ceremony.sets) {
      if (set.isRetro) hasRetro = true;
      for (const group of set.categories) {
        for (const f of group.finalists) {
          total++;
          if (isRead(records[f.id]?.status)) read++;
        }
      }
    }
    return { total, read, hasRetro };
  }, [ceremony, records]);

  return (
    <section className="rounded-xl border border-stone-200 bg-white/60 dark:border-stone-800 dark:bg-stone-900/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-4 py-3 text-left"
      >
        <span className="text-stone-400" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
        <span className="flex items-baseline gap-2">
          <span className="text-lg font-bold tabular-nums">{ceremony.year}</span>
          {hasRetro && (
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              + Retro
            </span>
          )}
        </span>
        <ProgressBar read={read} total={total} className="max-w-xs flex-1" />
      </button>

      {open && (
        <div className="space-y-6 border-t border-stone-200 px-4 py-4 dark:border-stone-800">
          {ceremony.sets.map((set) => (
            <AwardSetGroup key={set.key} set={set} />
          ))}
        </div>
      )}
    </section>
  );
}
