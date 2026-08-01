// CSV export/import for reading records. An export doubles as a backup and,
// re-imported, restores or migrates verdicts to another browser/device.

import {
  type Finalist,
  type ReadingRecords,
  type Status,
  STATUSES,
} from "./types";

const COLUMNS = [
  "id",
  "category",
  "ceremonyYear",
  "targetYear",
  "title",
  "author",
  "status",
  "dateRead",
] as const;

function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Export every work that currently has a verdict. */
export function exportCsv(
  finalists: Finalist[],
  records: ReadingRecords,
): string {
  const byId = new Map(finalists.map((f) => [f.id, f]));
  const lines = [COLUMNS.join(",")];
  for (const [id, rec] of Object.entries(records)) {
    const f = byId.get(id);
    if (!f) continue; // stale id no longer in the seed
    const row = [
      f.id,
      f.category,
      String(f.ceremonyYear),
      String(f.targetYear),
      f.title,
      f.authors.join("; "),
      rec.status,
      rec.dateRead ?? "",
    ];
    lines.push(row.map(escapeCell).join(","));
  }
  return lines.join("\n") + "\n";
}

/** Parse a CSV string into rows of cells (RFC-4180-ish: quotes, commas, newlines). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      // skip fully-blank lines
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
}

export interface ImportResult {
  records: ReadingRecords;
  imported: number;
  skipped: number;
}

/**
 * Import a CSV, keeping only rows whose id exists in the seed and whose verdict
 * is valid. Unknown ids and bad verdicts are skipped (counted).
 */
export function importCsv(text: string, finalists: Finalist[]): ImportResult {
  const validIds = new Set(finalists.map((f) => f.id));
  const rows = parseCsv(text);
  if (rows.length === 0) return { records: {}, imported: 0, skipped: 0 };

  const header = rows[0].map((h) => h.trim());
  const idIdx = header.indexOf("id");
  // Accept the current "status" column, or a legacy "verdict" column.
  const statusIdx =
    header.indexOf("status") !== -1
      ? header.indexOf("status")
      : header.indexOf("verdict");
  const dateIdx = header.indexOf("dateRead");
  if (idIdx === -1 || statusIdx === -1) {
    throw new Error('CSV must have "id" and "status" columns.');
  }

  const records: ReadingRecords = {};
  let imported = 0;
  let skipped = 0;
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const id = (cells[idIdx] ?? "").trim();
    const status = (cells[statusIdx] ?? "").trim() as Status;
    if (!validIds.has(id) || !STATUSES.includes(status)) {
      skipped++;
      continue;
    }
    const dateRead =
      dateIdx !== -1 ? (cells[dateIdx] ?? "").trim() || undefined : undefined;
    records[id] = { status, dateRead };
    imported++;
  }
  return { records, imported, skipped };
}
