# Visual canon — the facility tower

**Date:** 2026-07-30
**Branch:** `feat/obsolescence-visual-canon` (off `feat/obsolescence-facilities-foundation-m1`)
**Scope:** the visual-canon directive — replace the M1 diagnostic floor grid with the canonical
building cutaway. **Not deployed, not merged, `gh-pages` untouched.**

This file records what visual assumptions were corrected, how the stack now works, and what this
pass actually delivered. The simulation was not changed: same fixtures, same metrics, same tests.

---

## The canonical vertical stack

```
Office Level 2      third above-ground story        (not yet in any fixture)
Office Level 1      second above-ground story
Showroom            ground floor, at grade
Loading Dock        FIRST below-ground story — not B1
B1                  second below-ground story       (not yet in any fixture)
B2                  third below-ground story
```

Simulation levels map 1:1: level *n* > 0 is `Office Level n`, level 0 is the Showroom, level −1 is
the Loading Dock, level −n (n ≥ 2) is `B(n−1)`. `levelLabel()` in
`presentation/facility-view-model.ts` and `canonicalLevelName()` in
`presentation/facility-tower-layout.ts` are the two spellings of this rule; the inspector and the
building now use the same names.

## Corrections to earlier assumptions

1. **The basements are no longer a separate silhouette.** One rectangular footprint from the top
   office to the deepest slab; every story's left and right edges align.
2. **The ramp is outside the building.** It leaves the street left of the footprint, descends to a
   flat truck apron at dock-floor depth, and the truck backs against the Loading Dock wall through
   a slatted dock door. No sloped ramp consumes interior dock space; the dock interior is a flat,
   zonable strip like any other floor.
3. **The Loading Dock is not B1.** It is its own named level directly beneath the Showroom.
   B-numbering starts one story further down.
4. **Office floors are mixed, not departmental.** F01 already zones a lab, a restroom and a break
   room onto Office Level 1, and the tower draws exactly that. No floor carries a single-department
   identity.
5. **Floors are strips partitioned into bays, not prefab rooms.** Rooms are drawn from their
   simulation spans; walls and the door are generated from the span; equipment sits inside on cell
   anchors. Outside build mode no grid is visible.
6. **Stairs exist from the start; elevators are a later upgrade.** The personnel core (sim cells
   0–1) is drawn as a stair core with zigzag flights on every story. The freight core (cells
   22–23) is a braced, reserved shaft with an open portal at the dock. Nothing here commits to an
   elevator model.

## The mirrored projection

The simulation puts the personnel core at cells 0–1 and the freight core at cells 22–23. The scene
mirrors the x-axis so freight — and therefore the dock apron and the truck — reads on the left and
the stairs on the right, matching the canon art. The mirror lives entirely in
`facility-tower-layout.ts` (`cellLeftX`/`cellCenterX`); simulation coordinates remain the only
truth, and the room-panel move arrows are swapped so *visual* left is left. Nothing outside the
layout module knows the mirror exists.

## How the bay system is presented

The zonable strip is cells 2–21 — twenty bays per floor. In build mode the tower shows the strip
tint, a dashed guide at every bay boundary, and hatching over the two structural cores; outside
build mode all of it disappears. Drafting is two clicks (first end, far end) with a live preview
that colors green/red from structural validity while sizing — equipment requirements are excluded
from the live check because they cannot be satisfied while still dragging walls, and reappear in
the Build panel's checklist before commit.

The canon sketches "7, 8, or 10" bays; the honest present truth is that one bay equals one
simulation cell, because fixture rooms begin and end on arbitrary cells and a coarser visual chunk
would lie about where walls can go. Re-chunking to fewer, wider bays is a *simulation geometry*
change (cell width, room min/max, travel costs), recorded as Q-008.

## What the scene draws

Night palette, committed (see D-032): sky gradient, stars, moon, city silhouette with lit windows,
street lamps, hatched earth, bedrock band. The building: brick walls above grade and concrete
below, slabs, parapet, water tank and roof vents, warm lit interiors above ground and industrial
grays below, showroom fascia sign and glazing with display plinths and an entrance in whatever
span rooms have not claimed, dock chevrons and slatted dock door, ceiling pipes below grade.
Rooms: type-tinted fill, generated partition walls, a door at the simulation's door cell, a label
chip, equipment drawn per catalogue object (bench, optics rig, assembly bench, board line, cell
line, QA station, stall, canteen counter, couch, plant; unknown objects fall back to a crate).
Staff: small figures colored by profession (scientist white coat, operator blue, QA green) with
pose from state (walk/work/sit/queue/stand), a red **!** badge when a blocker names why they are
idle, a need badge (droplet / fork / z) while a need is being satisfied, and a name tag plus halo
when selected. Movement interpolates between cells with a CSS transform transition; poses and the
walk bob honor `prefers-reduced-motion`. Working figures stand at their reserved station and
amenity users at their amenity — the simulation parks both on the room's access cell, and drawing
that literally would pile every figure onto one spot. Cosmetic only; the inspector reports sim
truth.

## Verification

| Gate | Result |
|---|---|
| `npm run oi:test` | boundary + checker-regression + purity + **105/105** sim tests |
| `npm run verify` (lint + AOT prod build) | clean, **zero warnings**; 9 routes prerendered |
| Scenario metrics | untouched — no sim, content or fixture file changed except `facility-view-model.ts` labels/objectId (presentation) |
| Component style budget | 5.4 kB compiled against the 6 kB site budget (was 8.03 kB before the attribute/kit-palette split) |

Live checks (dev server, DOM-verified, plus screenshots where the capture pipeline cooperated):

- Stack order, aligned 816-unit footprint on every story, dock floor meeting the flat apron
  exactly, mirrored room spans, truck/ramp/stairs/doors present, zero page horizontal overflow.
- F01 runs: three staff walk to stations, switch to work pose, benches highlight.
- Selection: figure halo + name tag; the inspector answers the nine questions unchanged.
- F03: the remote restroom sits across the floor from the lab and a walker crosses mid-trip.
- F05: the un-satisfiable need presents as a red blocker badge (the inspector names it).
- F07: both scientists idle on the dock with red badges; 100 % idle reads at a glance.
- F08: the optics specialist works while the unqualified scientist idles badged beside the rig.
- F10: all four station types draw distinct equipment in the dock workshop.
- Build mode: 21 guides per story, 20 bay targets per floor, green valid draft
  ("Research Laboratory — 5 bays"), red draft on an overlapping span, commit lands the room with
  its bench, a room nudged over the core shows the dashed amber outline + ⚠ chip and the panel
  explains it.
- Viewports: 1024×640 — tower fills 976 px, panels stack, no overflow. 390×844 — no page
  overflow; the tower pans inside its own container at a 680 px drawing width (a floor-focus
  phone view is future work, not this pass).

**Screenshot evidence.** `media/tower-f01-running.svg` is a committed, self-contained serialization
of the live scene (F01, all three staff working) — exact renderer output, viewable anywhere.
Raster captures were taken through the user's Chrome during the session (full building, build-mode
draft in both valid and invalid states, F03 mid-trip, F07 inspector); the capture pipeline saved
one PNG to `~/Downloads` and produced stale compositor frames whenever the window was hidden, so
they are not committed. To reproduce any state: `npm start`, open `/experimental/obsolescence`,
load the fixture from the Scenarios drawer, Run/Pause, click a worker.

## Remaining issues, honestly

- **Bay chunking** (Q-008): 20 fine bays vs the canon's sketched 7–10 coarse ones.
- **The Campaign tab still shows the old D-026 skeleton tower** with its interior ramp-to-B1. The
  facility is now the default tab and the canonical surface; reconciling or retiring the campaign
  drawing belongs with the M2 economy/facility merge, not with a renderer pass.
- **No dock-specific equipment exists in the catalogue** (shelving, forklift, staging, auto-loader),
  so fixtures park production workshops on the dock level. The level reads as the dock —
  ramp, apron, truck, door — and its interior stays honest configurable space.
- **Room labels are always on**; a dense floor may want them on hover/zoom later.
- **Keyboard access** works (every hit target is focusable with Enter), but there is no visible
  focus order aid, and phone tap targets for staff are ~15 px at 390 px width.
- **Performance headroom untested beyond fixture scale.** The scene is ~440 SVG elements with 3–5
  staff; nothing here measures 150 staff. No PixiJS trigger has been reached; do not migrate on
  speculation (D-004, D-026 still govern).

## Does the presentation now match the canon?

Yes, structurally: one aligned footprint; Showroom at grade; a dedicated Loading Dock below it
with an exterior ramp to a flat apron and the truck against the dock wall; B-numbering starting
below the dock; visible stairs from the start; freight core reserved; mixed rooms on shared
floors; bay-partitioned strips with build-mode guides that vanish in play; equipment giving rooms
their identity; staff, needs and blockers readable on the building without opening the inspector.
The remaining gaps above are content and polish, not geometry.
