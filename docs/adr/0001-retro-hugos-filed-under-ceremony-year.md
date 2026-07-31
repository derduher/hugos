# 1. Retro Hugos are filed under the ceremony year they were awarded

Date: 2026-07-30

## Status

Accepted

## Context

The site's primary navigation is a timeline of years. Retro Hugo Awards are
given at a modern Worldcon for a historical **target year** that never had
Hugos — for example, the 1945 Retro Hugos were actually presented at the 2020
Worldcon. Each Retro award therefore has two candidate years it could be filed
under: the target/eligibility year (1945) or the ceremony year it was awarded
(2020).

We had to pick one as the timeline node.

## Decision

File each award set under the **ceremony year it was awarded**. A ceremony year
node may contain multiple award sets — e.g. 2020 contains both the regular 2020
Hugos and the 1945 Retro Hugos — and each Retro set is badged with its target
year.

Both the ceremony year and the target year are retained on every finalist
record (`ceremonyYear`, `targetYear`, `isRetro`), so the alternative grouping
remains derivable.

## Consequences

- The timeline reflects when awards actually happened; a reader browsing 2020
  sees everything decided that year, Retro included.
- Retro sets are visually separated within their ceremony year and labelled with
  their target year to avoid confusion (a "1945" set under the "2020" heading).
- A future maintainer might expect 1945 works under a "1945" node; this ADR
  explains why they live under 2020 instead. Because `targetYear` is stored,
  re-grouping by target year later is a view change, not a data migration.
