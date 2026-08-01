# 3. Wikidata for genre enrichment

Date: 2026-07-31

## Status

Accepted

## Context

We wanted genre (and ideally a description) for each finalist, to display on
rows and to filter by. The finalist list is 1,537 works, of which **1,132 (74%)
is short fiction** — novellas, novelettes and short stories rather than books.

Four public sources were measured against the actual dataset rather than
assessed from documentation:

| Source | Match rate | Notes |
| --- | --- | --- |
| **Wikidata** | **85%** (73% with genre) | CC0, no API key |
| Open Library | novels 5/6, short fiction **1/16** | free, no key |
| Google Books | not measurable | keyless quota exhausted (HTTP 429); needs a key |
| ISFDB | not measurable | blocked scraping (HTTP 403); would need the MySQL dump |

Open Library — the obvious first choice — matched novels well but collapsed on
short fiction, because book catalogs have no record for an individual short
story published in a 1965 magazine. Given short fiction is three quarters of
this dataset, that ruled it out as the primary source.

## Decision

Use **Wikidata** as the enrichment source, queried via SPARQL at build time and
baked into `data/hugos.json` (`scripts/enrich-hugos.ts`). The site stays static
with no runtime API calls.

The reason Wikidata succeeds where book catalogs fail is that it is
**award-linked**: we query works already tagged as nominated for (or winner of)
the four Hugo fiction awards, then match by normalized title *within that pool*.
Matching happens against ~1,800 candidates rather than every book ever
published, so short stories match as well as novels (86% vs 83%).

Descriptions are kept only when they are not formulaic. 78% of Wikidata
descriptions are of the form "2024 novel by Robert Jackson Bennett", which
merely restates the title, author, category and year the row already shows.
These are dropped, leaving ~60 that carry real information ("1981 cyberpunk
novella", "fantasy/magical realism short story").

## Consequences

- Genre is present on ~73% of works and absent on the rest; the UI must treat a
  missing genre as normal, not as an error. The genre filter carries an explicit
  "(no genre)" option so those works stay reachable.
- Roughly 70% of genre-bearing works are tagged only "science fiction", which is
  uninformative for a science fiction award. We display all genres anyway
  (rather than suppressing generic ones) so that presence is consistent and
  predictable; the specific tags sort first.
- The description field is deliberately sparse (~4% of works). This is accepted:
  a rare field that always says something beats a ubiquitous one that usually
  restates the row.
- Re-running enrichment is idempotent and safe; it clears prior enrichment
  before re-applying, so upstream Wikidata edits flow through on the next run.
- If richer synopses are ever wanted, Open Library could be layered over the 405
  novels only. No free source covers synopses for the short fiction.
