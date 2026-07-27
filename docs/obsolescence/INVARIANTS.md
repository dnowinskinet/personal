# Obsolescence, Inc. — Invariants

Durable constraints paired with the mechanism that enforces each one.

This file exists so that an agent adding a feature months from now cannot silently violate a
decision made today. The pattern is borrowed from `docs/griftos/INVARIANTS.md`, which is the best
documentation practice in this repository — the borrowing is of the *pattern only*, not of any
GriftOS content or authority (see [DECISIONS.md](DECISIONS.md) D-001).

## Legend

| Status | Meaning |
|---|---|
| `ENFORCED` | An automated check fails if this is violated. The check is named. |
| `PLANNED` | Agreed constraint, enforcement not yet built |
| `MANUAL` | Enforceable only by review; no automated check is practical |

**Rule:** when you build an enforcing check, change the status in the same commit and name the file.
When you add an invariant with no check yet, mark it `PLANNED` — do not overstate.

## Enforcement mechanisms

| Command | What it does |
|---|---|
| `npm run oi:arch` | AST-based boundary check (`scripts/check-obsolescence-boundaries.mjs`) |
| `npm run oi:arch:test` | Regression suite **for the boundary check itself** |
| `npm run oi:pure` | Compiles `sim/` with no DOM library and no Node types |
| `npm run oi:sim` | Purity gate, then the headless kernel test suite under `node --test` |
| `npm run oi:test` | All of the above |
| `npm run verify` | Site lint and production build |

All of these run in CI on Linux, and `oi:test` also runs on Windows because `oi:sim` passes a glob
to `node --test` and glob handling differs between platforms.

### Why the boundary check has its own tests

The first version scanned source text with regular expressions. Adversarial testing found **nine
ways through it and five ways to make it reject valid code**. It now parses a real TypeScript AST,
and every one of those fourteen findings is a case in `oi:arch:test`. A checker with no tests of its
own is an assertion, not an enforcement mechanism.

### Known limits — stated, not papered over

- **String concatenation is invisible.** `'grift' + '-os'` defeats the I-011 literal check. Caught by
  review, not by tooling.
- **"Does this mutate?" is not a syntax question.** I-002 is enforced by forbidding the renderer to
  *reach* state-mutating exports, which is a proxy. A renderer that mutates state it already holds
  would pass.
- **New path aliases are not read from `tsconfig.json`.** The checker knows about `@oi/*`. Adding a
  different alias to the same directories would create a blind spot.
- **Migration fixtures do not exist yet.** I-008 currently proves versioning and round-tripping, not
  that a v1→v2 migration works. That arrives with the persistence layer in Gate B.

---

## Architecture boundaries

### I-001 — The simulation imports nothing from Angular, Pixi, the DOM, or Node

`sim/` is pure TypeScript. It must run identically in a browser, a worker, and a bare Node process.

- **Why:** it is the precondition for headless tests, deterministic replay, worker hosting, and
  promoting `sim/` to a standalone package later without a migration. R8 treats this as the
  load-bearing architectural decision.
- **Enforcement:** `ENFORCED`, two independent mechanisms.
  - `oi:arch` — an **allowlist**: `sim/` may import only relative paths resolving inside `sim/`.
    Nothing external is permitted. An allowlist is used because a denylist has to enumerate every
    renderer and framework that will ever exist, and the first version was defeated by `@pixi/app`
    after correctly blocking `pixi.js`.
  - `oi:pure` — compiles `sim/` with `lib: ["ES2022"]` and `types: []`, making `document`, `window`,
    `localStorage`, `fetch`, `process`, `require` and `Buffer` **compile errors**. The compiler does
    this with real scope analysis, so a domain parameter named `document` or `process` is correctly
    allowed. That distinction matters here: this is a game about office equipment and paperwork.

### I-002 — The renderer reads state and never mutates it

Rendering is a projection. All state change flows through simulation commands.

- **Why:** the moment the renderer can write, determinism and replay die, and the Pixi-versus-Phaser
  decision stops being reversible.
- **Enforcement:** `ENFORCED` (by proxy) — `oi:arch` forbids `render/` from importing any
  state-mutating export, covering named imports, namespace imports (`sim.applyCommand(…)`),
  destructured dynamic imports, and paths that walk out of the feature root and back in. It also
  forbids `content/` from re-exporting those symbols, which would otherwise launder them into an
  allowed layer. See the limits section — this proves the renderer cannot *reach* mutation, not that
  it never mutates.

### I-003 — Presentation and content may depend on the simulation; never the reverse

Dependency direction is one-way: `sim` ← `content` ← `presentation`/`render`, with `devtools` and
`tests` permitted to reach everything.

- **Why:** prevents the circular dependencies that make a simulation untestable in isolation.
- **Enforcement:** `ENFORCED` — `oi:arch` resolves every specifier to an absolute path and tests
  containment in the feature root, so `../../obsolescence/content/x` is caught as readily as
  `../content/x`. Files in directories outside every known layer are rejected outright rather than
  silently skipped.

---

## Determinism

### I-004 — Same seed plus same command log produces the same outcome

- **Why:** the foundation of the entire N=1 validation model (D-003). Balance sweeps, regression
  tests, and bug reproduction all depend on it.
- **Enforcement:** `ENFORCED` — `tests/sim/determinism.test.ts`, including negative controls that
  fail if `verifyReplay` were to return true unconditionally.

### I-005 — The authoritative tick is 10 Hz; rendering interpolates and never advances state

- **Why:** R8's recommendation. Cheap replay, simple pause/step/speed, and enough temporal
  resolution for believable movement once the renderer interpolates between ticks.
- **Enforcement:** `ENFORCED` — `tests/sim/determinism.test.ts`.

### I-006 — No wall-clock time, `Math.random`, or ambient nondeterminism inside the simulation

All randomness comes from the seeded generator; all time comes from the tick counter.

- **Why:** without this, I-004 is unachievable.
- **Enforcement:** `ENFORCED` — `oi:arch` rejects `Math.random`, `Date.now`, `new Date`,
  `performance.now`, `crypto` randomness, `process.hrtime`, `globalThis`, and destructured aliases
  such as `const { random } = Math`. `tests/sim/determinism.test.ts` additionally proves the seeded
  generator is reproducible, well-distributed, and correctly bounded.

---

## Persistence

### I-007 — Saves reference stable entity IDs, never positional indices

Inserting an entity must not invalidate a save.

- **Why:** R8 names this explicitly. Positional addressing makes every future content addition a
  migration.
- **Enforcement:** `ENFORCED` — `tests/sim/identity.test.ts`, including the insertion scenario the
  invariant exists for, and a check that prototype keys cannot masquerade as entities.

### I-008 — Every save carries a schema version, and migrations are tested

- **Why:** the campaign is long and the content will change under existing saves.
- **Enforcement:** `ENFORCED` for versioning and lossless round-trip
  (`tests/sim/serialization.test.ts`). **`PLANNED`** for migrations — no v1→v2 fixture exists yet
  because there is only one schema version. Build it with the persistence layer in Gate B.

### I-009 — Saves are local-only

IndexedDB plus export/import. No accounts, no cloud sync, no server-held state.

- **Why:** static deployment with no backend is a project constraint, not a phase.
- **Enforcement:** `MANUAL` until the persistence layer exists; then folded into I-010's check.

---

## Scope constraints

### I-010 — No backend, no accounts, and no runtime LLM calls

No network requests at runtime beyond loading static assets.

- **Why:** static Pages deployment, zero hosting cost, no latency or policy surface, and
  reproducibility. R8 rejects runtime LLM content generation explicitly.
- **Enforcement:** `PLANNED` — a test asserting no unexpected network activity during a scripted
  run. Partially covered today: `oi:arch` forbids `sim/` from importing anything external at all,
  and `oi:pure` makes `fetch` and `XMLHttpRequest` compile errors there.

### I-011 — Obsolescence never touches GriftOS

No imports from, edits to, or shared storage keys with `grift-os-game` or `docs/griftos/`.

- **Why:** D-001.
- **Enforcement:** `ENFORCED` — `oi:arch` rejects any import specifier or string literal matching
  GriftOS, including template literals. Concatenated keys are a known limit.

### I-012 — The site keeps working

SSR, prerendering, lint, build, and the GitHub Pages deployment must not regress.

- **Why:** this is a personal site first and a game host second.
- **Enforcement:** `ENFORCED` — `npm run verify` plus `.github/workflows/verify.yml` on Linux and
  Windows.

### I-013 — No dependency is added without explicit approval

Approved so far (D-012): `idb`, `fake-indexeddb`, `@playwright/test`. Nothing else.

- **Why:** bundle size, licence surface, and long-term maintenance all land on one person.
- **Enforcement:** `MANUAL` — review of `package.json` diffs.

---

## Playability

### I-014 — Every meaningful action is possible on phone

Desktop may be faster and denser. It may not be the only place a decision can be made.

- **Why:** R4 and R8 both treat mobile as a systems filter rather than a polish task. A design that
  needs hover or drag-routing has already failed.
- **Enforcement:** `PLANNED` — Playwright projects at desktop and phone viewports over the same
  scripted flows. Needs Gate B.

### I-015 — Scripted states are directly reachable for testing

Launch, deadline, and consequence states can be jumped to without playing a full quarter.

- **Why:** iteration speed, and a precondition for the legibility probes in D-003.
- **Enforcement:** `PLANNED` — scenario loader in `devtools/` plus Playwright entry points. Needs
  Gate A.
