# Obsolescence, Inc. — Current State

**Last updated:** 2026-07-31
**Phase:** Foundation Milestone 1 complete, visual canon implemented. **Gate C is briefed and has
not started.** The facility draws as the canonical building cutaway — one aligned tower with the
Showroom at grade, the Loading Dock below it behind an exterior truck ramp, offices above, stairs
from the start — and it is the default view at `/experimental/obsolescence`.

This file is rewritten at the end of every session. It describes the present, not the history.

---

## What changed on 2026-07-31

**No game code changed.** This session settled a governance conflict and closed an enforcement hole.

**1. The renderer choice was reconciled — D-033.** Four documents asserted a Pixi-only Gate C
(ARCHITECTURE.md, CANON.md, OPEN-QUESTIONS.md Q-006, `render/README.md`), inherited from R8's
ordering and narrowed by C-41. External research had since argued for Phaser 4.2.1 on the grounds
that Gate C needs a game framework — scenes, loader, cameras, input, animation, audio structure —
rather than a raw renderer. **Phaser 4 is now the provisional pick and PixiJS 8.x the named
fallback.** C-41's single-stack method survives untouched; only the stack swapped.

`phaser@4.2.1` is **conditionally pre-approved at that exact version and is not installed.** Nothing
was added to `package.json`. The dependency count is still zero.

**2. Gate C was briefed — [gates/C-renderer-foundation.brief.md](gates/C-renderer-foundation.brief.md).**
Named "Gate C — Renderer foundation", deliberately *not* "Renderer Foundation M2", because Milestone
2 already means elevators, materials, hiring/economy and persistence. The brief is fixed. It does
not authorise starting.

**3. I-002's enforcement was incomplete and is now fixed — D-034.** `STATE_MUTATING_EXPORTS` in
`scripts/check-obsolescence-boundaries.mjs` predated the facility subsystem and never listed
`createFacility`, `tickFacility` or `applyConstruction`. For four commits INVARIANTS.md advertised
I-002 as `ENFORCED` while the simulation's primary mutators were reachable from `render/`. All three
are now listed, with seven regression cases covering named, namespace, dynamic-import, walk-out and
`content/`-laundering forms. The six violation cases were confirmed to **fail** against the previous
list before being accepted. Checker regressions: **31 → 38.**

This was the cheap moment to fix it — `render/` is still empty, so nothing had to be migrated off a
mutator it should never have been able to reach.

## Where the project actually is

Open `/experimental/obsolescence` and you are looking at the building: sky, city and street above;
hatched earth and bedrock below; OFFICE LEVEL 1 / SHOWROOM / LOADING DOCK chips on the left rail;
the branded truck backed against the dock wall at the bottom of the exterior ramp. Load a fixture
from the Scenarios drawer, hit Run, and the little staff walk to their benches and work; click one
and the inspector still answers all nine diagnostic questions. "Build rooms" overlays the bay
guides; two clicks and an equipment list zone a real room through the same `applyConstruction`
path as before.

The fixture stories read on the building without opening the inspector: F03's remote restroom is a
visible trek, F05's missing break room is a red badge, F07 is two badged scientists idling above an
untouched workshop, F08 is one specialist working while the other idles badged beside the rig.

**The quarter race (Campaign tab) still stands and still runs**, drawn with the old D-026 skeleton
tower. It has not been reconciled with the canonical scene — that belongs to the M2 economy/
facility merge, not to a renderer pass.

## Gate status

**No gate has fully passed.** See [gates/README.md](gates/README.md).

| Gate | State |
|---|---|
| A | Machine conditions **pass**. Pre-registered scenarios **not authored**. **Both human questions not run** — Daniel's, and they are the ones that can still kill it |
| B | **Not briefed.** Nothing exists |
| C | **Briefed, not started.** Blocked on A and B by D-004 |

D-004 is unchanged and was not waived: no renderer work before Gates A and B pass.

## Verification status

| Command | Result |
|---|---|
| `npm run oi:test` | boundaries pass over 49 files + **38/38** checker regressions + purity + **105/105** sim |
| `npm run verify` (lint + AOT prod build) | clean, "All files pass linting"; 9 routes prerendered |
| `obsolescence-game` lazy chunk | **131.48 kB raw / 32.82 kB transfer** (browser bundle) — the Gate C baseline. The SSR `.mjs` chunk of the same name is 131.55 kB and is *not* the budget |
| Component style budget | facility scene 5.4 kB vs 6 kB budget |

**`tsc --noEmit` does not check Angular templates** — the AOT build is the gate for presentation
work. The `InvalidStateError: Transition was aborted` console noise remains pre-existing and
site-wide (reproduces on `/about`).

## Known gaps

- **Bay chunking** — the canon sketches 7–10 coarse bays; today one bay = one sim cell (20 per
  floor). Re-chunking is sim geometry, not renderer work. **Q-008.**
- **G-08 (active-floor budget) and G-09 (camera bounds) are unanswered and block Gate C.** They are
  design decisions, not renderer ones, and the brief lists them as prerequisites.
- **No dock-specific equipment** (shelving, forklift, staging, auto-loader) exists in the
  catalogue, so fixtures park workshops on the dock level. The level still reads as the dock.
- **Campaign tower** untouched, still pre-canon.
- **Phone floor-focus view** not built; the tower pans horizontally inside its container at 390 px.
  Gate C's brief treats fixing this as a pass condition, not a nicety.
- **Room labels always on**; may want hover/zoom gating on dense floors.
- Everything in FOUNDATION-M1-RESULTS.md's M2 list still stands: elevators, materials, hiring and
  the economy hook, facility persistence. Cash and standing still go nowhere.

## Immediate next step

**Unchanged, and unchanged by this session: still blocked on Daniel playing it.** F07 and F08 remain
the sharpest cases. Gate A's two human questions — does the rush feel like a rush, is the assembly a
payoff or an anticlimax — are the actual bottleneck, and no agent can answer them.

After that: brief Gate B. Then Milestone 2 in the recorded priority order (elevators, materials,
hiring/economy, persistence), plus Q-008 if the bay grain feels wrong in play. Gate C opens only
once A and B have passed.

## Verified repo facts

- Angular 21.2.18, TypeScript 5.9.3, Node 22, Tailwind 3.4.19, ESLint 10.7. **Zero game
  dependencies installed**, and none needed.
- Branch: `feat/obsolescence-visual-canon` off `feat/obsolescence-facilities-foundation-m1`.
- `.claude/launch.json` defines the `dev` preview on port 4200.
- Inside the game tree use **relative imports**; emitted CommonJS cannot resolve `@oi/*`.
- `strictTemplates` rejects dynamic indexing in templates — type the list in the component.
- The facility scene commits to a fixed night palette by design (D-032); panels stay theme-aware.
- The lineup model remains recoverable at commit `2693d3c`.

## Standing reminders

- Session close: rewrite this file, append to `DECISIONS.md`, update `OPEN-QUESTIONS.md`.
- **`phaser@4.2.1` is version-settled but must not be installed until Gate C opens** (D-033, D-012).
  Pixi is the fallback and is pre-approved at no version.
- **D-034: any new state-advancing sim export joins `STATE_MUTATING_EXPORTS` in the same change**,
  with a regression case. I-002's enforcement is only as good as that list.
- Do not touch GriftOS. `npm run verify` and `npm run oi:test` must both pass.
