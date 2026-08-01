import type { Finalist } from "@/lib/types";

// Generated search links — no stored data. Title + first author is enough for
// both sites to surface the right result first.
function query(finalist: Finalist): string {
  return [finalist.title, finalist.authors[0] ?? ""].join(" ").trim();
}

export function LookupLinks({ finalist }: { finalist: Finalist }) {
  const q = encodeURIComponent(query(finalist));
  const links = [
    { label: "Goodreads", href: `https://www.goodreads.com/search?q=${q}` },
    { label: "Audible", href: `https://www.audible.com/search?keywords=${q}` },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Look up "${finalist.title}" on ${l.label}`}
          className="rounded border border-stone-300 px-1.5 py-0.5 text-[11px] font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
        >
          {l.label} ↗
        </a>
      ))}
    </div>
  );
}
