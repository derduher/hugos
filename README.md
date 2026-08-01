# Hugo Reading Tracker

A personal, single-user site to track which Hugo Award finalists and winners
you've read, across the four written-fiction categories: **Best Novel, Best
Novella, Best Novelette, Best Short Story** (regular and Retro Hugos).

- **Browse by ceremony year.** The timeline is organized by the Worldcon year an
  award was presented. Retro Hugos appear under the year they were awarded,
  badged with their target year (e.g. the 1945 Retro Hugos live under 2020).
- **Mark a verdict** per work: Loved → Liked → Didn't like → DNF, plus Currently
  reading. "Read" counts finished works (Loved/Liked/Didn't like); DNF and
  Currently reading are excluded from progress.
- **Triage** — a keyboard-driven mode for rapidly sorting a filtered queue one
  work at a time. Keys `1`–`7` set a status, `space` passes, `Z` undoes.
- **Genre** from Wikidata, shown as chips and filterable.
- **Stats**, winner highlighting, search, and filters (category / status /
  genre / winners-only).
- **Your data stays in your browser** (localStorage). Use **Export CSV** to back
  it up and **Import CSV** to restore or move it to another browser/device.

See [CONTEXT.md](CONTEXT.md) for the domain glossary and
[docs/adr/](docs/adr/) for the key design decisions.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build (static export)

```bash
npm run build      # outputs a static site to ./out
```

The result is a fully static site — host `out/` anywhere, or open it locally.

## Data

The finalist/winner list in [`data/hugos.json`](data/hugos.json) is generated
from Wikipedia's four per-category pages:

```bash
npm run scrape     # rebuild data/hugos.json from Wikipedia
npm run enrich     # add genre/description from Wikidata (run after scrape)
```

`npm run verify` runs the logic smoke tests.

`npm run build` writes its cache to `.next-build` rather than `.next`, so
building while the dev server is running does not corrupt it.
