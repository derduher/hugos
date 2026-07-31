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
- **Stats**, winner highlighting, search, and filters (category / verdict /
  winners-only).
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
npm run scrape     # regenerates data/hugos.json
```

`npm run` `tsx scripts/verify.ts` runs a small logic smoke test.
