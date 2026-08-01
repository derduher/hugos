import { Timeline } from "@/components/Timeline";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hugo Awards timeline</h1>
        <p className="mt-1 text-stone-500 dark:text-stone-400">
          Browse by ceremony year and mark your status on each finalist — from
          &ldquo;Want to read&rdquo; to a verdict. Winners are highlighted; Retro
          Hugos appear under the year they were awarded.
        </p>
      </div>
      <Timeline />
    </div>
  );
}
