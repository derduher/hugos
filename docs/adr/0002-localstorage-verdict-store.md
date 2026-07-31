# 2. Verdicts are stored in browser localStorage

Date: 2026-07-30

## Status

Accepted

## Context

The site is a single-user, personal reading tracker. The finalist/winner list
is fixed reference data baked into the build. The only mutable, user-specific
data is small: a verdict (and optional date read) per work.

Options considered for where that verdict data lives:

1. **Browser localStorage** — zero infrastructure, deploys as a pure static
   site, but data is bound to one browser on one device and is lost if browser
   data is cleared.
2. **A version-controlled data file** — durable and git-backed, but a static
   site cannot write files, so marking a book read requires an out-of-band edit.
3. **A backend + database** — enables cross-device sync and durability, but
   introduces a server to run and host.

## Decision

Use **localStorage** as the verdict store, keyed by finalist id. Ship the site
as a static export with no backend.

Mitigate the durability/portability weakness with **CSV export and import**: an
export is a backup, and importing it restores or migrates verdicts to another
browser or device.

## Consequences

- No server, no auth, no database — the site is a static bundle that can be
  hosted anywhere or run locally.
- Verdicts do not sync automatically across devices; the user moves them via CSV
  export/import.
- Clearing browser storage loses un-exported verdicts. The CSV export is the
  safety net and should be easy to reach in the UI.
- If cross-device sync later becomes important, this can be revisited (option 3)
  without changing the domain model — only the storage layer.
