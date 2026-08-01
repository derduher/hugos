// Genre chips from Wikidata enrichment. Deliberately lighter than the status
// pills so the title still leads the row. Genres arrive most-specific-first,
// so capping keeps the informative ones ("space opera") over the broad
// umbrella ones ("science fiction").
const MAX_VISIBLE = 3;

export function GenreChips({
  genres,
  max = MAX_VISIBLE,
}: {
  genres?: string[];
  max?: number;
}) {
  if (!genres || genres.length === 0) return null;
  const visible = genres.slice(0, max);
  const overflow = genres.length - visible.length;

  return (
    <span className="flex flex-wrap items-center gap-1">
      {visible.map((g) => (
        <span
          key={g}
          className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium lowercase tracking-wide text-stone-500 dark:bg-stone-800 dark:text-stone-400"
        >
          {g}
        </span>
      ))}
      {overflow > 0 && (
        <span
          title={genres.slice(max).join(", ")}
          className="text-[10px] font-medium text-stone-400 dark:text-stone-500"
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}
