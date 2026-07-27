# Obsolescence, Inc. — Current State

**Last updated:** 2026-07-26
**Last verified against commit:** `993c1e0` plus uncommitted Phase 2 documents
**Phase:** 1, 2 and 3 complete. Gate A is next.

This file is rewritten at the end of every session. It describes the present, not the history. For
history, read [DECISIONS.md](DECISIONS.md).

---

## Where the project actually is

**Pre-production is done.** The research is reconciled, the architecture is ratified and enforced,
and there is a deterministic substrate to build on. There is no game yet.

The next thing to build is **Gate A** — the lineup-decision prototype, in Angular HTML with colored
blocks. It answers the only question that can kill the project: *is composing a lineup under deadline
actually fun?*

## What exists

**Docs.** [CANON.md](CANON.md) is the build target — the reconciled design canon. Where a single
report disagrees with it, canon wins. [CONTRADICTIONS.md](CONTRADICTIONS.md) records what disagreed
and why. R1–R9 are mirrored read-only in `research/`.

**Code.** `src/app/games/obsolescence/` holds a deterministic simulation kernel and the layer
skeleton. Nothing is wired to a route, so the game adds **zero weight** to the site bundle.

**Enforcement.** Nine invariants are executable rather than aspirational.

| Command | Result |
|---|---|
| `npm run oi:arch` | passes across 10 files (sim 7, tests 3) |
| `npm run oi:arch:test` | 31/31 |
| `npm run oi:sim` | purity gate clean, 33/33 kernel tests |
| `npm run verify` | lint and build clean, 8 static routes prerendered |

## What just happened

**Phase 2 — research synthesis.** 15 agents reconciled 7,529 lines across nine reports: one extractor
per report, five thematic reconcilers, one completeness critic. Each extractor was told what its
report could actually see when written, since that decides which side of a disagreement has better
evidence.

Found: **56 contradictions plus 8 more the critic caught** that single-theme reconcilers structurally
could not see. 10 blocking — all resolved. 62 tester-panel pass conditions collected for rescoping.
~35 coverage gaps, 11 recorded as `G-*`.

The headline conflict resolved as **15 quarters / 5 chapters**, keeping R6's Foundation → Market →
Liability rhythm — adopted on asymmetric production risk, explicitly *not* because R9 knew better,
since R9 never read R6.

Three findings changed the plan: Gate C becomes a single-stack Pixi run against absolute bars rather
than a Pixi-versus-Phaser bake-off (C-41), **there is no `Offer` entity anywhere in the corpus**
(G-01), and **no demand volume model exists** (G-02).

Also worth carrying forward: two reconcilers justified a resolution by claiming R3 and R8 converged
independently on the camera doctrine. R3 line 15 says it inherited R8's framing through its brief.
**Agreement between reports is not evidence unless the reports were independent, and in this corpus
they frequently were not.**

## Immediate next step

**Gate A — the lineup-decision prototype.** Ugly by design: Angular HTML, colored blocks, no
renderer, no art.

Two gaps should be closed first because Gate A cannot author content without them:

- **G-01 — add an `Offer` entity.** `Variant` is the design, `InstalledBaseCohort` is units sold, and
  nothing represents the sellable-this-quarter offer with a price, stock allocation and placement.
  C-03 makes this urgent: the carried-over low end *is* a previous generation's variant occupying a
  current lineup slot.
- **G-05 — pick which four of the seven segments ship.** Two reports ask for four and neither names
  them.

Write the Gate A brief into `gates/` first — it is step 3 of the boot sequence, and its pass
condition must use a **scenario denominator**, never a tester count.

`phaser` should not be installed. C-41 removed the reason.

## Phase plan

| # | Phase | Effort | Status |
|---|---|---|---|
| 0 | Mechanical inventory | low | Complete |
| 1 | Doc triage | medium | Complete |
| 2 | Research synthesis + contradictions register | high | Complete |
| 3 | Boundary script, path aliases, headless runner | medium | Complete |
| 4 | **Gate A — lineup decision prototype** | high | **Next** |
| 5 | Gate B — one-quarter gray box | high | Not started |
| 6 | Gate C — single-stack renderer gauntlet | medium | Blocked on Q-004 |
| 7+ | Gates D–I | TBD | Re-derive after A and B run |

## What is not settled

[OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) — Q-004 (mockups, blocks Gate C only), Q-006 (gate ladder
re-derivation), Q-007 (save-key namespace), and eleven coverage gaps G-01…G-11.

[CONTRADICTIONS.md](CONTRADICTIONS.md) — eight open conflicts C-11…C-18, including two different
five-ending sets between R6 and R7, and R7's worker-humanity pillar having no mechanism in any other
report. Seven rejected resolutions U-01…U-07.

**C-15 is the one to watch.** Four reports hand down mandatory fixture lists totalling up to 35
scenarios against R9's budget of 5. Now that every gate is scenario-denominated rather than
tester-denominated, that conflict gates the entire validation ladder.

## Verified repo facts

- Angular 21.2.18, TypeScript 5.9.3, Node 22.20.0, npm 10.9.3, Tailwind 3.4.19, ng-bootstrap 20,
  Express 5.2.1, ESLint 10.7, Karma/Jasmine.
- `tsconfig.app.json` compiles only from entry points, so unwired game files add no bundle weight.
- ESLint lints `src/**/*.ts` without a type-checked project.
- `/dist` is gitignored, so `dist/oi-sim` output is never committed.
- CI is `.github/workflows/verify.yml` — Linux runs the full suite, Windows runs the Pages build plus
  `oi:test`.
- `node --test <dir>` does **not** recurse on Node 22.20; `oi:sim` passes a quoted glob instead.
- Branch `feat/obsolescence-foundations` holds Phases 1 and 3, not pushed.

## Standing reminders

- Session close is non-negotiable: rewrite this file, append to `DECISIONS.md`.
- Only `idb`, `fake-indexeddb`, and `@playwright/test` are approved. **Do not install `phaser`** —
  C-41 removed the reason.
- Do not touch GriftOS.
- `npm run verify` and `npm run oi:test` must both pass.
- Fix the vocabulary collision before writing any schema: `componentSlot` / `baySocket` /
  `packageSlot`. The word "slot" currently means three different things.
