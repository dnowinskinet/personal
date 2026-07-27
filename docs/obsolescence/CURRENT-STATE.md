# Obsolescence, Inc. — Current State

**Last updated:** 2026-07-26
**Phase:** 1, 2 and 3 complete. **Gate A rebuilt as the quarter race, awaiting Daniel.**

This file is rewritten at the end of every session. It describes the present, not the history.

---

## Where the project actually is

**There is a playable prototype at `/experimental/obsolescence`.** A three-minute quarter: twelve
staff split across research, production and market prep, a ticking clock, and an assembly step at
the deadline where you build a product from whatever you actually managed to make.

**Gate A's machine-measurable conditions pass. Gate A is not closed** — two human gates are Daniel's.
See [gates/A-quarter-race.result.md](gates/A-quarter-race.result.md).

## The design changed direction

The first Gate A tested lineup composition and read as a configuration form. The reference point is
News Tower: **few decisions remade constantly under rising pressure**, not many decisions made once.
That is D-019, and it is the most important thing in this file.

Two consequences worth knowing before touching anything:

- **Persistence lives in the institution, not the product** (D-020). Products are disposable and
  obsolete within a quarter. Cash and standing carry forward and gate expansion — you cannot dig
  Basement 3 until you have the standing for a permit and the cash to move the subway. This voids
  R6's campaign memory model and the "building that remembers its own promises" thesis. Deliberate,
  not overlooked.
- **The building expands both ways and both pay** (D-021). Manufacturing below, marketing and sales
  above with legal and HR arriving later. The core investment decision is up versus down.

[CANON.md](CANON.md) sections 3 and 4 are substantially void as a result. Everything else stands.

## What Daniel needs to do

Open `/experimental/obsolescence`, hit Run, and play a quarter. Then:

1. **Does the rush at the deadline feel like a rush?**
2. **Is finding out what you can build a payoff, or an anticlimax?**

The honest fun signal is behavioural — opening it again, unprompted, days later.

## Verification status

| Command | Result |
|---|---|
| `npm run oi:arch` | passes across 21 files (sim 12, content 2, presentation 2, devtools 1, tests 4) |
| `npm run oi:arch:test` | 31/31 |
| `npm run oi:sim` | purity gate clean, 49/49 |
| `npm run verify` | lint and build clean, 9 static routes prerendered |

Lazy chunk 6.0 kB compressed against R8's 12 MiB budget.

**Verified live in a browser this time** — the clock ticks, speeds work, research raises the tier
mid-quarter, and at the deadline the flagship option was correctly blocked for want of a tier-3
board.

## Sweep, 200 seeds

| Bot | Mean | Meets goal |
|---|---:|---:|
| Research-heavy | 33.7 | 0% |
| Production-heavy | 9.0 | 0% |
| Market-heavy | 21.0 | 0% |
| Balanced (set once) | 53.5 | 21% |
| Adaptive (reallocates) | 60.2 | 98% |

Set-and-forget meets the goal 21% of the time; watching the shelves and redirecting production hits
it 98%. That gap is the reason to be present while the clock runs.

## Immediate next step

**Blocked on Daniel playing it.** If it passes, the next questions are the residue layer — cash and
standing gating expansion, permits, the subway — and whether the office side needs to be more than
one slider before it is interesting.

## Known gaps

- **Condition 4 has no scenarios.** The five pre-registered situations for the single-tester
  comprehension check are not authored. Machine conditions pass without them.
- **Nothing consumes cash or standing yet.** They come out of a quarter and go nowhere.
- **One quarter only.** No second quarter, no obsolescence of the previous product.
- **Offices are one slider.** Marketing, sales and business development collapsed into "market
  prep". Legal and HR do not exist. Right for the loop test, wrong as a design.
- **Floor one is undecided** — whether it starts as showroom, office and manufacturing crammed
  together. Does not block anything yet.

## Phase plan

| # | Phase | Status |
|---|---|---|
| 0–3 | Inventory, doc triage, research synthesis, architecture | Complete |
| 4 | **Gate A — the quarter race** | **Built; awaiting human gates** |
| 5 | Gate B — residue, permits, expansion | Blocked on Gate A |
| 6 | Gate C — renderer | Blocked on Q-004 |

## Verified repo facts

- Angular 21.2.18, TypeScript 5.9.3, Node 22.20.0, Tailwind 3.4.19, ESLint 10.7.
- `/dist` is gitignored. `oi:sim` cleans `dist/oi-sim` first — `tsc` does not remove outputs for
  deleted sources, and stale test files kept running after the lineup model was removed.
- Inside the game tree use **relative imports**; the emitted CommonJS cannot resolve `@oi/*`.
- `strictTemplates` rejects dynamic indexing in templates — type the list in the component.
- `.claude/launch.json` defines a `dev` preview on port 4200.
- The lineup model is recoverable at commit `2693d3c`.

## Standing reminders

- Session close: rewrite this file, append to `DECISIONS.md`.
- No dependency is installed yet and none has been needed.
- Do not touch GriftOS.
- `npm run verify` and `npm run oi:test` must both pass.
