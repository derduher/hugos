import type { Finalist } from "@/lib/types";
import { LookupLinks } from "./LookupLinks";
import { StatusPicker } from "./StatusPicker";
import { WinnerBadge } from "./WinnerBadge";

export function FinalistRow({ finalist }: { finalist: Finalist }) {
  const isWinner = finalist.outcome === "winner";
  return (
    <div
      className={
        "flex flex-col gap-2 rounded-lg border px-3 py-2 lg:flex-row lg:items-center lg:justify-between " +
        (isWinner
          ? "border-amber-300 bg-amber-50/60 dark:border-amber-800/60 dark:bg-amber-950/20"
          : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/40")
      }
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{finalist.title}</span>
          {isWinner && <WinnerBadge />}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {finalist.authors.length > 0 && (
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {finalist.authors.join(", ")}
            </span>
          )}
          <LookupLinks finalist={finalist} />
        </div>
      </div>
      <div className="shrink-0">
        <StatusPicker finalistId={finalist.id} />
      </div>
    </div>
  );
}
