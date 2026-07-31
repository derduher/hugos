import type { CategoryGroup as CategoryGroupData } from "@/lib/data";
import { CATEGORY_LABELS } from "@/lib/types";
import { FinalistRow } from "./FinalistRow";

export function CategoryGroup({ group }: { group: CategoryGroupData }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-sm font-semibold text-stone-500 dark:text-stone-400">
        {CATEGORY_LABELS[group.category]}
      </h4>
      <div className="space-y-1.5">
        {group.finalists.map((f) => (
          <FinalistRow key={f.id} finalist={f} />
        ))}
      </div>
    </div>
  );
}
