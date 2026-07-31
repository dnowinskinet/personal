# Obsolescence, Inc. — Current State

**Last updated:** 2026-07-30
**Phase:** Foundation Milestone 1 complete, **visual canon implemented**. The facility draws as the
canonical building cutaway — one aligned tower with the Showroom at grade, the Loading Dock below
it behind an exterior truck ramp, offices above, stairs from the start — and it is the default view
at `/experimental/obsolescence`.

This file is rewritten at the end of every session. It describes the present, not the history.

---

## What changed on 2026-07-30

A visual-canon directive superseded all earlier ambiguity about the building's shape, and the
session implemented it. **The simulation did not change** — same kernel, same facility rules, same
ten fixtures, same metrics, 105/105 tests. What changed is how it is drawn:

- `presentation/facility-tower-layout.ts` — pure geometry for the canonical stack: level naming
  (Office Level n / Showroom / Loading Dock / B1…), story pitch, the **mirrored x-projection**
  (freight core and dock read left, stairs right; sim coordinates stay the only truth), the
  exterior ramp/apron, bay guides.
- `presentation/facility-tower-view.{ts,html,scss}` — the SVG night scene: city backdrop, aligned
  shell, stair and freight cores, showroom fascia/glazing/plinths, dock door + truck + chevrons,
  rooms with generated walls/doors/labels/equipment, profession-colored staff figures with poses,
  need badges and red blocker badges, selection halo, build-mode guides and live-validity draft.
- `presentation/facility-view.{ts,html}` — the tower replaced the diagnostic grid as the primary
  surface; build mode is an explicit toggle; the inspector (nine questions), dev overlay and
  scenario drawer are unchanged beside it. Move arrows follow *visual* direction.
- `obsolescence-game.ts` — the Facility tab is the default mode.
- App shell — the route gets the wide shell (`site-main--obsolescence`, the GriftOS pattern).

Read [VISUAL-CANON-NOTES.md](VISUAL-CANON-NOTES.md) for the full record and honest gaps, and D-032
for the decisions. `docs/obsolescence/media/tower-f01-running.svg` is a committed serialization of
the live scene.

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

## Verification status

| Command | Result |
|---|---|
| `npm run oi:test` | boundaries + 31 checker tests + purity + **105/105** |
| `npm run verify` (lint + AOT prod build) | clean, zero warnings; 9 routes prerendered |
| Component style budget | facility scene 5.4 kB vs 6 kB budget |
| Browser | verified live: run/pause/speeds, selection, build/move/demolish/undo, scenario loads; 1024×640 fits width with zero page overflow; 390×844 pans the tower inside its own container |

**`tsc --noEmit` does not check Angular templates** — the AOT build is the gate for presentation
work. The `InvalidStateError: Transition was aborted` console noise remains pre-existing and
site-wide (reproduces on `/about`).

## Known gaps

- **Bay chunking** — the canon sketches 7–10 coarse bays; today one bay = one sim cell (20 per
  floor). Re-chunking is sim geometry, not renderer work. **Q-008.**
- **No dock-specific equipment** (shelving, forklift, staging, auto-loader) exists in the
  catalogue, so fixtures park workshops on the dock level. The level still reads as the dock.
- **Campaign tower** untouched, still pre-canon.
- **Phone floor-focus view** not built; the tower pans horizontally inside its container at 390 px.
- **Room labels always on**; may want hover/zoom gating on dense floors.
- Everything in FOUNDATION-M1-RESULTS.md's M2 list still stands: elevators, materials, hiring and
  the economy hook, facility persistence. Cash and standing still go nowhere.

## Immediate next step

**Still blocked on Daniel playing it** — now with a building worth looking at. F07 and F08 remain
the sharpest cases. After that, Milestone 2 in the recorded priority order (elevators, materials,
hiring/economy, persistence), plus Q-008 if the bay grain feels wrong in play.

## Verified repo facts

- Angular 21.2.18, TypeScript 5.9.3, Node 22, Tailwind 3.4.19, ESLint 10.7. Zero game dependencies.
- Branch: `feat/obsolescence-visual-canon` off `feat/obsolescence-facilities-foundation-m1`.
- `.claude/launch.json` defines the `dev` preview on port 4200.
- Inside the game tree use **relative imports**; emitted CommonJS cannot resolve `@oi/*`.
- `strictTemplates` rejects dynamic indexing in templates — type the list in the component.
- The facility scene commits to a fixed night palette by design (D-032); panels stay theme-aware.
- The lineup model remains recoverable at commit `2693d3c`.

## Standing reminders

- Session close: rewrite this file, append to `DECISIONS.md`.
- No dependency is installed and none was needed. Do not install Pixi/Phaser before Gate C.
- Do not touch GriftOS. `npm run verify` and `npm run oi:test` must both pass.
