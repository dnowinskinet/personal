# Foundation Milestone 1 — Results

**Date:** 2026-07-28
**Branch:** `feat/obsolescence-facilities-foundation-m1`
**Scope:** R10 phases 1+2 — rooms, qualified staff, autonomous jobs, support needs, explainability.
**Not deployed, not merged, `gh-pages` untouched.**

---

## What was built

| Layer | Files |
|---|---|
| Simulation | `sim/facility/` — `grid`, `rooms`, `topology`, `staff`, `jobs`, `needs`, `explain`, `facility` |
| Bridge | `sim/bridge/product-adapter.ts` |
| Content | `content/facility/` — `balance`, `catalogue`, `scenarios` |
| Devtools | `devtools/scenario-runner.ts` |
| Presentation | `presentation/facility-view-model.ts`, `facility-view.{ts,html}` |
| Tests | `tests/facility/facility.test.ts`, `product-adapter.test.ts` |

**Zero new dependencies.** No Phaser, Grid Engine, PixiJS, ECS, or game framework.

### Gate status

| Gate | Result |
|---|---|
| `npx tsc -p tsconfig.sim.json` (purity — no DOM, no Node in `sim/`) | clean |
| `npm run oi:arch` (layer direction, import allowlist, determinism, renderer read-only, GriftOS isolation) | pass, 47 files |
| `node --test` | 105/105 |
| `npx eslint src/app/games/obsolescence` | clean |
| Angular AOT build | clean; 9 static routes prerendered |
| `obsolescence-game` lazy chunk | 23.86 kB compressed (R8 budget: 12 MiB) |

Note: `tsc --noEmit` does **not** check Angular templates. A template referencing a
nonexistent method type-checked clean and only failed at `ng serve`. The AOT build is the real
gate for presentation code; this cost one round-trip and is worth remembering.

---

## The governing rule

> *A scientist must not become a lawyer merely because Legal has an empty desk. Qualifications are
> categorical. Staff quality and specializations may improve valid work; they may not substitute for
> the wrong profession.*

Enforced structurally, not by balance. `checkEligibility()` is a hard gate that runs **before** any
scoring, so no weight in the job-score table can rescue an unqualified worker — a principal-rank
scientist with maxed stats scores exactly nothing at an assembly bench, because it never enters the
candidate set. Three tests pin this, and F07 demonstrates it end to end: two senior scientists, one
workshop, 1200 ticks, zero output, and `no-qualified-staff` emitted every single tick.

---

## Scenario results

1800 ticks each (900 for F09, 600 for F07), seed 4242, all deterministic and replayable.

| Fixture | Prod | Walk | Wait | Needs | Idle | Trip | Queue | Thrash | RP | Parts |
|---|---|---|---|---|---|---|---|---|---|---|
| F01-baseline | 86% | 4% | 0% | 9% | 0% | 3.8 | 0.06 | 0% | 26 | 23 |
| F02-support-adjacent | 87% | 4% | 0% | 9% | 0% | 3.57 | 0.08 | 0% | 27 | 0 |
| F03-support-remote | 83% | 6% | 0% | 11% | 0% | 6.73 | 0.08 | 0% | 25 | 0 |
| F04-restroom-starved | 85% | 5% | 0% | 10% | 0% | 5.24 | 0.11 | 0% | 41 | 0 |
| F05-no-break-room | 44% | 27% | 0% | 29% | 0% | 1.04 | 0.06 | 0% | 14 | 0 |
| F06-excess-support | 88% | 3% | 0% | 9% | 0% | 3.10 | 0.08 | 0% | 27 | 0 |
| F07-qualification-failure | 0% | 0% | 0% | 0% | 100% | 0 | 0 | 0% | 0 | 0 |
| F08-specialist-contended | 41% | 4% | 0% | 6% | 49% | 7.62 | 0.05 | 0% | 15 | 0 |
| F09-topology-edit | 90% | 5% | 0% | 6% | 0% | 4.30 | 0.14 | 0% | 14 | 0 |
| F10-mixed-priority | 84% | 6% | 0% | 10% | 0% | 4.47 | 0.09 | 0% | 14 | 86 |

**All ten pass structurally**: no invalid rooms, no deadlocks, no unexplained blockers, and every
blocker code emitted is in the M1 vocabulary. Deferred-milestone codes (`no-input`, `output-full`,
`machine-broken`, `waiting-freight`, `waiting-elevator`) are reserved and never emitted.

Every fixture answers its question:

- **F02 vs F03** — the only difference is where the restroom sits. Trip length nearly doubles
  (3.57 → 6.73) and needs time rises 9% → 11%, at a cost of 4 points of productive time. Measurable,
  not catastrophic. That is the intended shape.
- **F05** — the missing break room emits `no-amenity-reachable` **920 times**. It does not go
  quietly dead, which was the whole point of the fixture.
- **F07** — 100% idle, zero output, a stated reason every tick.
- **F08** — the one optics scientist stays 100% utilized while the unqualified one idles with a
  named reason. A bottleneck, not a deadlock: the floor still produces 15 research points.
- **F10** — 86 parts and 0% thrash across four workers and four station types.

**No-thrash: 0% across all ten fixtures**, against R10's 5% ceiling.

### Where the numbers sit against R10's bands

Productive time runs 83–90% against R10's 50–65% band, and walking runs 3–6% against 10–22%.
**This is expected and not yet a defect.** R10's bands assume elevators, machine setup, materials
handling and freight — all explicitly deferred by the directive. With travel reduced to a fixed
per-floor cost and no input constraints, there is very little for a worker to do except work. The
bands become meaningful in Milestone 2, when the deferred subsystems arrive to consume that time.

Per the directive, **nothing has been tuned.** The runner reports against the bands and flags
drift; it does not assert them.

---

## Defects found, and how

Four of the six real defects were found by writing tests or by looking at the screen, not by the
implementation itself. Recording that split because it repeats [D-022](DECISIONS.md).

**1. The seed was inert (found by a test).** Needs decayed at a fixed rate, so two workers hired on
the same tick reached the threshold on the same tick forever. Beyond making the seed meaningless,
this manufactures the synchronized-queue artifact the genre is known for and turns amenity sizing
into a cliff instead of a curve. Fixed with a per-worker decay multiplier derived from
`(seed, hash(staffId))` — stable for the run, survives save/load without being stored, replays
byte-identical.

**2. Room quality never reached work output (found by wiring the adapter).** `roomQuality` was
computed and used for amenity choice, but the quality of a completed part was purely the worker's.
Room composition therefore did not affect productivity, which the milestone explicitly requires.
Fit-out now scales output within 0.75×–1.25×, deliberately narrow: if fit-out dominates, the
qualification and staffing decisions the game is about stop mattering.

**3. Tier thresholds were guessed (found by looking at the output).** I set them at 1.5/2.2 against
an assumed quality scale. `workQuality` actually spans 0.72–1.35, so *every* part came out tier 1
and the tier system was silently dead. Recalibrated against the reachable range. The response
surface is now: bare room caps everyone at T1, a fitted room reaches T2, T3 needs a principal in a
good room, and stacking past the cap buys nothing.

**4. A QA station manufactured a board.** Semantically wrong — QA verifies, it does not produce.
Untagged output is now counted as `unused` rather than dropped, so a workshop full of stations the
payoff has no use for is visible instead of mysterious.

**5. Widening a room collided it with another, and part output silently went to zero.** The
validator caught it the instant it was asked; the fixture had simply never been re-validated after
the edit. The lesson is that structural validity has to be asserted in the test suite, not assumed —
it now is, for every fixture.

**6. `needs a operator`.** The blocker built inside the tick used raw profession ids and a broken
article, while the same fact rendered correctly in the inspector, which had the catalogue in hand.
`sim/` may not import `content/`, so display names now travel on `FacilityContent`. A rule that is
right but reads like a bug is not an explanation.

---

## Explainability

All nine required questions are answered, each as a named function in `facility-view-model.ts` so
coverage is checkable rather than a matter of opinion.

| Question | Function | Verified live |
|---|---|---|
| Why is this employee not working? | `whyNotWorking` | "No qualified staff available — Scientist s001 is a Scientist. Assembly bench needs a Production Operator." |
| What job are they trying to perform? | `whichJob` | "research at Lab bench in Research Laboratory (lab-a)." |
| What are they waiting for? | `whatWaitingFor` | queue position *n* of *m*, or contender count |
| What qualification is missing? | `missingQualification` | names the profession and the certification |
| Why is this room invalid? | `whyRoomInvalid` | "Missing 1 × research-station — the room cannot operate without it." |
| Why can this employee not use this station? | `whyNotThisStation` | qualification, validity, holder, or reachability |
| Which need interrupted the job? | `interruptingNeed` | names the need |
| Where is the employee going? | `whereGoing` | destination room, floor, ticks remaining |
| Was their prior job reserved for resumption? | `resumptionStatus` | job id, station, ticks of progress saved |

Dev overlay covers all eight required items: current path, current state, current reservation,
candidate-job score factors with per-term breakdown, room bounds and access cells, topology
validity and generation, room/station utilization, and the five time shares.

Scenario loading is a drawer on the normal `/experimental/obsolescence` route. **No query flags.**

---

## Browser verification

Verified at **1440×900**, **1024×640**, and **390×844**. The page body has zero horizontal overflow
at every viewport; the floor plan scrolls inside its own `overflow-x-auto` container.

Exercised live: mode switch, scenario loading, run/pause/speed, staff selection and the full
inspector, room selection, two-click room drafting with live validation, build, move, and the dev
overlay. Moving a room mid-run bumped topology generation 1 → 2 and the workers repathed and
resumed rather than sticking.

**Screenshots were not captured.** The browser pane does not composite frames in this session, so
`screenshot` times out. All verification above is DOM- and text-based and is reproducible by
re-running the same steps. This is the one directive deliverable not met.

The `InvalidStateError: Transition was aborted` console noise is **pre-existing and site-wide** —
it reproduces on `/about` with no game code loaded. It comes from the router's view transitions and
is unrelated to this milestone.

---

## Deviations from the directive

| Deviation | Reason |
|---|---|
| Docs under `docs/obsolescence/` rather than `docs/` | `docs/` is shared with GriftOS and the site; `AGENTS.md` and D-009 are authoritative. Recorded in [R10-ADOPTION.md](R10-ADOPTION.md). |
| R10's 24-minute quarter not adopted | Would invalidate the playtested five-stage ladder and make every fixture take 24 minutes to run. Recorded in `content/facility/balance.ts` with the reason. |
| Three job-score weights are 0 | `departmentAssignment`, `userPriority`, `elevatorPerTick` — their subsystems do not exist in M1. Kept in the table rather than deleted so enabling them is a config change and the formula visibly matches R10. |
| Six professions reduced to three | The directive narrowed R10's scope to four room types; three professions is what those four types need to prove the grammar. The schema carries the full breadth. |
| No screenshots | Environment limitation, described above. |

Nothing was silently substituted. No save format changed — the facility runs from fixtures and does
not yet persist, so existing player state is untouched.

---

## Recommendation for Milestone 2

In priority order:

1. **Elevators.** The single largest gap between these numbers and R10's bands, and the subsystem
   R10 identifies as the genre's most common trust-destroying defect. `elevatorPerTick` is already
   in the score table at 0. Build it with the same fixture discipline: a congestion fixture where
   90% of failed journeys trace to an explainable rule.
2. **Materials and buffers.** `no-input` and `output-full` are already reserved in the blocker
   vocabulary. This is what makes basement logistics a decision and what will pull productive time
   down toward the healthy band honestly, rather than by nerfing work rates.
3. **Hiring, salaries and the economy hook.** `salaryFor()` exists and is unused. Staff currently
   appear by fixture; they need to be a purchase with a running cost, which is what makes the
   specialist-vs-generalist trade real.
4. **Persist the facility.** It must join the versioned save path with a migration before it can
   carry campaign state.

**Two things to fix early rather than let ossify:** the room-quality clamp binds at quality 12, so
everything above `decent` fit-out is wasted — the band is probably too tight once more object types
exist. And staff stats are uniform in every fixture, which hides the stat spread entirely; M2
fixtures should vary precision and endurance so the quality distribution is actually exercised.

**One thing not to do:** do not tune the time shares to R10's bands before the deferred subsystems
land. The current numbers are honest for a facility with no elevators and no materials. Tuning them
now would mean tuning against a model that is about to change.
