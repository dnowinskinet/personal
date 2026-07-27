# Obsolescence, Inc. — Current State

**Last updated:** 2026-07-26
**Last verified against commit:** working tree following Phase 3
**Phase:** 1 and 3 complete. Phase 2 (research synthesis) is next.

This file is rewritten at the end of every session. It describes the present, not the history. For
history, read [DECISIONS.md](DECISIONS.md).

---

## Where the project actually is

The **substrate exists and is enforced**. There is no game yet.

`src/app/games/obsolescence/` holds a deterministic simulation kernel and a layer skeleton. Nine
invariants are executable rather than aspirational. There are no lineups, floors, bays, cohorts or
incidents — those are Gate A and Gate B.

Nothing is wired to a route, so the game currently adds **zero weight** to the site bundle.

## What just happened

**Phase 1 — doc triage.** Root `AGENTS.md` rescoped to site-wide facts plus a router; seventeen
GriftOS documents moved to `docs/griftos/` with a new `docs/griftos/AGENTS.md` holding the doctrine
removed from the root file. Three documents stayed in `docs/` because they are genuinely site-level
— the handoff's claim that all twenty were GriftOS was wrong, and moving `architecture.md` would
have buried the operator guide `README.md` points to. R1–R9 mirrored into `research/`, frozen.

**Phase 3 — architecture ratification.** Repo shape ratified (D-011), three dependencies approved
(D-012), and the substrate built:

- `sim/` kernel: 10 Hz clock, seeded RNG as a pure function of `(seed, cursor)`, ID-keyed state with
  a schema version, typed commands, pure reducers, `run`/`serialize` with canonical key ordering.
- Layer skeleton with per-directory ownership READMEs.
- `@oi/*` path aliases.
- AST-based boundary checker plus **its own regression suite**.
- Two sim tsconfigs: a purity gate with no DOM library and no Node types, and a test build.
- `oi:arch`, `oi:arch:test`, `oi:pure`, `oi:sim`, `oi:test` scripts, wired into CI on Linux **and**
  Windows.

**The boundary checker was rewritten after adversarial testing.** Seven agents attacked the first,
regex-based version across 62 probes and found nine ways through it and five ways to make it reject
valid code — including a `../../obsolescence/content/x` walk-out that defeated every layer rule at
once, and false positives on parameters named `document` and `process`, which are plausible domain
nouns in a game about office equipment. It now parses a TypeScript AST, uses an allowlist for `sim/`
imports, and delegates global checks to the compiler where scope analysis is free. All fourteen
findings are regression tests. See D-013.

## Verification status

Everything below currently passes:

| Command | Result |
|---|---|
| `npm run oi:arch` | passes across 10 files (sim 7, tests 3) |
| `npm run oi:arch:test` | 31/31 |
| `npm run oi:sim` | purity gate clean, 33/33 kernel tests |
| `npm run verify` | lint and build clean, 8 static routes prerendered |

Nine invariants are `ENFORCED`: I-001 through I-008 (I-008 partially — migrations wait for Gate B),
I-011 and I-012. Their limits are documented in [INVARIANTS.md](INVARIANTS.md) rather than implied.

## What is settled

[DECISIONS.md](DECISIONS.md) D-001 through D-014. In brief: GriftOS and Obsolescence share nothing
but a navbar entry; the agent implements end to end; there is one playtester so every
research-report gate condition needs rescoping; the first milestone is Gates A + B rather than a
visual slice; the repo shape is an in-app feature root; exactly three dependencies are approved; and
the boundary checker is AST-based with its own tests.

## What is not settled

[OPEN-QUESTIONS.md](OPEN-QUESTIONS.md). Nothing blocks the next phase.

- **Q-004** — the mockups. Blocks Gate C only. Daniel is retrieving them.
- **Q-005** — how much R1–R9 actually contradict each other. Resolved by Phase 2.
- **Q-006** — whether the R9 gate ladder survives rescoping for N=1. Resolved by running Gates A–B.
- **Q-007** — the save-key namespace. Blocks Gate B.

## Immediate next step

**Phase 2: research synthesis.** Read all of R1–R9 and produce one canon document plus an explicit
contradictions register. This is the R9 rerun done in-house — R9 was written without R1–R8 attached,
so its cross-report claims are unverified.

Effort is **high**, and higher than the handoff assumed: 664 KB across 7,529 lines, not the ~150 KB
estimated. R5 alone is 252 KB / 4,313 lines.

The two contradictions that propagate furthest are campaign length (R6's 18 quarters versus R9's 15)
and foregrounded generation count (R1's two versus R6's three). Both drive UI and save design, so
neither is deferrable past Gate B.

After Phase 2, Gate A is the next build: the lineup-decision prototype, in Angular HTML with colored
blocks. No renderer, no art.

## Phase plan

| # | Phase | Effort | Status |
|---|---|---|---|
| 0 | Mechanical inventory | low | Complete |
| 1 | Doc triage | medium | Complete |
| 2 | Research synthesis + contradictions register | high | **Next** |
| 3 | Boundary script, path aliases, headless runner | medium | Complete |
| 4 | Gate A — lineup decision prototype | high | Not started |
| 5 | Gate B — one-quarter gray box | high | Not started |
| 6 | Gate C — renderer gauntlet | medium | Blocked on Q-004 |
| 7+ | Gates D–I | TBD | Do not plan in detail yet |

## Verified repo facts

- Angular 21.2.18, TypeScript 5.9.3, Node 22.20.0, npm 10.9.3, Tailwind 3.4.19, ng-bootstrap 20,
  Express 5.2.1, ESLint 10.7, Karma/Jasmine.
- Hybrid structure: `AppModule` at `src/app/app.module.ts` plus standalone components.
- `tsconfig.app.json` compiles only from entry points, so unwired game files add no bundle weight.
- ESLint lints `src/**/*.ts` without a type-checked project, so new files must be lint-clean but do
  not need to belong to a tsconfig.
- `/dist` is gitignored, so `dist/oi-sim` output is never committed.
- CI is `.github/workflows/verify.yml` — Linux runs the full suite, Windows runs the Pages build plus
  `oi:test`.
- Deployment is GitHub Pages via `angular-cli-ghpages`, custom domain `dnowinski.com` via `CNAME`.
- `node --test <dir>` does **not** recurse on Node 22.20 — it tries to load the directory as a
  module. `oi:sim` passes a quoted glob that Node expands itself.

## Standing reminders

- Session close is non-negotiable: rewrite this file, append to `DECISIONS.md`.
- Only `idb`, `fake-indexeddb`, and `@playwright/test` are approved. Nothing else without asking.
- Do not install `pixi.js` or `phaser` before Gate C.
- Do not touch GriftOS.
- `npm run verify` and `npm run oi:test` must both pass.
