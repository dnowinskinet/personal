# Obsolescence, Inc. — Current State

**Last updated:** 2026-07-26
**Phase:** Gate A passed. **The tower demo is playable** — quarters on a building that grows.

This file is rewritten at the end of every session. It describes the present, not the history.

---

## Where the project actually is

**There is a playable tower at `/experimental/obsolescence`.** You place staff on floors, run a
quarter against the clock, build a product from whatever you produced, then spend the cash and
standing it earned on new floors. Offices above, manufacturing below, showroom at street level, and
a subway tunnel under B3 you cannot afford for a long time.

Staff assignment is spatial (D-024): you put five people in the lab, and only if you built a lab.

**Gate A has passed.** Machine conditions green, and Daniel played it: *"pretty good actually."*
The named defect was onboarding — it dropped you into the middle of the game — so the systems now
arrive one at a time as a five-stage ladder (D-023). No mechanic changed; the loop was already
right, it was just being shown all at once.

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

## The ladder

| Stage | Turns on | Passive | Attentive |
|---|---|---:|---:|
| Q1 — One thing | nothing; one part, no choices | 100% | 100% |
| Q2 — Two shelves | second part, production focus | 100% | 100% |
| Q3 — Better parts | research, allocation, tiers | 35% | 76% |
| Q4 — Someone has to hear about it | market prep | 70% | 100% |
| Q5 — The real thing | third part; everything on | 20% | 95% |

Q1 is unfailable by design — one part, one grade, sixty seconds, everyone building.

## What Daniel needs to do

Play the ladder from Q1 and see whether the ramp lands. The remaining honest fun signal is
behavioural: opening it again, unprompted, days later.

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
