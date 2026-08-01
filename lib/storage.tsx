"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReadingRecord, ReadingRecords, Status } from "./types";

const STORAGE_KEY = "hugo-reading-records-v1";

interface ReadingContextValue {
  records: ReadingRecords;
  /** true once localStorage has been read on the client (avoids SSR flash). */
  hydrated: boolean;
  /** Set or clear a status. Passing null removes the record (-> Undecided). */
  setStatus: (id: string, status: Status | null) => void;
  setDateRead: (id: string, dateRead: string | undefined) => void;
  /** Replace the entire store (used by CSV import). */
  replaceAll: (records: ReadingRecords) => void;
}

/**
 * Migrate legacy records: the field was renamed `verdict` -> `status`. Records
 * saved before the rename carry a `verdict` key; map it to `status`.
 */
function migrate(raw: unknown): ReadingRecords {
  if (!raw || typeof raw !== "object") return {};
  const out: ReadingRecords = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const v = value as { status?: Status; verdict?: Status; dateRead?: string };
    const status = v.status ?? v.verdict;
    if (!status) continue;
    out[id] = { status, dateRead: v.dateRead };
  }
  return out;
}

const ReadingContext = createContext<ReadingContextValue | null>(null);

export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<ReadingRecords>({});
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount. window is undefined during static prerender.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setRecords(migrate(JSON.parse(raw)));
    } catch {
      // ignore corrupt/unavailable storage
    }
    setHydrated(true);
  }, []);

  // Persist on every change, but only after the initial load.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore quota/unavailable storage
    }
  }, [records, hydrated]);

  const setStatus = useCallback((id: string, status: Status | null) => {
    setRecords((prev) => {
      const next = { ...prev };
      if (status === null) {
        delete next[id];
      } else {
        const existing = next[id];
        next[id] = { ...existing, status } as ReadingRecord;
      }
      return next;
    });
  }, []);

  const setDateRead = useCallback((id: string, dateRead: string | undefined) => {
    setRecords((prev) => {
      const existing = prev[id];
      if (!existing) return prev; // no verdict yet; nothing to date
      const next = { ...prev };
      next[id] = { ...existing, dateRead: dateRead || undefined };
      return next;
    });
  }, []);

  const replaceAll = useCallback((next: ReadingRecords) => {
    setRecords(next);
  }, []);

  return (
    <ReadingContext.Provider
      value={{ records, hydrated, setStatus, setDateRead, replaceAll }}
    >
      {children}
    </ReadingContext.Provider>
  );
}

export function useReadingRecords(): ReadingContextValue {
  const ctx = useContext(ReadingContext);
  if (!ctx) {
    throw new Error("useReadingRecords must be used within a ReadingProvider");
  }
  return ctx;
}
