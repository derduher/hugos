# Context — Hugo Reading Tracker

Glossary of the ubiquitous language for this project. This file is a glossary
and nothing else — no implementation details, no spec, no scratch notes.

## Terms

- **Ceremony year** — the Worldcon year an award set was presented. This is the
  node the timeline is organized by. For regular Hugos it equals the target
  year; for Retro Hugos it is when the award was actually given (e.g. the 1945
  Retro Hugos have ceremony year **2020**).

- **Award set** — the group of awards presented at one ceremony for one target
  year. A single ceremony year may hold more than one award set: a regular set
  and (in some years) a Retro set.

- **Target year** — the eligibility year the award represents. Equals the
  ceremony year for regular Hugos; a historical year for Retro Hugos.

- **Category** — one of the four written-fiction categories tracked here: Best
  Novel, Best Novella, Best Novelette, Best Short Story. (Media and non-fiction
  Hugo categories are out of scope.)

- **Finalist** — a work that appeared on the final ballot in a category.

- **Winner** — a finalist that won its category. A category may have more than
  one winner in a year (**ties / co-winners**). A category may also resolve to
  **No Award**, which is an outcome, not a work — it is not tracked as a
  finalist.

- **Retro Hugo** — a Hugo awarded in a modern ceremony for a historical target
  year that never had Hugos. Its target years (1939, 1941, 1943–1946, 1951,
  1954) never had a regular Hugo, so they are unambiguous.

- **Work** — a nominated title: title + author(s) + category, belonging to one
  award set.

- **Verdict** — the user's ordinal opinion on a work, from best to worst:
  **Loved → Liked → Didn't like → DNF**. The default (no record) is **Unread**.
  There is also a **Currently reading** state. DNF means "didn't like it enough
  to finish."

- **Read** — a work whose verdict is Loved, Liked, or Didn't like (i.e. the user
  *finished* it). **DNF and Currently reading do NOT count as read** in progress
  counts and filters.

- **Reading record** — the user's per-work data: a verdict plus an optional
  date read. Stored only in the user's browser.
