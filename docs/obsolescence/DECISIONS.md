# Obsolescence, Inc. — Decision Log

Append-only. Dated, numbered, with rationale. Never rewrite or delete an entry — supersede it with
a newer one and mark the old entry `SUPERSEDED BY D-xxx`.

A decision belongs here when it would be expensive to re-litigate, or when a future session would
otherwise reasonably assume the opposite.

---

## D-001 — GriftOS and Obsolescence, Inc. are entirely unrelated

**Date:** 2026-07-26
**Status:** Settled

The only shared surface between the two projects is a navbar entry under Experiments. No code,
doctrine, save keys, content, visual direction, or documentation authority is shared.

**Rationale:** GriftOS is the best-engineered thing in the repo and its documentation claims
site-wide authority it was never intended to have. An agent that reads GriftOS docs cold will
inherit its assumptions about layer ownership, save keys, and visual doctrine and apply them here.
Daniel confirmed the GriftOS docs were never written with a future agent on this project in mind.

**Consequence:** the root `AGENTS.md` was rescoped to site-wide facts and now routes to per-project
guides. See D-009.

---

## D-002 — The agent is the implementer, end to end

**Date:** 2026-07-26
**Status:** Settled

Daniel is not writing the code. The agent implements.

**Rationale:** R8 proposes a "Codex implements / Claude reviews / human owns taste" split. The
review and taste-ownership halves remain true, but the premise that a human does some of the typing
does not apply. Plans that assume otherwise will mis-scope every estimate.

**Consequence:** deliverables are working code, not implementation instructions. Two named human
gates remain Daniel's alone — *does this feel like chores* and *does this look right* (see D-003).

---

## D-003 — Playtesting is Daniel alone; N=1

**Date:** 2026-07-26
**Status:** Settled

There is one playtester. Every R9 gate whose pass condition reads "at least 5 of 7 testers can
explain X" is void as written.

**Rationale:** R9's entire gate architecture assumes a recruited tester pool. That pool does not
exist and is not going to.

**Replacement validation model:**

- **Dominance and balance — fully solvable, better than humans would manage.** Write policy bots
  (durable/service-heavy, premium/integrated, scale-first), run them across hundreds of seeds
  headless, and check whether any single posture wins profit *and* trust *and* resilience
  simultaneously. GriftOS already proves this pattern works with its balance simulator, though its
  code is not shared (D-001).
- **Legibility — partially solvable.** Show the agent only what the UI shows a player after a run,
  with the underlying decision chain withheld, and ask it to reconstruct why the battery failed.
  This is a genuine cold read because the source can be denied. It tests whether the *inspector*
  explains itself. It does **not** test whether a distracted human notices it.
- **Chore-feel and fun — not solvable. Do not pretend otherwise.** The only honest solo signal is
  behavioral: does Daniel voluntarily open it again, unprompted, days later. Instrument that — log
  seed, decisions, timestamps, pauses, panel-opens, and the gap since last session. Weak per
  observation, honest in aggregate.
- **Memory and resurfacing — time-delayed self-review.** Play a campaign, wait three weeks, load
  cold, try to explain your own installed base before opening the inspector.

**Consequence:** gates become mechanical proofs the agent runs continuously, legibility probes it
runs on demand, and two explicit human gates that cannot be silently faked.

---

## D-004 — First milestone is Gate A + Gate B, not a visual vertical slice

**Date:** 2026-07-26
**Status:** Settled

**Rationale:** R9 places the visual vertical slice at Gate H, roughly 6–8 months in, and argues
convincingly that a beautiful cutaway validates taste but proves nothing about whether choosing a
lineup is fun. Gate A answers the only question that can kill the project.

**Consequence:** no renderer work, no art pipeline, no Pixi/Phaser decision before Gates A and B
pass. Gate A is Angular HTML and colored blocks.

---

## D-005 — Working title stays "Obsolescence, Inc."; route is `/experimental/obsolescence`

**Date:** 2026-07-26
**Status:** Settled

**Rationale:** R7 argues the title should be retained and the *thesis* broadened beneath it —
"obsolescence" is the sharpest one-word description of what the machine produces, even though the
satire targets institutional incentives more broadly. Renaming buys nothing.

---

## D-006 — Cadence is opportunistic; the boot sequence is load-bearing

**Date:** 2026-07-26
**Status:** Settled

Daniel works on this when he feels like it. There are no deadlines and no schedule.

**Rationale:** long gaps between sessions mean context is reconstructed from documents, not from
memory. That makes the documented read order in `AGENTS.md` a functional requirement rather than
tidiness, and makes the session-close protocol non-negotiable.

**Consequence:** every session ends by rewriting `CURRENT-STATE.md` and appending to this file.

---

## D-007 — Font Awesome Pro cloud dependency is to be killed

**Date:** 2026-07-26
**Status:** Settled, scoped outside this project

Icons become local-only. Partially done already: `src/assets/fontawesome/icons/`,
`icons.manifest.json`, and `scripts/sync-fontawesome-icons.mjs` exist.

**Rationale:** removes a private-registry dependency and a network requirement from the build.

**Consequence:** this is a **separable site-level task**, not part of Obsolescence work. Recorded
here only so a future session does not treat it as in scope.

---

## D-008 — The senator-matching game will eventually be deleted

**Date:** 2026-07-26
**Status:** Intent recorded, not yet executed, scoped outside this project

Reclaims roughly 21 MB of unoptimized JPEGs in `src/assets/senators/`.

**Rationale:** meaningful against R8's 12 MiB first-playable budget, since the whole site shares one
Pages deployment.

**Consequence:** separable site-level task. Do not bundle it into an Obsolescence commit.

---

## D-009 — Documentation is split by project, with a site-wide router

**Date:** 2026-07-26
**Status:** Settled

Layout:

```
AGENTS.md              site-wide facts only + router to per-project guides
docs/                  site-level only (architecture, optimization, hero investigation)
docs/griftos/          all previously-root GriftOS documentation, moved unchanged
docs/obsolescence/     this project
```

**Rationale:** implements D-001 structurally. The dividing line for what lives in the repo at all:
if a coding agent needs it while writing code, it lives here; if it is for thinking with, it lives
in the claude.ai Project.

**Correction to the handoff:** the handoff claims all 20 files in `docs/` were GriftOS. That is
wrong. Three are genuinely site-level and stayed put: `architecture.md` (the stack, folder map,
deployment and dependency policy that `README.md` points to), `website-optimization-plan.md` (Home
and About performance work, which explicitly excludes GriftOS from its scope), and
`home-hero-investigation.md` (the site homepage hero illustration). Seventeen moved.

**Consequence:** `docs/griftos/AGENTS.md` was created to hold the GriftOS doctrine that used to sit
in the root file. `docs/griftos/GRIFTOS-REPOSITORY-TRUTH-PACKET.md` is a frozen audit snapshot and
received a single path note rather than 30 rewritten table rows.

---

## D-010 — R1–R9 are mirrored into the repo, frozen and read-only

**Date:** 2026-07-26
**Status:** Settled

The nine research reports live at `docs/obsolescence/research/`.

**Rationale:** agents need them at edit time, and they are finished artifacts that will not drift.
Filenames were normalized to kebab-case; content is byte-identical to the originals.

**Consequence:** do not edit them. Reconciliation output goes in a separate canon document, not
into the reports. R9 retains a `-PARTIAL` suffix because it is self-declared provisional — it was
produced without R1–R8 attached.

---

## D-011 — Repo shape is an in-app feature root, not an npm workspaces monorepo

**Date:** 2026-07-26
**Status:** Settled — ratified by Daniel
**Resolves:** Q-001, Q-003

The game lives at `src/app/games/obsolescence/`, outside `pages/experimental/`, with the route
still `/experimental/obsolescence`.

```
src/app/games/obsolescence/
  sim/           pure TS, deterministic, zero Angular/Pixi/DOM imports
  content/       validated data registries
  persistence/   IndexedDB via idb, versioned migrations
  presentation/  Angular-facing view models
  render/        replaceable renderer adapter
  devtools/      scenario loader, seed control, pause/step/speed, state jump
  tests/
```

Supported by `tsconfig` path aliases (`@oi/sim`, `@oi/content`, …), a boundary-check script modeled
on `scripts/check-grift-boundaries.mjs` wired into `npm run oi:test`, and a separate
`tsconfig.sim.json` plus Node runner so the simulation runs headless.

**Rationale:** R8 and R9 both recommend workspaces (`packages/sim-core`, `packages/game-renderer`),
but that advice was written without knowing this repo is a single Angular project with a working
SSR + prerender + ghpages pipeline. Converting means touching `angular.json`, the SSR build, the
deploy step, and CI — a migration project competing with actually building the game, before anyone
knows whether the game is fun.

**Why this is not a one-way door:** because everything sits behind path aliases with zero Angular
imports (I-001), promoting `sim/` to a real workspace package later is `git mv` plus a workspaces
declaration. Earn the migration; do not pre-pay for it.

**Consequence:** [ARCHITECTURE.md](ARCHITECTURE.md) is no longer provisional. Phase 3 can build the
boundary-check script and headless runner.

---

## D-012 — Approved dependencies: `idb`, `fake-indexeddb`, `@playwright/test`

**Date:** 2026-07-26
**Status:** Settled — approved by Daniel

| Package | Purpose | Scope |
|---|---|---|
| `idb` | IndexedDB wrapper for saves (~1.19 kB brotli) | runtime |
| `fake-indexeddb` | IndexedDB in Node tests | dev only |
| `@playwright/test` | Desktop and phone test matrix | dev only |

**Renderers are explicitly deferred.** `pixi.js` and `phaser` are *not* approved and must not be
installed before Gate C actually starts. Two of the three approved packages are dev-only, and Gate A
needs none of them.

**Rationale:** these three unblock Gates A and B and are the enforcement mechanism for several
invariants — `@playwright/test` is what makes I-014 (every meaningful action possible on phone) and
I-015 (scripted states directly reachable) checkable rather than aspirational. The renderer pair is
~1.7 MB of dependency for a bake-off whose loser gets uninstalled; there is no reason to carry it
before the question is live.

**Consequence:** the site-wide no-new-dependency rule still applies to everything else. Anything
beyond this table needs a fresh approval.

---

## D-013 — The boundary checker parses a TypeScript AST, not source text

**Date:** 2026-07-26
**Status:** Settled

`scripts/check-obsolescence-boundaries.mjs` uses `ts.createSourceFile` and inspects nodes.

**Rationale:** the first version was modelled on `scripts/check-grift-boundaries.mjs` and scanned
with regular expressions. Adversarial testing — seven agents attacking it in isolated copies, 62
probes — found **nine ways through it and five ways to make it reject valid code**:

*Let through:* scoped packages (`@pixi/app` while `pixi.js` was blocked), backtick specifiers in
`import()` and `require()`, a `../../obsolescence/content/x` walk-out that defeated **every** layer
rule at once and silently disarmed the renderer check with it, namespace imports
(`import * as sim` then `sim.applyCommand(…)`), destructured dynamic imports, and any file in a
directory not named in the layer list.

*Wrongly rejected:* parameters named `document`, `location` and `process` — all plausible domain
nouns in a game about office equipment — plus a `reset` imported from a local camera module, and a
doc comment whose apostrophes (`Don't`, `GriftOS's`) were parsed as a string literal.

Those are not five bugs and nine bugs; they are two categories. Hand-rolled tokenizing is
unwinnable, and scope is not a text property. TypeScript 5.9 was already a devDependency.

**Consequences:**

1. **Allowlist, not denylist, for `sim/` imports.** "Only relative paths resolving inside `sim/`" is
   shorter than any denylist and immune to package drift.
2. **Browser and Node globals moved to the compiler.** `tsconfig.sim.json` compiles `sim/` with
   `lib: ["ES2022"]` and `types: []`, making them compile errors *with real scope analysis*. This is
   why `tsconfig.sim-test.json` exists separately — the tests legitimately need Node types, and
   leaving `types: ["node"]` on the purity gate reintroduced `process` and `require` into `sim/`.
3. **The checker has its own regression suite.** All fourteen findings are cases in
   `npm run oi:arch:test`. A checker with no tests is an assertion, not an enforcement mechanism.
4. **Limits are documented rather than implied.** String concatenation, type-aware mutation
   questions, and unregistered path aliases are named in [INVARIANTS.md](INVARIANTS.md).

---

## D-014 — Phase 3 substrate is built; six invariants are now executable

**Date:** 2026-07-26
**Status:** Settled

Built: the `sim/` kernel (10 Hz clock, pure seeded RNG, ID-keyed state, typed commands, pure
reducers, `run`/`serialize`), the layer skeleton with ownership READMEs, `@oi/*` path aliases, the
boundary checker and its regression suite, the two sim tsconfigs, `oi:*` npm scripts, and CI wiring
on both Linux and Windows.

I-001 through I-008 and I-011 moved from `PLANNED` to `ENFORCED` (I-008 partially — migrations wait
for Gate B).

**Rationale for building a kernel during an "architecture" phase:** the determinism invariants
cannot be enforced without a determinism to test. The kernel is deliberately a *substrate* — no
lineups, floors, bays, cohorts or incidents. Those are Gate A and Gate B, and building them here
would have been scope creep.

**Rationale for doing this before Phase 2:** Gate A code now gets written against a live guardrail
rather than a documented intention. Research synthesis produces design canon, which nothing can act
on until there is somewhere to put code.

**Consequence:** the RNG is a pure function of `(seed, cursor)` rather than a stateful generator,
so save files carry two integers instead of generator internals, and any reader can derive a value
at any position without replaying the sequence.

---

## D-015 — R1–R9 are reconciled; CANON.md is the build target

**Date:** 2026-07-26
**Status:** Settled
**Resolves:** Q-005

The Phase 2 synthesis produced [CANON.md](CANON.md) — the reconciled design canon — and
[CONTRADICTIONS.md](CONTRADICTIONS.md) — the register of what disagreed and why each resolution was
chosen. Where a single report disagrees with CANON.md, CANON.md wins.

**Method:** 15 agents — one extractor per report, five thematic reconcilers, one completeness critic.
Each extractor was told what its report could actually see when written, because that is what decides
which side of a disagreement has better evidence. This **is** the R9 rerun: R9 was written without
R1–R8 attached, so a Deep Research rerun was never the right instrument.

**Findings:** 56 contradictions from the reconcilers plus 8 the critic found that single-theme
reconcilers structurally could not see — 10 blocking, 32 significant, 14 minor. All 10 blocking are
resolved. 62 tester-panel pass conditions collected for rescoping. Roughly 35 coverage gaps, of which
11 are recorded as `G-*` in [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md).

**Decisions of record adopted into canon:**

- **15 quarters / 5 chapters**, keeping R6's Foundation → Market → Liability rhythm. Adopted over
  R6's 18/6 on asymmetric production risk — explicitly **not** because R9 knew better, since R9 never
  read R6.
- **Compression is a property of the installed base and of retired SKUs, never of a family as a
  whole.** A family can be compressed and per-offer visible at once. This is what makes the
  carried-over low end coherent.
- **Three sellable offers plus one ecosystem slot**, typically only two newly designed per quarter.
- **Determinism is per-journey, not per-aggregate** — R5's stronger invariant over R8's. Already
  implemented as I-004.
- **Renderer-agnostic work comes first; camera and floor-band code waits for Gate C.** Writing camera
  code against an undecided renderer is the most expensive avoidable mistake available.
- **Tester denominators become scenario denominators**, pre-registered before the run.

**Three findings that change the plan:**

1. **C-41 changes what Gate C is** — a single-stack Pixi run judged against absolute bars rather than
   a Pixi-versus-Phaser bake-off. This removes the reason to install `phaser` at all, narrowing D-012.
2. **G-01: there is no `Offer` entity anywhere in the corpus.** `Variant` is the design,
   `InstalledBaseCohort` is units sold, and nothing represents the sellable-this-quarter offer. It is
   the missing noun the entire lineup loop is about.
3. **G-02: no demand volume model exists.** No report says how many customers there are or how demand
   scales. Invisible until you try to run a quarter.

**On the method itself.** The reconcilers' recurring failure was resolving by fiat using a number the
same reconciliation listed as an open gap — seven such resolutions are recorded as `U-*` and
reverted. One was worse: two reconcilers argued R3 and R8 "converged independently" on the camera
doctrine, when R3 line 15 states it inherited R8's framing through its brief. Treat R3+R8 camera
agreement as one source. Agreement between reports is not evidence unless the reports were
independent, and in this corpus they frequently were not.

---

## D-016 — The ecosystem slot attaches to a device sale; it does not compete with one

**Date:** 2026-07-26
**Status:** Settled

**Rationale:** implemented as a rival offer, it was chosen by every segment in preference to an
actual handheld — customers "bought" a £129 dock and no phone. R1 describes the fourth slot as an
accessory, dock, bundle or subscription, which is an *attach*, not a substitute.

**Consequence:** the choice model considers only device offers. The ecosystem offer earns an attach
rate against whatever device the segment bought, driven by compatibility and relative price — which
is what makes the connector stance matter commercially. It is also exempt from the "nobody's first
choice" clarity penalty, because being nobody's first choice is its job.

---

## D-017 — Segment population weights are the dominant balance lever

**Date:** 2026-07-26
**Status:** Settled

Gate A ships four segments: Value Planners 26%, Mainstream Upgraders 32%, Prestige Seekers 28%,
Long-Horizon Owners 14%.

**Rationale:** at the first guess (30/36/16/18) the durable posture addressed 84% of the population
and swept every seed. Trait tuning, price sensitivity, conversion curves and cost multipliers were
all tried and **none of them could break the dominance**, because a posture serving 84% of buyers
adequately beats one serving 52% brilliantly. Rebalancing toward Prestige Seekers gave the premium
posture a real constituency and the dominance disappeared immediately.

**Consequence:** when a future gate finds a dominant strategy, check segment sizes **before**
tuning traits or prices. It is the cheaper and more likely fix. Record it in the gate result either
way.

---

## D-018 — Gate A's machine-measurable conditions pass; the human gates are outstanding

**Date:** 2026-07-26
**Status:** Settled for the automated half; Gate A itself is **not closed**

No posture sweeps reach + trust + ownership in any of 200 seeds, every posture wins at least one
dimension in every seed, all five headline decisions move at least two dimensions in ≥80% of seeds,
and the five pre-registered scenarios reproduce the causes they claim.

**Rationale for recording this as a decision rather than only a gate result:** the sweep caught seven
distinct balance failures that a tester panel would not have found, including total dominance by one
posture and a demand model in which nobody bought a phone. That is the D-003 validation model
working as designed, and it is the strongest evidence so far that replacing tester denominators with
machine sweeps plus pre-registered scenarios was the right call.

**Consequence:** Gate A stays open until Daniel runs the five scenarios and answers the two human
gates. No Gate B work should start before that — the kill condition still applies.
