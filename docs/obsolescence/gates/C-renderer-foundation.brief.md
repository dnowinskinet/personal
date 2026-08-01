# Gate C — Renderer foundation

**Written:** 2026-07-31
**Status:** **BRIEFED, NOT STARTED.** This gate may not open until Gates A and B pass (D-004).
Gate A's two human questions have not been run and Gate B has not been briefed.
**Stack:** Phaser 4.2.1, single-stack, judged against absolute bars (D-033, C-41).

Per [README.md](README.md), a brief is written before the work and **does not change once the gate
starts**. Everything below is fixed at that moment. Nothing here authorises starting.

---

## Naming

This gate is **"Gate C — Renderer foundation."** It is *not* "Renderer Foundation M2" and not
"Milestone 2". Milestone 2 already means elevators, materials, hiring/economy and facility
persistence in `CURRENT-STATE.md` and `FOUNDATION-M1-RESULTS.md`. Reusing the number would make
every future handoff ambiguous about which body of work is meant.

## Hypothesis

> Phaser 4 can draw and animate the canonical tower **from simulation snapshots alone**, hitting
> R8's performance budgets on the 1024×640 design floor and remaining genuinely playable at
> 390×844 — without the renderer becoming a second source of game truth.

The falsifiable half is the last clause. A renderer that looks correct by keeping its own copy of
where workers are has failed this gate even if it runs at 60 fps, because it has destroyed the
property that makes the simulation testable.

## Why this gate exists at all

M1 proved the simulation. D-032's SVG tower proved the *composition* — the stack, the ramp, the
dock, the mirrored projection — and it is a real, working, diagnostic-grade view. What neither
proved is that the drawing approach survives contact with animation, asset loading, a camera, a
phone, and 20+ moving figures. The SVG scene is ~440 elements at fixture scale with 3–5 staff. The
capability ladder is 32 floors (C-44) and the crowd target is well past 5.

## Prerequisites — resolve before the gate opens, not during

These are open questions that **block Gate C** and are not the renderer's to decide:

| Item | What is missing | Who decides |
|---|---|---|
| **G-08 — active-floor budget** | R3 asked R8 to freeze how many floors may be simulated *and rendered at full detail* simultaneously. R8 froze supported floor count instead and never answered. C-30's attempted number was rejected (U-04). | Design + measurement. Pick before the camera is written; the camera's LOD policy depends on it. |
| **G-09 — camera bounds at the extremes** | No report defines clamping, overscroll, rubber-banding, or what is visible above the roof and below the deepest basement. | Design. Cheap to decide, expensive to retrofit. |
| **Q-004 — the mockups** | Still not in the repo. D-032 fixed the *structural* composition, so this no longer blocks composition — but it does block any claim of art-direction parity. | Daniel retrieving them. |

**C-43 is the governing rule and is not negotiable:** camera state and device load may change only
what is **drawn**, never what is **simulated**. An LOD system that skips ticks has failed the gate.

## What is real

**Architecture — the non-negotiable part.**

- Angular owns the route, the accessible HUD, menus, reports, inspectors, scenario controls, and
  authoritative simulation scheduling. Angular converts renderer intents into existing simulation
  calls.
- The pure-TypeScript simulation remains the only authority on ticks, jobs, qualifications, needs,
  topology, room validity, reservations, output and construction outcomes. It gains no Phaser,
  Angular, DOM or wall-clock import. **Scenario results stay byte-identical** — that is the
  regression test for this whole claim.
- Phaser draws, animates, and emits intent. It never advances a tick from `Scene.update()`, and
  sprite position, animation state and camera state are never game truth.

**The boundary comes first, before any scene code.** As of D-034 the checker covers
`createFacility`, `tickFacility` and `applyConstruction`, so `render/` already cannot reach them.
Gate C should go further and prefer a stricter shape: Phaser-facing files import **render contracts
only**, not `sim/index` at all. The layer graph must let `presentation/` mount the renderer without
letting `render/` depend on `presentation/`.

**The render contract.** An immutable `FacilityRenderSnapshot` DTO carrying only what is needed to
draw — never the live `FacilityState`. At minimum: authoritative and prior tick; floors and
canonical level names; rooms (id, type, level, span, validity, quality, access/door); equipment
(instance, definition, role, occupancy, anchor); workers (id, profession, state, current and prior
logical position, path, reservation, destination, need warnings, blocker code and text, selected);
the exterior geometry for ramp, apron, cores and street; Angular-supplied build-draft state; and
stable IDs for everything drawable. A separate `RendererIntent` union covers `select-worker`,
`select-room`, `clear-selection`, `focus-floor`, `propose-room-span`, `confirm-room`, `cancel-room`.

**Scenes and lifecycle.** `BootScene` → `PreloadScene` → `FacilityScene`, behind a narrow
`PhaserFacilityRenderer` adapter (`mount` / `updateSnapshot` / `resize` / `setPaused` / `destroy`)
and an Angular `PhaserFacilityHostComponent`. Destroy must remove canvases, observers, listeners,
timers and Phaser resources. **SSR must never instantiate Phaser** — the site's nine prerendered
routes are not allowed to regress.

**Loading.** `PreloadScene` uses an explicit manifest/bundle structure even while every asset is a
placeholder: `boot`, `common-structure`, `office`, `showroom`, `industrial`, `workers`, `effects`.
Branded progress and a recoverable error state. No blank canvas during init.

**Camera.** Fit-to-building, smooth vertical pan, bounded zoom, focus-floor, horizontal pan when
zoomed, responsive resize, sensible restoration after a renderer-mode switch. Bounds per G-09.

**Build mode.** The authoritative 20-cell geometry is retained — **Q-008 is a simulation decision
and this gate does not pre-empt it.** Do not reinterpret twenty cells as ten bays. Desktop gets
drag-to-preview a contiguous span with distinct valid/invalid feedback; phone and assistive paths
get tap-start / tap-end / confirm. **No meaningful construction action may require hover or
precision dragging** (I-014). Confirmation routes through the existing `applyConstruction` path;
Phaser never touches room arrays.

**Worker motion.** Simulation stays at 10 Hz; Phaser interpolates prior→current at display rate
(I-005). Visible idle, walking, working, sitting/using-amenity and blocked states. Simulation travel
completion is never derived from animation completion.

**Shell.** In immersive mode the route drops the ordinary site footer, reduces the navbar to a
compact way back, and lets the building own the viewport. The Angular HUD layers above or beside the
canvas without squeezing the building; inspectors and scenarios move into drawers. All Angular text
and controls stay keyboard- and screen-reader-accessible.

**The SVG diagnostic view survives.** A developer-facing toggle between Phaser and the D-032 SVG
scene. All nine inspector questions keep working in SVG mode. **The SVG is not deleted until Phaser
has equivalent diagnostic coverage** — it is the only thing that can arbitrate "is the renderer
lying?" during this gate.

## What is fake

- **Art.** A procedural or repository-local placeholder modular kit. Concept-render parity is Gate
  H, 6–8 months out (D-004), and claiming it here is out of scope and will not be believed.
- **Animation content.** Placeholder frames are fine; the state machine and the interpolation are
  not.
- **Audio.** Structure only, if anything. No audio content.
- **The Campaign tab.** Still pre-canon, still the D-026 skeleton. Not this gate's problem.
- **Economy, elevators, materials, hiring, persistence.** Milestone 2. Untouched.

Explicitly forbidden as a shortcut: **turning the existing SVG into a texture**, or repainting the
scene as one background image. That would pass the visual bars while proving nothing the gate
exists to prove.

## Pass condition

N=1, scenario-denominated (D-003). No tester panels.

**Automated — all must hold:**

1. `npm run oi:test` passes; **all 105 simulation tests unchanged and passing**.
2. `npm run verify` passes; nine routes still prerender; lazy-loading intact.
3. **All ten scenario JSON results byte-for-byte identical** to pre-gate output.
4. Phaser code cannot reach simulation mutation APIs (checker + regression cases).
5. The renderer never advances a tick — proven by test, not by inspection.
6. Exactly one canvas after route remounts and renderer toggles; mount/destroy/mount leaves nothing
   behind.
7. Zero unknown browser errors on the route. The pre-existing site-wide
   `InvalidStateError: Transition was aborted` noise (reproduces on `/about`) does not count.
8. SSR/build test proving Phaser is never instantiated server-side.
9. Screenshot fixtures render at 1440×900, 1024×640 and 390×844.

**Measured and reported — numbers, not adjectives:**

- Obsolescence lazy-chunk size before and after. Baseline measured 2026-07-31 from `npm run verify`:
  **browser `obsolescence-game` chunk 131.48 kB raw / 32.82 kB estimated transfer.** The recorded
  first-playable budget is 12 MiB.

  **Read the right chunk.** The build emits *two* lazy chunks named `obsolescence-game` — the
  browser bundle (`.js`, with a transfer column) and the SSR bundle (`.mjs`, 131.55 kB, no transfer
  column). Only the browser one is the budget. They differ by ~0.07 kB, so quoting the wrong one
  looks plausible and is wrong; this is exactly the confusion Phaser's runtime will make expensive.
- Initial route asset transfer.
- Steady-state frame rate on F01.
- Frame rate on a **20-worker fixture**.
- Simulation tick p95.
- Approximate tab memory, if the available tooling supports it.

**Human — Daniel's, and the only ones that can actually pass this gate:**

- At 1024×640 (C-40, the design floor), is the building the primary surface rather than an
  illustration inside a page?
- At 390×844, is the floor-focus camera a deliberate experience rather than a 680 px surface
  scrolled inside a 366 px container?
- Do 20 workers moving at once read as a *working building* rather than as sprites sliding?

## Kill condition

Stop or switch to the Pixi fallback — do not iterate — if:

- Holding 60 fps at the C-44 capability ladder requires the renderer to cache or derive simulation
  state, or to skip ticks (C-43 violation). **This is the disqualifying failure.**
- The lazy chunk cannot be kept within the first-playable budget with Phaser's runtime included.
- Phaser cannot be excluded from SSR without breaking prerendering or the Pages deployment.
- Phone interaction cannot meet I-014 without hover or precision dragging.
- Mount/destroy leaks canvases or listeners in a way the adapter cannot contain.

The named fallback is PixiJS 8.x (D-033). It is **not** pre-approved at any version and needs a
fresh dependency approval if a switch trigger fires.

## Work forbidden before pass

- Installing `phaser` before this gate opens — and it does not open until Gates A and B pass.
  `phaser@4.2.1` is version-settled (D-033) and still uninstalled.
- Any package beyond that single pin: no Phaser Editor, no Phaser Game Agent, no ECS, no Grid
  Engine, no physics middleware, no atlas/spine toolchain. Each needs its own approval.
- Deleting the SVG diagnostic renderer.
- Re-chunking the 20-cell bay grain (Q-008 — simulation geometry, decided from play).
- Production art, audio content, or anything that presents itself as Gate H.
- Touching GriftOS.
