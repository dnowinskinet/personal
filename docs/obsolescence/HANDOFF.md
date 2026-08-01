# Obsolescence, Inc. — Session Handoff to Claude Code

**Date:** 2026-07-26
**From:** a Claude (Cowork) planning conversation with Daniel
**Purpose:** Everything needed to pick this up in Claude Code with no prior context.
**Status:** Pre-planning complete. The project plan itself has NOT been written yet — writing it is the first task.

---

## 1. What this project is

**Obsolescence, Inc.** (working title) is a pausable real-time management game about designing,
launching, supporting, repairing, replacing, and disposing of consumer product lineups from one
flagship building that remembers its own promises.

- Thematic thesis: *the showroom is the story the company tells; the basement is how that story is produced.*
- Core loop: define lineup → allocate capacity and promises → survive production uncertainty →
  stage launch → absorb consequences → begin next quarter with residue.
- Target: desktop web and mobile web, single-player, statically deployed, no backend.
- It will live on Daniel's personal Angular site at dnowinski.com, reachable from the
  **Experiments** area of the navbar.

Nine research reports (R1–R9) already exist. They are thorough and current (all authored
2026-07-26, produced with GPT-5.6 Deep Research).

---

## 2. Where the research lives

The R1–R9 docs are in the **claude.ai Project "Obsolescence, Inc."**, not on disk. In Claude Code
they will need to be exported/copied into the repo. Titles:

| Doc | Subject |
|---|---|
| R1 | Core loop and launch cadence |
| R2 | Product line content system |
| R3 | Flagship building and flow |
| R4 | Development factory and operations |
| R5 | Showroom, market and customers |
| R6 | Campaign generations and progression |
| R7 | Satire, player role and tone |
| R8 | Browser architecture, visual feasibility, AI capability |
| R9 | Prototype and product brief plan (**marked partial**) |

Total ≈ 150 KB / ~38k tokens. Small enough to read in full.

**R9 is self-declared provisional** because the Deep Research run that produced it did not have
R1–R8 attached — it worked from a summary brief. Its gate architecture is still very good and is
the backbone of the plan below.

**Important:** a rerun of R9 as Deep Research is probably unnecessary. R9's only stated weakness
is missing attachments; an agent that can read all nine docs directly can do the cross-report
reconciliation itself. Treat that reconciliation as a planned work phase, not an external
dependency.

### Key contents of R8 (architecture) — already decided, high confidence

- Angular shell + **lazy-loaded game route**; Angular owns all text-heavy/accessible UI.
- **PixiJS 8.x** as provisional renderer; **Phaser 4** as the defined fallback with named triggers.
  *(Accurate as a report of R8. The ordering was reversed on 2026-07-31 by D-033 — Phaser 4 is now
  provisional, Pixi the fallback. See CURRENT-STATE.md; this document is historical.)*
- **Pure TypeScript deterministic simulation core** — no Angular imports, no renderer imports.
- **10 Hz authoritative tick** with renderer-side interpolation.
- Worker-capable sim host abstraction (`DedicatedWorkerSimHost` + `InlineSimHost` for
  dev/SSR/test).
- **IndexedDB** saves via `idb` (~1.19 kB), `fake-indexeddb` for tests; versioned migrations.
- Stable floor instance IDs in saves — never positional indices.
- Lane/graph pathing, not continuous pathfinding.
- Domain registries and typed content packs, **not** a generic ECS.
- GitHub Pages first; Cloudflare Pages / R2 as a defined escalation ladder.
- Budgets: first-playable ≤12 MiB compressed, 60fps desktop / 45fps phone normal load,
  sim p95 tick <2 ms, save <5 MB, tab memory <220 MB.
- Visual ceiling: **stylized modular 2D kits**, not bespoke per-room art. Build *families*
  (office kit, showroom kit, industrial kit, service kit, waste kit, worker body kit, product
  silhouette grammar, incident FX kit), not rooms.

### Key contents of R9 (production plan)

- Gate ladder A→I: lineup prototype → one-quarter gray box → renderer gauntlet → showroom launch →
  cross-generation battery benchmark → chapter prototype → six-quarter compression → visual
  vertical slice → first public playable.
- Working campaign assumption: **15 quarters / 5 chapters / one product category / 3 visual waves**
  (down from an 18-quarter ambition).
- Canonical test scenario: `LARK` handheld family — M1 Lite (carryover), M2 Standard, M2 Pro,
  plus a `DockPass` service/accessory slot. Central tension is sealed high-density battery vs.
  serviceable modular pack, with a late ambiguous thermal test signal.
- The **battery causal chain** is the canonical legibility test: design choice → supplier →
  test signal → yield → launch claim → customer use → delayed defect → returns/diagnostics/repair →
  reserve consumption → refurb → cohort compression → later resurfacing.

---

## 3. State of the repository (verified this session)

Repo: `C:\Users\dnowi\Documents\Github\personal` — deployed to dnowinski.com via GitHub Pages.

**Stack:** Angular **21.2** with SSR + prerendering, TypeScript 5.9, Node 22, npm 10,
Tailwind **3** (v4 explicitly deferred), ng-bootstrap 20, FontAwesome Pro (private registry),
Express 5 server, Karma/Jasmine tests, ESLint 10.

**Structure:** hybrid — classic `AppModule` plus standalone components. `src/app/` has
`core/ data/ icon/ layout/ pages/ shared/`. Games live under `src/app/pages/experimental/`.

**Existing experimental games:** grift-os-game, ai-settlement-game, sudoku-game,
model-grip-game, senator-matching-game, game-prototype, degrees.

**GriftOS** is the mature one: ~57 files, ~480 KB including tests, cleanly layered into
`game-engine / content / presentation / runtime / audio / empires / host / playtest /
economic-slots / formatting`. It has a real architecture guard (`scripts/check-grift-boundaries.mjs`)
wired into `npm run grift:test`. **This is the single best-engineered thing in the repo and its
boundary-check pattern should be copied.**

**Scripts:** `verify` (lint+build), `grift:test`, `grift:arch`, `deploy:pages`, `icons:sync`,
`game:balance`.

### ⚠ Critical trap for any agent

`AGENTS.md` at the repo root **claims site-wide authority but is entirely GriftOS-specific.** Its
source-precedence order points at `docs/CURRENT-STATE.md` and `docs/ARCHITECTURE-MAP.md`, both
GriftOS documents. **All 20 files in `/docs` (~275 KB) are GriftOS, not site-level.** Daniel
confirmed: *"none of the directions like that and absolutely nothing in Docs was written as
intended for you at all."*

An agent that reads `AGENTS.md` cold will inherit GriftOS's assumptions about layer ownership,
save keys, and visual doctrine and apply them to Obsolescence. **Fixing this is task zero.**

There is currently **no site-level architecture documentation at all**.

---

## 4. Decisions made in this conversation

1. **GriftOS and Obsolescence are entirely unrelated.** The only shared surface is a navbar entry
   under Experiments. No code, doctrine, saves, or content are shared.
2. **Daniel is not the coder. The agent is the implementer**, end to end. R8's proposed
   "Codex implements / Claude reviews" split is not in play.
3. **Playtesting is Daniel alone. N=1.** This invalidates R9's entire gate structure as written
   (every gate passes on "5 of 7 testers can explain…"). See §6.
4. **Target for the first milestone is Gate A + Gate B**, not a visual vertical slice. R9 puts the
   vertical slice at Gate H, ~6–8 months in, and argues convincingly that a beautiful cutaway
   validates taste but proves nothing about whether choosing a lineup is fun.
5. **Working title stays "Obsolescence, Inc."**; route `/experimental/obsolescence`.
6. **Cadence is opportunistic** — Daniel works on it when he feels like it. No deadlines. Sessions
   must therefore be cheap to resume, which makes the boot sequence (§7) load-bearing rather than
   nice-to-have.
7. **FontAwesome Pro / cloud dependency is to be killed.** Local-only icons. Partially done
   already: `src/assets/fontawesome/icons/` + `icons.manifest.json` +
   `scripts/sync-fontawesome-icons.mjs`. Separable task, not part of Obsolescence.
8. **The senator-matching game will eventually be deleted.** Reclaims ~21 MB of unoptimized JPEGs
   in `src/assets/senators/` (cruz.jpg is 4.2 MB, rubio.jpg 5.7 MB). Meaningful against R8's
   12 MiB first-playable budget.

---

## 5. Recommended repo shape (recommendation given, not yet ratified)

**In-app feature root with enforced boundaries — NOT an npm workspaces monorepo.**

R8 and R9 both recommend `packages/sim-core`, `packages/game-renderer`, etc. That advice was
written without knowing the repo is a single Angular project with a working SSR + prerender +
ghpages pipeline. Converting to workspaces means touching `angular.json`, the SSR build, the
deploy step, and CI — a migration project competing with actually building the game, before
anyone knows the game is fun.

Proposed instead:

```
src/app/games/obsolescence/
  sim/           pure TS, deterministic, zero Angular/Pixi imports
  content/       validated data registries (products, components, incidents, segments)
  persistence/   IndexedDB via idb, versioned migrations
  presentation/  Angular-facing view models
  render/        replaceable renderer adapter (reads state, never mutates)
  devtools/      scenario loader, seed control, pause/step/speed, state jump
  tests/
```

- `tsconfig` path aliases (`@oi/sim`, `@oi/content`, …) so imports read like package imports.
- A boundary-check script modeled directly on `check-grift-boundaries.mjs`, wired into
  `npm run oi:test`.
- A separate `tsconfig.sim.json` + Node runner so the sim runs headless with no browser.

**Why this is not a one-way door:** because everything sits behind path aliases with zero Angular
imports, promoting `sim/` to a real workspace package later is `git mv` plus a workspaces
declaration. Earn the migration; don't pre-pay for it.

Folder sits at `src/app/games/`, *outside* `experimental/`, even though the route stays
`/experimental/obsolescence` — `experimental/` is where the small toys live. This is low-stakes;
align them if preferred.

---

## 6. Solo playtesting — R9's gates must be rewritten

Every R9 gate has a pass condition of the form "at least 5 of 7 testers can explain X." With N=1
that architecture is void. Replacement:

**Dominance and balance — fully solvable, better than humans.** Write policy bots
(durable/service-heavy, premium/integrated, scale-first), run them across hundreds of seeds
headless, and check whether any single posture wins profit *and* trust *and* resilience
simultaneously. Seven humans playing twice would never find that; a sweep finds it in a minute.
GriftOS already does this with `balance-sim.ts` + `scripts/grift-os-balance-report.mjs`.

**Legibility — partially solvable; the agent is a usable instrument.** Show the agent only what
the UI shows a player after a run, with the underlying decision chain withheld, and ask it to
reconstruct why the battery failed. This is a genuine cold read because the source can be denied.
It tests whether the *inspector* explains itself. It does **not** test whether a distracted human
notices it.

**Chore-feel and fun — not solvable. Do not pretend otherwise.** The only honest solo signal is
behavioral: does Daniel voluntarily open it again, unprompted, days later. Instrument that — log
seed, decisions, timestamps, pauses, panel-opens, and the gap since last session. Weak per
observation, honest in aggregate, and it's what's actually available.

**Time-delayed self-review** covers memory and resurfacing (R6's compression model): play a
campaign, wait three weeks, load cold, try to explain your own installed base before opening the
inspector.

So the gates become: mechanical proofs the agent runs continuously, legibility probes it runs on
demand, and **two named human gates that are Daniel's alone** — *does this feel like chores* and
*does this look right*. Keep those two explicit so they can't be silently faked.

---

## 7. Documentation layout (proposed) and the boot sequence

**Dividing line:** if a coding agent needs it while writing code, it lives in the repo. If it's
for thinking with, it lives in the claude.ai Project.

```
AGENTS.md                    site-wide facts ONLY + router to per-game guides
docs/                        site-level only (build, deploy, verify, conventions)
docs/griftos/                everything currently in docs/ moves here, unchanged
docs/obsolescence/
  AGENTS.md                  agent contract for this game
  CURRENT-STATE.md           where we are; rewritten at the END of every session
  DECISIONS.md               append-only, dated, numbered, with rationale
  INVARIANTS.md              constraint -> the test that enforces it
  ARCHITECTURE.md
  OPEN-QUESTIONS.md
  research/                  R1-R9 mirrored in, frozen, read-only
  gates/                     one brief + one result per gate
```

R1–R9 get mirrored into the repo because agents need them at edit time and they are finished
artifacts that won't drift.

### The boot sequence — the actual answer to "how do I get up to speed"

Onboarding is not a one-time event; it's a **repeatable, budgeted read order** every future
session runs in its first few minutes:

1. `docs/obsolescence/AGENTS.md`
2. `docs/obsolescence/CURRENT-STATE.md`
3. `docs/obsolescence/INVARIANTS.md`
4. the active gate brief in `docs/obsolescence/gates/`

Nothing else unless the task demands it. This is what makes session 2 through session 80 cheap,
which matters enormously given the opportunistic cadence.

**Corollary:** every session must end by rewriting `CURRENT-STATE.md` and appending to
`DECISIONS.md`. This is non-negotiable, not housekeeping.

### On INVARIANTS

GriftOS's `docs/INVARIANTS.md` pairs each durable constraint with the test that enforces it, so an
agent adding a feature can't silently violate a decision made months earlier. It's the best
pattern in the repo. Obsolescence's first entries write themselves from R8:

- `sim/` imports nothing from Angular, Pixi, or the DOM.
- Saves reference stable floor/entity IDs, never positional indices.
- Authoritative tick is 10 Hz; rendering interpolates and never advances state.
- Same seed + same command log ⇒ same outcome.
- The renderer reads state and never mutates it.
- No runtime LLM calls. No backend. No accounts.

---

## 8. Recommended phase plan and effort levels

Effort tracks **synthesis density, not volume**. Reading is cheap; reconciling contradictions is
expensive.

| # | Phase | Effort | Notes |
|---|---|---|---|
| 0 | Mechanical inventory — file map, route table, build/test commands, dependency audit | **low** | Pure listing. |
| 1 | Doc triage: scope `AGENTS.md` down to site-level, move GriftOS docs to `docs/griftos/`, create `docs/obsolescence/` skeleton + boot sequence | **medium** | Removes the active trap in §3. Do this first. |
| 2 | Research synthesis: read all of R1–R9, produce one canon doc + an explicit contradictions & open-questions register | **high** | This *is* the R9 rerun. Nine independently written docs will disagree; every later decision inherits this. |
| 3 | Architecture ratification: repo shape decision, path aliases, boundary-check script, headless sim runner, INVARIANTS v1 | **medium** | Mechanics are known; judgment is bounded. |
| 4 | **Gate A** — lineup-decision prototype. Ugly. Angular HTML, colored blocks, no renderer. | **high** | Answers the only question that matters: is composing a lineup under deadline fun? |
| 5 | **Gate B** — one-quarter gray box: quarter clock, 4 offers, bay logic, launch, early returns, residue into Q2 | **high** for the sim/economy core, **medium** for UI | |
| 6 | **Gate C** — renderer gauntlet, Pixi vs Phaser, on a *real* scenario | **medium** | Mostly measurement against pre-written thresholds. |
| 7+ | Gates D–I per R9, re-scoped for N=1 | TBD | Do not plan past Gate C in detail. |

Do not escalate above **high** anywhere until phase 2 reveals how much R1–R9 actually conflict.
Max effort on clean inputs is just slow money.

### Acceptance criteria for the first milestone (Gates A+B)

Adapted from a GPT-5.6 memo Daniel shared; this list is good and should be kept nearly verbatim.

1. A quarter can be played start to finish on desktop **and** phone.
2. The same seed and decisions produce the same outcome.
3. The simulation runs in tests without Angular.
4. Saves survive a schema migration.
5. A new component can be added mostly through content definitions.
6. Playwright can jump directly to launch, deadline, and consequence states.
7. No decision has been made that prevents Pixi or Phaser from becoming the renderer.
8. The existing website and GitHub Pages deployment remain intact.

**The extension test** (the real proof the architecture is extensible): add a
replaceable-vs-glued battery architecture affecting product thickness, manufacturing difficulty,
repair demand, customer preference, support burden, and the next quarter — **without changing the
simulation kernel**. If that requires kernel surgery, the architecture failed.

---

## 9. Open items

**Blocking Gate C, not Gate A:**

- **The mockups.** R8 and R9 both treat them as composition canon. They are in neither the Project
  nor the repo. Daniel is retrieving them. Nothing before Gate C depends on them.

**Needs a decision:**

- Repo shape (§5) — recommendation made, not ratified.
- Approval to add `pixi.js` and (for the Gate C bake-off) `phaser`, plus `idb` and
  `fake-indexeddb`. Note the existing `AGENTS.md` rule: no new dependencies without explicit
  approval.
- Whether the game folder sits at `src/app/games/` or under `src/app/pages/experimental/`.

**Known agent-capability gap — record it, don't work around it:**

The agent can write SVG masters programmatically, build and pack sprite atlases, implement
tint/variant/decal systems, generate procedural props and floor-shell geometry, write the whole
atlas build pipeline, and produce anything code-driven (overlays, particles, UI). It **cannot**
produce painterly or hand-illustrated work with a coherent authored style, and had **no
image-generation tool available** in the originating session. R8's pipeline calls for "vector or
layered painted masters" — the *painted* half is a human or image-model job and must arrive as
files. This is the single largest asset-side gap in the project.

---

## 10. Suggested first message to Claude Code

> Read `docs/obsolescence/HANDOFF.md` in full. Then execute Phase 1 (doc triage): scope the root
> `AGENTS.md` down to genuinely site-wide facts, move all current `docs/` contents to
> `docs/griftos/` and fix inbound links, and create the `docs/obsolescence/` skeleton including
> `AGENTS.md`, `CURRENT-STATE.md`, `DECISIONS.md` (seeded with the eight decisions in §4), and
> `INVARIANTS.md` (seeded from §7). Do not touch any game code yet. Finish by writing
> `CURRENT-STATE.md`.
