"use client";

import { useRef, useState } from "react";
import { ALL_FINALISTS } from "@/lib/data";
import { exportCsv, importCsv } from "@/lib/csv";
import { useReadingRecords } from "@/lib/storage";

export function ImportExportButtons() {
  const { records, replaceAll } = useReadingRecords();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    const csv = exportCsv(ALL_FINALISTS, records);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hugo-reading-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const result = importCsv(text, ALL_FINALISTS);
      replaceAll(result.records);
      setMessage(
        `Imported ${result.imported} verdict${result.imported === 1 ? "" : "s"}` +
          (result.skipped ? `, skipped ${result.skipped}.` : "."),
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Import failed.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
      >
        Import CSV
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
          e.target.value = ""; // allow re-importing the same file
        }}
      />
      {message && (
        <span className="text-xs text-stone-500 dark:text-stone-400">{message}</span>
      )}
    </div>
  );
}
