"use client";

import {
  CATEGORY_LABELS,
  type Finalist,
  type Status,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/types";
import { GenreChips } from "./GenreChips";
import { LookupLinks } from "./LookupLinks";
import { WinnerBadge } from "./WinnerBadge";

// Keys 1-7 map to the seven statuses in their canonical order.
const ACTIVE: Record<Status, string> = {
  want: "bg-want text-white border-want",
  skip: "bg-skip text-white border-skip",
  reading: "bg-reading text-white border-reading",
  loved: "bg-loved text-white border-loved",
  liked: "bg-liked text-white border-liked",
  disliked: "bg-disliked text-white border-disliked",
  dnf: "bg-dnf text-white border-dnf",
};

export function TriageCard({
  finalist,
  onStatus,
  onPass,
  onUndo,
  canUndo,
  position,
  total,
}: {
  finalist: Finalist;
  onStatus: (status: Status) => void;
  onPass: () => void;
  onUndo: () => void;
  canUndo: boolean;
  position: number;
  total: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
        <span className="tabular-nums">
          {position} of {total}
        </span>
        <div className="mx-4 h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${total ? ((position - 1) / total) * 100 : 0}%` }}
          />
        </div>
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded border border-stone-300 px-2 py-0.5 text-xs font-medium disabled:opacity-40 hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          ↶ Undo <kbd className="ml-1 opacity-60">Z</kbd>
        </button>
      </div>

      {/* The card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/50">
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <span className="font-semibold">{finalist.ceremonyYear}</span>
          <span aria-hidden>·</span>
          <span>{CATEGORY_LABELS[finalist.category]}</span>
          {finalist.isRetro && (
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              Retro {finalist.targetYear}
            </span>
          )}
          {finalist.outcome === "winner" && <WinnerBadge />}
        </div>

        <h2 className="mt-2 text-2xl font-bold tracking-tight">{finalist.title}</h2>
        {finalist.authors.length > 0 && (
          <p className="mt-1 text-lg text-stone-600 dark:text-stone-300">
            {finalist.authors.join(", ")}
          </p>
        )}
        {finalist.description && (
          <p className="mt-2 text-sm italic text-stone-500 dark:text-stone-400">
            {finalist.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <GenreChips genres={finalist.genres} max={6} />
          <LookupLinks finalist={finalist} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatus(s)}
            className={
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:opacity-90 " +
              ACTIVE[s]
            }
          >
            <kbd className="rounded bg-black/20 px-1 text-[10px] leading-4">
              {i + 1}
            </kbd>
            {STATUS_LABELS[s]}
          </button>
        ))}
        <button
          type="button"
          onClick={onPass}
          className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <kbd className="rounded bg-stone-200 px-1 text-[10px] leading-4 dark:bg-stone-700">
            space
          </kbd>
          Pass
        </button>
      </div>

      <p className="text-xs text-stone-400 dark:text-stone-500">
        Keys <kbd>1</kbd>–<kbd>7</kbd> set a status · <kbd>space</kbd>/<kbd>→</kbd>{" "}
        pass · <kbd>Z</kbd>/<kbd>←</kbd> undo · <kbd>Esc</kbd> exit. Passed works
        come back next session.
      </p>
    </div>
  );
}
