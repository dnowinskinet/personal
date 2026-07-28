# R10 adoption note

**Date:** 2026-07-27
**Branch:** `feat/obsolescence-facilities-foundation-m1`
**Scope:** Foundation Milestone 1 — rooms, qualified staff, autonomous jobs, support needs, explainability.

Written before implementation, per the directive. Concise on purpose.

---

## Path deviations from the directive

The directive names `docs/R10-ADOPTION.md`, `docs/research/R10-...`, and
`docs/STATE-OF-PLAY-2026-07-27.md`. This repository routes all Obsolescence documentation under
`docs/obsolescence/` per `AGENTS.md` and D-009, because `docs/` is shared with GriftOS and the
site itself. **`AGENTS.md` is authoritative for working practices**, so the actual paths are:

| Directive path | Actual path |
|---|---|
| `docs/R10-ADOPTION.md` | `docs/obsolescence/R10-ADOPTION.md` |
| `docs/research/R10-facilities-simulation-foundation.md` | `docs/obsolescence/research/R10-facilities-simulation-foundation.md` |
| `docs/STATE-OF-PLAY-2026-07-27.md` | `docs/obsolescence/STATE-OF-PLAY.md` (exists, dated 2026-07-27) |
| `docs/FOUNDATION-M1-RESULTS.md` | `docs/obsolescence/FOUNDATION-M1-RESULTS.md` |

No content deviation — only location.

## What the repository already provides

Verified by inspection, not assumed.

| Asset | State | Verdict |
|---|---|---|
| Deterministic kernel (`sim/`) | 10 Hz tick, pure `(seed, cursor)` RNG, command log, canonical serialization, schema version | **Keep unchanged.** R10 explicitly asks for exactly this. |
| Architecture boundary checker | AST-based, allowlist for `sim/`, own 31-test regression suite | **Keep and extend.** Already enforces every constraint R10's handoff lists. |
| `sim/quarter/` | Clock, staff-count allocation, part production at tiers, assembly from inventory, resolution | **Preserve the payoff; replace the labour model.** |
| `sim/building/` | Floors with levels, ownership, capacity, purchase gated by cash + standing | **Extend into real spatial topology.** Floor identity and campaign carry forward. |
| `presentation/tower-view` | SVG cutaway, theme-aware, cores + ramp + pavement drawn | **Keep and extend.** R10 says stay on SVG for the foundation. |
| `devtools/bots.ts` | Policy bots + sweep across seeds | **Model for the scenario runner.** |
| Headless test harness | `node --test` over compiled CJS, 66 tests | **Keep.** |
| Dependencies | **Zero installed.** Nothing beyond the Angular site itself. | **Keep at zero.** R10 forbids Phaser/Pixi/Grid Engine for this milestone. |

## What is extended rather than replaced

- **`sim/building/`** gains a cell grid, corridor graph, and room occupancy. Existing `FloorDefinition`
  ids, levels, ownership and purchase rules are preserved so campaign state still loads.
- **`sim/quarter/`** keeps `assemblyOptions`, `resolveQuarter`, `PartStock` and the tier model
  untouched. What changes is *how parts arrive*: previously a floor-level staff count multiplied a
  rate; now qualified staff perform jobs at stations and deposit output. The adapter is deliberately
  thin.
- **`tower-view`** gains a room layer and per-staff rendering inside the existing geometry.

## Conflicts between R10 and the actual repository

Recorded honestly; each has a chosen resolution.

1. **R10 assumes six-to-seven professions and a nine-room first build.** The directive narrows this
   to three professions and four rooms. **The directive wins.** The schema supports the full set;
   the M1 fixture ships `scientist`, `operator`, `qa_technician` and four room types.

2. **R10 recommends a 24-minute quarter.** The current build uses a 5-stage ladder from 60 s to
   180 s, tuned against a 200-seed sweep and validated by playtest. Adopting 24 minutes now would
   invalidate that work and make every scenario fixture take 24 minutes to run.
   **Resolution: externalize it, default to the existing ladder, and record 24 min as the R10 prior
   in config.** Deferred to the economy milestone, which the directive defers anyway.

3. **R10's job-score formula references elevator delay, department assignment, and user priority** —
   none of which exist yet. **Resolution: implement the full weight table with every term
   externalized; terms whose subsystems are deferred evaluate to zero and are marked as such in
   config.** No invented values.

4. **R10 assumes elevators as a modelled subsystem.** The directive explicitly defers them to
   "enough inter-floor movement to route staff reliably". **Resolution: the personnel core is a
   traversable vertical edge with a fixed traversal cost per floor. No cars, no queues, no capacity.**
   The cost is externalized so a real elevator model can replace it without touching job scoring.

5. **R10 says "no manual repair clicking" and specifies machine wear.** Machines are deferred by the
   directive. **Resolution: stations exist and are reservable, but have no condition, wear or
   maintenance.** `StationDefinition` leaves room for it.

6. **`DECISIONS.md` D-024 states "staff assignment is spatial: you put five people in the lab".**
   That is *directionally* what R10 wants but the implementation was floor-level counts feeding a
   scalar allocation. **Superseded, not reversed** — the intent survives, the mechanism is replaced
   by rooms, stations and jobs.

7. **`Q1–Q5` teaching ladder assumes generic interchangeable staff.** Strict professions break the
   premise of Q1 ("everyone builds, there is nowhere else to put them"). **Resolution: the ladder is
   preserved and still passes its tests, but the facilities substrate runs as its own scenario surface
   for M1.** Reconciling the two is a Milestone 2 question, recorded as such.

## Exact files and subsystems to be changed

**New:**
- `sim/facility/` — `grid.ts`, `topology.ts`, `rooms.ts`, `staff.ts`, `jobs.ts`, `needs.ts`,
  `facility.ts`, `metrics.ts`, `explain.ts`, `index.ts`
- `content/facility/` — `professions.ts`, `room-types.ts`, `balance.ts`, `layouts.ts`, `scenarios.ts`
- `devtools/scenario-runner.ts`
- `presentation/facility-*` — floor plan view, inspector, dev drawer
- `tests/facility/` — topology, eligibility, reservations, no-thrash, needs, scenarios

**Modified:**
- `sim/building/types.ts` — floors gain cell extents
- `sim/index.ts` — export the facility domain
- `scripts/check-obsolescence-boundaries.mjs` — `facility` is a sim-internal module, no new layer
- `presentation/obsolescence-game.*` — mount the facility view and dev drawer
- `package.json` — `oi:scenarios` script

**Untouched:** `sim/quarter/assembly.ts` (the payoff), `sim/kernel.ts`, `sim/rng.ts`, `sim/clock.ts`.

## R10 defaults adopted provisionally

All externalized in `content/facility/balance.ts`, all overridable per scenario.

- Needs thresholds: warning 0.45, soft penalty 0.30, mandatory interrupt 0.18, severe 0.10.
- Stat band 0.8–1.2 across exactly four stats: proficiency, precision, endurance, initiative.
- Ranks: junior, regular, senior, principal. Salary multipliers 1.0 / 1.35 / 1.8 / 2.6.
- Healthy time shares: productive 0.58, walking 0.16, needs 0.12, idle 0.08, waiting 0.06.
- Support space share 0.23 of built area.
- Job score weights exactly as R10 lists them.
- Room quality categories capped with diminishing returns after the second same-category item.

**Not adopted in M1:** the 24-minute quarter (conflict 2), elevator capacities (conflict 4),
maintenance ratios (deferred), economy multipliers (deferred).

## Existing behaviour that must be preserved

1. Deterministic replay: same seed + same commands ⇒ identical state (I-004).
2. `sim/` imports nothing external (I-001), enforced by `oi:arch` and `oi:pure`.
3. Inventory-constrained assembly: options derive from real `PartStock`, and a room existing must
   not produce parts — only qualified work does.
4. All 66 existing tests, the 31 boundary-checker tests, `npm run verify`.
5. Campaign save shape — floors, cash, standing. Schema version bumps with a migration.
6. The SVG cutaway and its theme-awareness.

## Assumptions that must be revised

- **"Floor capacity" as an integer staff count** becomes a derived property of rooms and stations.
  The old field stays for save compatibility but stops being the authority.
- **"Sink" as a floor property** (`FLOOR_SINK`) becomes a property of *rooms*, since one floor can
  hold a lab and a restroom.
- **`STATE-OF-PLAY.md`'s claim that market prep has no physical form** stays true and out of scope;
  M1 covers research and production work only.

## What this note does not do

It does not re-open the Gate C renderer question, request mockups, or plan beyond M1. Per the
directive, implementation proceeds immediately.
