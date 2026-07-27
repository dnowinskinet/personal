# Obsolescence, Inc. — Architecture

**Status: RATIFIED, NOT YET IMPLEMENTED.** The repo shape below was approved 2026-07-26 — see
[DECISIONS.md](DECISIONS.md) D-011. Build against it. Nothing in it exists on disk yet.

Constraints that are settled live in [INVARIANTS.md](INVARIANTS.md).

---

## Inherited from R8 (high confidence)

R8 is the architecture report and its core conclusions are well-argued and specific:

- Angular shell with a **lazy-loaded game route**; Angular owns all text-heavy and accessible UI.
- **PixiJS 8.x** as the provisional renderer; **Phaser 4** as the defined fallback with named
  switch triggers.
- **Pure TypeScript deterministic simulation core** — no Angular imports, no renderer imports.
- **10 Hz authoritative tick** with renderer-side interpolation.
- Worker-capable sim host abstraction: `DedicatedWorkerSimHost` for production,
  `InlineSimHost` for dev, SSR, and tests.
- **IndexedDB** saves via `idb` (~1.19 kB), `fake-indexeddb` for tests, versioned migrations.
- Stable entity IDs in saves — never positional indices.
- Lane/graph pathing, not continuous pathfinding over arbitrary geometry.
- Domain registries and typed content packs, **not** a generic ECS.
- GitHub Pages first; Cloudflare Pages / R2 as a defined escalation ladder.

### R8 budgets

| Budget | Target | Warning | Review trigger |
|---|---:|---:|---:|
| First-playable download | 12 MiB compressed | 15 MiB | 20 MiB |
| Desktop framerate | 60 fps normal | 50 fps stress | below 45 fps stress |
| Phone framerate | 45 fps normal | 30 fps stress | below 30 fps normal |
| Simulation p95 tick | < 2 ms normal | < 5 ms stress | > 8 ms stress |
| Tab memory | < 220 MB desktop | < 300 MB | > 350 MB |
| Save size per campaign | < 5 MB | < 10 MB | > 20 MB |
| Annual hosting spend | $0–25 | < $100 | review above $100 |

### Visual ceiling

Stylized modular 2D kits, not bespoke per-room art. Build **families** — office kit, showroom kit,
industrial kit, service kit, waste kit, worker body kit, product silhouette grammar, incident FX
kit — and recombine them. R8 is explicit that mockup-level bespoke art for every floor permutation
is unsustainable asset debt for one developer.

---

## Repo shape

**In-app feature root with enforced boundaries — not an npm workspaces monorepo.** Ratified as
D-011.

```
src/app/games/obsolescence/
  sim/           pure TS, deterministic, zero Angular/Pixi/DOM imports
  content/       validated data registries (products, components, incidents, segments)
  persistence/   IndexedDB via idb, versioned migrations
  presentation/  Angular-facing view models
  render/        replaceable renderer adapter (reads state, never mutates)
  devtools/      scenario loader, seed control, pause/step/speed, state jump
  tests/
```

Supported by:

- `tsconfig` path aliases (`@oi/sim`, `@oi/content`, …) so imports read like package imports.
- A boundary-check script modeled on `scripts/check-grift-boundaries.mjs`, wired into `npm run oi:test`.
- A separate `tsconfig.sim.json` plus a Node runner so the simulation runs headless with no browser.

### Why not workspaces

R8 and R9 both recommend `packages/sim-core`, `packages/game-renderer`, and friends. That advice was
written without knowing this repo is a single Angular project with a working SSR + prerender +
ghpages pipeline. Converting to workspaces means touching `angular.json`, the SSR build, the deploy
step, and CI — a migration project competing with actually building the game, before anyone knows
whether the game is fun.

### Why this is not a one-way door

Because everything sits behind path aliases with zero Angular imports, promoting `sim/` to a real
workspace package later is `git mv` plus a workspaces declaration. Earn the migration; do not
pre-pay for it.

### Folder location

`src/app/games/`, *outside* `experimental/`, even though the route stays
`/experimental/obsolescence` — `experimental/` is where the small toys live.

### Approved dependencies

Only these three, per D-012. Everything else needs fresh approval.

| Package | Purpose | Scope |
|---|---|---|
| `idb` | IndexedDB wrapper for saves | runtime |
| `fake-indexeddb` | IndexedDB in Node tests | dev only |
| `@playwright/test` | Desktop and phone test matrix | dev only |

`pixi.js` and `phaser` are **not** approved. Do not install them before Gate C starts.

---

## Acceptance criteria for the first milestone (Gates A + B)

1. A quarter can be played start to finish on desktop **and** phone.
2. The same seed and decisions produce the same outcome.
3. The simulation runs in tests without Angular.
4. Saves survive a schema migration.
5. A new component can be added mostly through content definitions.
6. Playwright can jump directly to launch, deadline, and consequence states.
7. No decision has been made that prevents Pixi or Phaser from becoming the renderer.
8. The existing website and GitHub Pages deployment remain intact.

### The extension test

The real proof that the architecture is extensible: add a replaceable-versus-glued battery
architecture affecting product thickness, manufacturing difficulty, repair demand, customer
preference, support burden, and the next quarter — **without changing the simulation kernel**.

If that requires kernel surgery, the architecture failed.

---

## Known capability gap

Record it; do not work around it.

The agent can write SVG masters programmatically, build and pack sprite atlases, implement
tint/variant/decal systems, generate procedural props and floor-shell geometry, write the whole
atlas build pipeline, and produce anything code-driven — overlays, particles, UI. It **cannot**
produce painterly or hand-illustrated work with a coherent authored style.

R8's pipeline calls for "vector or layered painted masters". The *painted* half is a human or
image-model job and must arrive as files. This is the single largest asset-side gap in the project.
It blocks Gate H, not Gate A.
