# Obsolescence, Inc. — Current State

**Last updated:** 2026-07-28
**Phase:** Foundation Milestone 1 complete. **The facility is playable** — rooms, qualified staff,
autonomous jobs, needs, and diagnostics — alongside the earlier quarter race.

This file is rewritten at the end of every session. It describes the present, not the history.

---

## Read this first: the direction changed again on 2026-07-28

R10 landed and materially changed the target. The game is now a **pausable real-time vertical
facilities, staffing and production-management simulation**: you zone rooms into finite floor space,
buy and position functional objects, hire staff with strict professions, ranks and specializations,
and they claim and perform valid jobs autonomously while needs, walking, queues and layout push back.

**The governing rule, verbatim from the directive:** *a scientist must not become a lawyer merely
because Legal has an empty desk. Qualifications are categorical. Staff quality and specializations
may improve valid work; they may not substitute for the wrong profession.*

Priority order on any conflict: deterministic correctness → explainability → layout and
qualifications → the existing product payoff → save safety → visual sophistication.

Everything below about the quarter race and the ladder **still stands and still runs** — it is the
"Campaign" tab. The facility is the "Facility" tab. They are bridged, not merged: see D-030.

Start at [FOUNDATION-M1-RESULTS.md](FOUNDATION-M1-RESULTS.md), then [R10-ADOPTION.md](R10-ADOPTION.md).

## What the facility is, as built

Three professions (scientist, production operator, QA technician), four room types (research lab,
production workshop, restroom, break room), ten stations, three needs (bladder, hunger, energy),
24 cells per floor with both circulation cores reserved.

Ten deterministic fixtures F01–F10 run headless via `devtools/scenario-runner.ts` and report R10's
metrics. **All ten pass structurally.** No-thrash is 0% against a 5% ceiling. Nothing is tuned yet —
the directive forbids tuning until every scenario passes structurally, and productive time currently
runs high (83–90% vs a 50–65% band) precisely because elevators and materials are deferred.

The interface answers all nine required diagnostic questions, each as a named function in
`presentation/facility-view-model.ts` so coverage is checkable. Scenario loading is a drawer on the
normal route with no query flags.

## Where the project actually is

**There is a playable tower at `/experimental/obsolescence`, drawn as an SVG cutaway.** Sky above,
hatched earth below, pavement at street level, the double-height showroom as the hinge, personnel
and freight cores running the height, a ramp down to B1, staff as figures on floors, parts as crates
in the stores, and the subway bored through B3.

You place staff on floors, run a quarter against the clock, build a product from whatever you
produced, then spend the cash and standing it earned on new floors.

The SVG is **not** the Gate C renderer decision (D-026) — no dependency, theme-aware through
`currentColor`, and it commits to nothing.

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

Open the **Facility** tab, load a fixture from the Scenarios drawer, hit Run, and click a worker.
The question is whether watching people fail to do things — and being told exactly why — is
interesting. F07 and F08 are the sharpest cases: F07 is a workshop full of scientists who will
never touch the bench, F08 is one optics specialist that two rooms both want.

The ladder in the Campaign tab is unchanged and still wants its play-through.

## Verification status

| Command | Result |
|---|---|
| `npm run oi:arch` | passes across 47 files (sim 26, content 6, presentation 6, devtools 2, tests 7) |
| `npm run oi:arch:test` | 31/31 |
| `npm run oi:sim` | purity gate clean, **105/105** |
| `npx eslint src/app/games/obsolescence` | clean |
| Angular AOT build | clean |

**`tsc --noEmit` does not check Angular templates.** A template calling a nonexistent method
type-checked clean and only failed at `ng serve`. For presentation code the AOT build is the gate.

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
