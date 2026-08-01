import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ReadingProvider } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Hugo Reading Tracker",
  description:
    "Track which Hugo Award finalists and winners you've read, across Best Novel, Novella, Novelette, and Short Story.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReadingProvider>
        <div className="mx-auto max-w-5xl px-4 pb-24">
          <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-stone-200 py-6 dark:border-stone-800">
            <Link href="/" className="text-xl font-bold tracking-tight">
              🏆 Hugo Reading Tracker
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-stone-600 dark:text-stone-400">
              <Link href="/" className="hover:text-stone-900 dark:hover:text-stone-100">
                Timeline
              </Link>
              <Link
                href="/triage"
                className="hover:text-stone-900 dark:hover:text-stone-100"
              >
                Triage
              </Link>
              <Link
                href="/stats"
                className="hover:text-stone-900 dark:hover:text-stone-100"
              >
                Stats
              </Link>
            </nav>
          </header>
          <main className="py-6">{children}</main>
        </div>
        </ReadingProvider>
      </body>
    </html>
  );
}
