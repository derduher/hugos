"use client";

import { useMemo } from "react";
import { ALL_FINALISTS } from "@/lib/data";
import { computeStats, pct } from "@/lib/stats";
import { useReadingRecords } from "@/lib/storage";
import { type Category, CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";

function StatCard({
  label,
  read,
  total,
  sub,
  wantToRead,
}: {
  label: string;
  read: number;
  total: number;
  sub: string;
  wantToRead: number;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white/60 p-4 dark:border-stone-800 dark:bg-stone-900/30">
      <div className="text-sm font-semibold text-stone-500 dark:text-stone-400">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums">{read}</span>
        <span className="text-stone-400">/ {total}</span>
        <span className="ml-auto text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {pct(read, total)}%
        </span>
      </div>
      <ProgressBar read={read} total={total} className="mt-2" />
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
        <span>{sub}</span>
        <span className="rounded bg-violet-100 px-1.5 py-0.5 font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          Want to read: {wantToRead}
        </span>
      </div>
    </div>
  );
}

export function StatsView() {
  const { records, hydrated } = useReadingRecords();
  const stats = useMemo(
    () => computeStats(ALL_FINALISTS, records),
    [records],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your progress</h1>
        <p className="mt-1 text-stone-500 dark:text-stone-400">
          &ldquo;Read&rdquo; counts finished works (Loved, Liked, or Didn&rsquo;t
          like). DNF and Currently&nbsp;reading are excluded.
          {!hydrated && " Loading your saved statuses…"}
        </p>
      </div>

      <StatCard
        label="All finalists read"
        read={stats.readFinalists}
        total={stats.totalFinalists}
        wantToRead={stats.wantToRead}
        sub={`Winners read: ${stats.readWinners} / ${stats.totalWinners} (${pct(
          stats.readWinners,
          stats.totalWinners,
        )}%)`}
      />

      <div>
        <h2 className="mb-3 text-lg font-semibold">By category</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((c: Category) => {
            const s = stats.byCategory[c];
            return (
              <StatCard
                key={c}
                label={CATEGORY_LABELS[c]}
                read={s.readFinalists}
                total={s.totalFinalists}
                wantToRead={s.wantToRead}
                sub={`Winners read: ${s.readWinners} / ${s.totalWinners} (${pct(
                  s.readWinners,
                  s.totalWinners,
                )}%)`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
