import type { AwardSet } from "@/lib/data";
import { CategoryGroup } from "./CategoryGroup";

export function AwardSetGroup({ set }: { set: AwardSet }) {
  return (
    <div className="space-y-4">
      {set.isRetro && (
        <div className="flex items-center gap-2">
          <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            Retro Hugo
          </span>
          <span className="text-sm text-stone-500 dark:text-stone-400">
            for {set.targetYear}
          </span>
        </div>
      )}
      {set.categories.map((group) => (
        <CategoryGroup key={group.category} group={group} />
      ))}
    </div>
  );
}
