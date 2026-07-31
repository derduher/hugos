import { pct } from "@/lib/stats";

export function ProgressBar({
  read,
  total,
  className = "",
}: {
  read: number;
  total: number;
  className?: string;
}) {
  const p = pct(read, total);
  return (
    <div className={"flex items-center gap-2 " + className}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${p}%` }}
        />
      </div>
      <span className="shrink-0 tabular-nums text-xs text-stone-500 dark:text-stone-400">
        {read}/{total}
      </span>
    </div>
  );
}
