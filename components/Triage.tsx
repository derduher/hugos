"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ALL_FINALISTS } from "@/lib/data";
import { useReadingRecords } from "@/lib/storage";
import {
  type Finalist,
  type Status,
  STATUS_LABELS,
  STATUSES,
} from "@/lib/types";
import {
  applyFilters,
  defaultFilters,
  FilterBar,
  type Filters,
} from "./FilterBar";
import { TriageCard } from "./TriageCard";

type Phase = "setup" | "running" | "done";

/** What happened to one card, so Undo can reverse it exactly. */
interface Step {
  finalistId: string;
  /** The status before we touched it, so undo restores it (null = none). */
  previous: Status | null;
  action: Status | "pass";
}

/** Triage defaults to the works you haven't decided on yet. */
function triageDefaults(): Filters {
  const f = defaultFilters();
  f.statuses = new Set(["undecided"]);
  return f;
}

export function Triage() {
  const { records, hydrated, setStatus } = useReadingRecords();
  const [phase, setPhase] = useState<Phase>("setup");
  const [filters, setFilters] = useState<Filters>(triageDefaults);

  // The queue is frozen when the session starts, so categorizing a card does
  // not reshuffle the list under you mid-run.
  const [queue, setQueue] = useState<Finalist[]>([]);
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<Step[]>([]);

  // Live count on the setup screen.
  const preview = useMemo(
    () => applyFilters(ALL_FINALISTS, filters, records),
    [filters, records],
  );

  const start = useCallback(() => {
    // Newest ceremony year first; within a year keep the seed's order so a
    // year's slate arrives together.
    const q = [...preview].sort(
      (a, b) => b.ceremonyYear - a.ceremonyYear || a.targetYear - b.targetYear,
    );
    setQueue(q);
    setIndex(0);
    setHistory([]);
    setPhase(q.length > 0 ? "running" : "done");
  }, [preview]);

  const current = queue[index];

  const advance = useCallback(
    (step: Step) => {
      const next = index + 1;
      setHistory((h) => [...h, step]);
      setIndex(next);
      if (next >= queue.length) setPhase("done");
    },
    [index, queue.length],
  );

  const handleStatus = useCallback(
    (status: Status) => {
      if (!current) return;
      const previous = records[current.id]?.status ?? null;
      setStatus(current.id, status);
      advance({ finalistId: current.id, previous, action: status });
    },
    [current, records, setStatus, advance],
  );

  // Pass records nothing: the work stays Undecided and returns next session.
  const handlePass = useCallback(() => {
    if (!current) return;
    const previous = records[current.id]?.status ?? null;
    advance({ finalistId: current.id, previous, action: "pass" });
  }, [current, records, advance]);

  // Each setter gets a pure updater. Nesting these inside one another would
  // run them twice under React StrictMode, rewinding the queue by two.
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    if (last.action !== "pass") setStatus(last.finalistId, last.previous);
    setHistory((h) => h.slice(0, -1));
    setIndex((i) => Math.max(0, i - 1));
    setPhase("running");
  }, [history, setStatus]);

  // Keyboard: 1-7 statuses, space/-> pass, z/<- undo, Esc exit.
  useEffect(() => {
    if (phase !== "running") return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      if (e.key >= "1" && e.key <= "7") {
        e.preventDefault();
        handleStatus(STATUSES[Number(e.key) - 1]);
      } else if (e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        handlePass();
      } else if (e.key.toLowerCase() === "z" || e.key === "ArrowLeft") {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setPhase("setup");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, handleStatus, handlePass, handleUndo]);

  // --- Setup ---------------------------------------------------------------
  if (phase === "setup") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Triage</h1>
          <p className="mt-1 text-stone-500 dark:text-stone-400">
            Rapidly sort works into statuses, one at a time. Filter first to
            choose what you&rsquo;ll go through — it defaults to works you
            haven&rsquo;t decided on yet.
          </p>
        </div>

        <FilterBar filters={filters} onChange={setFilters} />

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={start}
            disabled={!hydrated || preview.length === 0}
            className="rounded-lg bg-stone-900 px-5 py-2.5 font-semibold text-white disabled:opacity-40 hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            Start triage
          </button>
          <span className="text-sm text-stone-500 dark:text-stone-400">
            {preview.length === 0
              ? "Nothing matches these filters."
              : `${preview.length} work${preview.length === 1 ? "" : "s"} in the queue`}
          </span>
        </div>
      </div>
    );
  }

  // --- Summary -------------------------------------------------------------
  if (phase === "done" || !current) {
    const counts = new Map<string, number>();
    for (const s of history) counts.set(s.action, (counts.get(s.action) ?? 0) + 1);
    const decided = history.filter((s) => s.action !== "pass").length;
    const passed = counts.get("pass") ?? 0;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {history.length === 0 ? "Nothing to triage" : "Triage complete"}
          </h1>
          <p className="mt-1 text-stone-500 dark:text-stone-400">
            {history.length === 0
              ? "No works matched those filters."
              : `You went through ${history.length} work${history.length === 1 ? "" : "s"} — ${decided} categorized, ${passed} passed.`}
          </p>
        </div>

        {history.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {STATUSES.filter((s) => counts.get(s)).map((s) => (
              <li
                key={s}
                className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-800"
              >
                <span>{STATUS_LABELS[s]}</span>
                <span className="font-bold tabular-nums">{counts.get(s)}</span>
              </li>
            ))}
            {passed > 0 && (
              <li className="flex items-center justify-between rounded-lg border border-dashed border-stone-300 px-3 py-2 text-sm text-stone-500 dark:border-stone-700">
                <span>Passed (returns next session)</span>
                <span className="font-bold tabular-nums">{passed}</span>
              </li>
            )}
          </ul>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            Triage more
          </button>
          <Link
            href="/"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            Timeline
          </Link>
          <Link
            href="/stats"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            Stats
          </Link>
        </div>
      </div>
    );
  }

  // --- Running -------------------------------------------------------------
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Triage</h1>
        <button
          type="button"
          onClick={() => setPhase("setup")}
          className="text-sm text-stone-500 underline hover:text-stone-800 dark:hover:text-stone-200"
        >
          Exit <kbd className="opacity-60">Esc</kbd>
        </button>
      </div>
      <TriageCard
        finalist={current}
        onStatus={handleStatus}
        onPass={handlePass}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        position={index + 1}
        total={queue.length}
      />
    </div>
  );
}
