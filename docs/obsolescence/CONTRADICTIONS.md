# Obsolescence, Inc. — Contradictions Register

What R1–R9 disagreed about, how each conflict was resolved, and what is still open.

**Produced by:** the Phase 2 synthesis, 2026-07-26 — 15 agents, one extractor per report, five
thematic reconcilers, one completeness critic. **This is the R9 rerun, done in-house.** R9 was
written without R1–R8 attached, so a Deep Research rerun was never the right instrument; an agent
that can read all nine directly can do the reconciliation itself.

**Totals:** 56 contradictions found by the reconcilers, plus 8 more found by the critic that the
single-theme reconcilers structurally could not see. 10 blocking, 32 significant, 14 minor.
62 tester-panel pass conditions collected for rescoping.

**Status vocabulary:**

| Status | Meaning |
|---|---|
| `CANON` | Resolved; the resolution is in [CANON.md](CANON.md) |
| `OPEN` | Genuinely undecided; needs a decision or a gate |
| `REJECTED` | A reconciler proposed a resolution that overreached its evidence |

---

## Blocking

These stop downstream work until settled. All ten are resolved.

### C-01 — Quarter and chapter count · `CANON`

| Report | Position |
|---|---|
| R6 | 18 quarters, 6 chapters of 3 |
| R9 | 15 quarters, 5 chapters; demotes 18 as unproven with "very high" cost if wrong |
| R1 | Silent on chapters; 10–14 launches in an 8–15 hour campaign |
| R3, R4, R5 | Explicitly defer to R6 |

**Resolution:** 15 quarters / 5 chapters. Keep R6's Foundation → Market → Liability rhythm exactly.
Hold 18/6 as a post-Gate-H stretch, 12/4 as the rung down.

**Reasoning, with a correction to the reconciler's:** R9 is later, but **R9 never read R6**, so this
is not the later report knowing better. It is adopted because production risk is asymmetric — 18
quarters costs more in every content category — and because R6's actual argument is for its *chapter
rhythm*, which survives intact at 15.

### C-02 — What retains per-offer detail versus compressing to cohorts · `CANON`

R9 says per-offer detail for the current family only. R6 says compression is family-level. R1's
carried-over low end is a *sellable offer from a previous family*. R3/R5 keep an old/low table
permanently on the showroom floor. These cannot all hold.

**Resolution:** compression is a property of **the installed base and of retired SKUs**, never of the
family as a whole. A family can be simultaneously compressed (its installed base is cohorts) and
per-offer visible (one of its SKUs still occupies a live lineup slot).

### C-03 — Lineup anatomy · `CANON`

R1 says four slots with a carried-over low end; R2 says three freshly-designed variants; R4's slice
uses two new plus one inherited; R9 uses four offers including a discounted prior-generation model.

**Resolution:** three simultaneously sellable offers plus one ecosystem slot. Typically only two are
newly designed each quarter; the low end is normally a carried-over prior-generation variant that
**remains sellable** with its own price, stock and placement.

**Why it was blocking:** it decides whether an `Offer` / lineup-slot entity exists at all. See G-01.

### C-04 — Installed-base cohort key · `CANON`

Three incompatible keys: R2's `(generation × variant × region × condition × service state)`, R5's
`segment × channel × installed-base state`, R6's family-level key with variant collapsed away.

**Resolution:** one table keyed by `(generationFamily, variantId, segmentId, channelId,
conditionBand, serviceState)`, where `variantId`, `segmentId` and `channelId` are progressively
nulled as a family ages. **Compression is a key-collapsing operation, not a separate data
structure.** Region stays in the schema fixed to one value for the first campaign (C-46).

### C-05 — Segment schema · `CANON`

R2: soft `likes[]`/`dislikes[]` scoring. R5: hard must-have veto *before* any soft scoring.

**Resolution:** R5's structure; retire R2's `Segment` type. Keep R2's seven identities and its rule
that each carries at least one active dislike.

### C-06 — Canonical gray-box floor set · `CANON`

R3 gives two mutually incompatible answers (capacity table says +2 to B4; scope paragraph says
otherwise). R8 also gives two. R4 specifies bays not floors. R9's Gate C needs more.

**Resolution:** six floors — one project floor, double-height showroom, B1 dock/ramp, one
prototype/test floor, one merged pilot/production floor, one merged diagnostics/repair floor with a
quarantine branch.

### C-07 — Every comprehension gate in the market theme assumes a tester panel · `CANON`

R5 has eleven panel-dependent conditions, five percentage-based. R9's Gate D needs 5 of 7. R3 needs
80% of testers. R6 needs 75–80%. **There is one playtester**, so Gate D as written can neither pass
nor fail.

**Resolution:** convert every tester denominator to a **scenario** denominator, using R5's own Risk-3
wording as the template because it is already n=1 compatible: *diagnose four of five exaggerated
prepared scenarios with the inspector available*. See the rescoping rule below.

### C-08 — Strength of the determinism guarantee · `CANON`

R8: "the same high-level outcome should result." R5: "same seed and commands produce the same
journeys and cohort outcomes" — per-agent.

**Resolution:** R5's stronger invariant. Seed + command log must reproduce identical per-agent
journeys, not merely equivalent aggregates.

**Already implemented.** This constrains numeric representation and PRNG architecture, so it had to
be settled before the kernel existed — it is reflected in I-004 and in the pure `(seed, cursor)` RNG.
The reconciler also prescribed fixed-point arithmetic and per-agent PRNG streams; those specifics are
`REJECTED` as overreach (see U-07) and remain open design questions.

### C-09 — When the renderer decision is made relative to camera work · `CANON`

R8's milestone list puts floor-band camera work at step 3, before the Gate C renderer bake-off. R9's
ladder puts the renderer decision at Gate C, after Gates A and B.

**Resolution:** ordering from R9, content from R8. Renderer-agnostic milestones first — lazy route,
sim-core, save/migration harness, developer lab, device matrix. Camera and floor-band code waits for
Gate C.

**Why it was blocking:** writing camera code against an undecided renderer means discarding or
porting it — the single most expensive avoidable mistake in the plan.

### C-10 — Validation methodology overall · `CANON`

Seven of R9's nine gates carry panel thresholds. R5, R6 and R3 likewise. R8, R4 and R1 carry **zero**
— their gates are machine-measurable or single-observer. R7 supplies no instrument at all despite
asserting testable psychological claims.

**Resolution:** adopt R8/R1/R4's methodology as the template. Rewrite every panel condition into two
halves — a machine-measurable half, and a single-tester protocol whose denominator is
**pre-registered scenarios or sessions, never people**.

---

## Found by the completeness critic

Cross-theme conflicts the single-theme reconcilers structurally could not see. **All eight are
`OPEN`** — they were discovered after the reconciliation and have no adopted resolution yet.

### C-11 — R6 and R7 ship different ending sets, and R6 falsely certifies agreement · `OPEN`

R6: Durable Steward, Velvet Fortress, Volume Titan, Managed Transition, Public Reckoning.
R7: Lock-in empire, Durable specialist, Breakup/interoperability, Legacy burden, Succession.

Only two map cleanly. R7's *Legacy burden* and *Succession* have no R6 equivalent; R6's *Volume
Titan* has no R7 equivalent. R6 states the sets agree. They do not.

### C-12 — The kernel/category boundary is violated by its own exemplar · `OPEN`

R2 line 75 sets the boundary: category modules own "slot taxonomies, demo verbs, tests, and failure
visuals". R2 then authors `demoVerbs` as a six-item category-owned array — while R5 makes
demonstration a **kernel-level** trait with ten properties. The single most-cited extensibility rule
in the corpus is contradicted by the object it was defined on.

### C-13 — `Channel` is absent from R2's kernel · `OPEN`

The string "channel" does not appear anywhere in R2, whose twelve entities are declared "broad enough
to represent every documented pattern that mattered most". R5 and R6 both make channel a first-class
persistent dimension, and R6 caps channel commitments below R5's normal target.

### C-14 — R7's worker-humanity pillar has no mechanism · `OPEN`

R7 makes "humanity at ground level" one of five tone pillars and calls the executive/worker register
split "one of the safest and funniest engines in the whole game". R4, R6 and R8 all model workers as
pooled abstractions. R5's representative-evidence apparatus — the thing that makes *customers*
legible — covers customers only. Nothing gives workers an equivalent.

### C-15 — Four mandatory fixture lists, one budget · `OPEN`

R3 hands R9 twelve deterministic fixtures, R5 ten, R6 five chains, R4 eight — up to 35 authored
scenarios against R9's own budget of five. Nobody reconciled them. This becomes critical the moment
every rescoped gate uses scenarios rather than testers as its denominator (C-07, C-10).

### C-16 — Six simplification ladders with no precedence · `OPEN`

Counted as an agreement by the reconciliation; correctly reclassified by the critic. Six reports each
authored an ordered fallback ladder. They point in compatible directions but fire on **overlapping
failures with no precedence between them**. A single merged ladder is needed before any gate can act
on one.

### C-17 — Launch-day population multiplier breaks the agent budget · `OPEN`

R5 sets a launch-day visible-population multiplier of 1.8×/2.5×/4×. Applied to R5's own normal band
of 24–36 visible customers, a normal launch is 60–90 customers plus staff on the showroom floor
alone — against R8's whole-scene normal band of 80–140 agents. R5's multiplier collides with both its
own stress cap and R8's scene budget.

### C-18 — Two demo bays or three · `OPEN`

R3 froze "Demo Bay A and Demo Bay B" as permanent showroom anchors and handed them to R8 to freeze.
R5's stress configuration requires three.

---

## Rejected resolutions

Seven reconciler resolutions overreached their evidence. Each reverts to `OPEN`.

| # | Topic | Problem |
|---|---|---|
| U-01 | Support-promise duration | Invents "3–4 years". No report proposes it; R2's 5–6 year figures are among the few numbers grounded in first-hand research on real published support policies. |
| U-02 | Compressed launch form | Invents "3–4 minutes with 2–3 interventions". R9 says only "smaller, consequence-heavy launch forms" with no duration. |
| U-03 | Entity-budget scope contract | Validates a composition check using numbers the same reconciliation lists as an open gap. |
| U-04 | Socket vs station budget | Resolves by capping active operations floors at 4 — a number the same reconciliation lists as undecided. |
| U-05 | R3/R8 "independent convergence" on camera doctrine | **Factually wrong.** R3 line 15 states it inherited R8's fixed-width, fit-to-width, vertical-scroll and aggregation framing through its brief. Two reconcilers used this false independence as their decisive argument. Treat R3+R8 camera agreement as **one source, not two**. |
| U-06 | Leaning quarter-count on Gate H | Gate H's conditions are conjoined and one half is a panel vote, so it does not survive the single-playtester constraint intact as claimed. |
| U-07 | Determinism specifics | Direction is right (C-08 adopted) but "fixed-point arithmetic", "one PRNG stream per agent" and "byte-identical worker logs" are prescribed without sourcing. |

The recurring failure mode: **resolving by fiat using a number the same reconciliation lists as an
open gap.** Worth watching for in future synthesis passes.

---

## Significant

Resolved and folded into [CANON.md](CANON.md) unless marked otherwise.

| # | Topic | Resolution |
|---|---|---|
| C-19 | Active minutes per quarter | 25–35 canon; retire R1's 20–40 prose and R6's 25–45. Gate B pass band 25–40. |
| C-20 | Foreground generation count *(3 near-duplicate conflicts merged)* | Two standing + one event-promoted burden family; hard cap three. |
| C-21 | Support-promise duration vs campaign length | Seed a pre-campaign Gen 0 with its clock part-spent so a sunset lands mid-campaign. Duration itself `OPEN` (U-01). |
| C-22 | Launches vs quarters | Tiered launch forms: 10–12 full-theater at 7–9 min; the rest compressed. Compressed form's duration `OPEN` (U-02). |
| C-23 | Campaign completion time | Publish two numbers, not one derived figure: active play 6.25–8.75 h, first completion an acceptance band. |
| C-24 | Chapter identity: bespoke art or reused kits | Three reusable visual platform-wave kits across five chapters; identity via taxonomies and pressures, not per-chapter art. |
| C-25 | Is a second category a kernel change? | Reclassify as expensive-but-additive, conditional on the kernel/category boundary holding — which C-12 puts in doubt. |
| C-26 | Defect modelling | Split: keep R2's authored `DefectTemplate`; add a runtime `DefectHypothesis` carrying uncertainty. |
| C-27 | Ecosystem slot cardinality | A slot *category* holding at most one accessory and at most one service (0–2 objects). |
| C-28 | Supplier attributes | Union, with R2's scalar `qualityIndex` replaced by an explicit yield distribution. |
| C-29 | Entity-budget scope units | Three-tier contract: R8 = whole visible scene; R4 = per active floor; R5 = showroom. Composition check `REJECTED` (U-03). |
| C-30 | Sockets vs station budget | Station budget is per active floor. Floor cap `REJECTED` (U-04). |
| C-31 | Laptop floors visible | The camera contract wins; R3's wireframe is wrong and must not be copied. |
| C-32 | 4× speed | Global control set keeps 1×/2×/4×; 4× disabled during launch theater and incident windows. |
| C-33 | Particle budget vs its own gate | Re-tier: normal 100–150, stress 250–360, review above 400. |
| C-34 | The five judgment dimensions | R5's five panels are canon. Press narrative is relocated, not deleted — it feeds Promise and Trust. |
| C-35 | Post-launch consequence window | Quarter ends 60–90 s after the stage closes. |
| C-36 | Alert budgets | Separate *generation* from *surfacing* and instrument as two rates. |
| C-37 | R5's launch phase table exceeds its own stated duration | Hold 7–9 min as canon; re-cut the phase table to fit. |
| C-38 | Three incompatible canonical fixtures | R5's §22 fixture is canonical; rename R9's LARK onto it; keep R2's Relay generations as the history behind it. |
| C-39 | Vertical slice contents — five incompatible manifests | Publish one merged manifest before Gate H is commissioned. |
| C-40 | Reference viewport | 1024×640 is the design floor and Gate C hard pass; larger viewports reveal more altitude at the same scale. |
| C-41 | Renderer gauntlet method | Single-stack Pixi judged against absolute bars, not an A/B bake-off. **This changes what Gate C is.** |
| C-42 | Save versioning granularity | Compose: R8's storage and two-version header plus R6's per-obligation rule-version pointer. |
| C-43 | Level-of-detail and simulation | State the rule nobody wrote: camera state and device load may change only what is **drawn**, never what is **simulated**. |
| C-44 | Supported floor count | R8's ladder (32 target / 40 warning / 48 review) is capability; R3's 16 is the design target. |
| C-45 | Campaign size driving effort budget | Follows C-01: plan at 15/5. |
| C-46 | Residue as an asset class | R7 needs visible residue; R8's asset economy has no residue family. Implement as a state layer over the existing eight families, never bespoke per-policy art. |

*Fourteen `minor` conflicts are recorded in the workflow output and folded into canon: vocabulary
collisions (the word "slot" means three different things — fix to `componentSlot` / `baySocket` /
`packageSlot` before any schema is written), segment ID naming (freeze R5's seven names before Gate A
authors content), B1 branch count (four, per R3), the persistent-state ledger row count (twelve, not
eleven — R5's market learning and R6's org playbooks are different memories), and the effort estimate
(correct the low column to ~10 months and treat all bands as understated).*

---

## The rescoping rule

**62 tester-panel pass conditions** were collected across the reports. Every one is void as written
(D-003). They are not deleted — they are converted.

> **Replace the tester denominator with a scenario denominator.** A condition of the form
> *"at least 5 of 7 testers can explain X"* becomes *"the single tester correctly diagnoses 4 of 5
> pre-registered scenarios"*. Pre-registration is what makes it honest: the scenarios and their
> expected diagnoses are written down **before** the run.

R5's Risk-3 wording is the canonical template because it was already n=1 compatible before anyone
asked it to be. Each rescoped condition splits into two halves:

1. **Machine-measurable** — run headlessly, continuously, over hundreds of seeds.
2. **Single-tester protocol** — a pre-registered scenario set, run once, honestly.

Two gates remain **Daniel's alone and cannot be faked**: *does this feel like chores* and *does this
look right*.

**⚠ This makes C-15 urgent.** Once every gate is scenario-denominated, the four unreconciled fixture
lists (up to 35 scenarios against a budget of 5) become the binding constraint on the whole
validation ladder.
