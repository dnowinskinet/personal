# Gate A — Lineup decision prototype

**Status:** ACTIVE
**Written:** 2026-07-26, before implementation. Does not change once the gate starts.

---

## Hypothesis

**Composing a quarterly lineup under a capacity ceiling and a deadline produces painful, legible
tradeoffs — and no single posture wins everything.**

If this is false, the game's thesis collapses and the correct response is to pivot to a narrower
scenario-management game, not to add features. [R9 ranks this assumption first; R1 agrees the whole
design rests on it.]

## What is real

- Four lineup slots: carried-over low end, new Standard, new Premium, ecosystem offer.
  Per [CANON.md](../CANON.md) §2 the low end is a **sellable prior-generation `Offer`**, not a cohort.
- Shared, genuinely scarce capacity: engineering, test, and a single stock pool split between launch
  inventory and service reserve.
- Two platform architecture decisions that propagate to every offer: **battery** (sealed
  high-density vs serviceable modular) and **connector** (universal vs proprietary).
- A supplier fork: incumbent (dependable, expensive) vs aggressive (cheap, volatile yield).
- Per-offer decisions: component tier, price, support-promise years, and public claims.
- A late ambiguous test signal on battery risk. Resolving it costs test capacity the player wanted
  elsewhere.
- A hard lock deadline. Changes after lock cost more.
- Outcome across R5's five disagreeing dimensions: reach, portfolio, clarity, trust, ownership health.
  **No overall grade.**

## What is fake

The building. Animations. The renderer. Art of any kind. The showroom. Production simulation.
Returns, diagnostics, repair, refurbishment. Multi-quarter campaign. Any generation beyond the
carried-over one. Six of the seven customer segments — four ship (see below).

Gate A is Angular HTML and colored blocks. **If it looks good, effort went to the wrong place.**

## Scope decisions taken to unblock this gate

**G-01 — the `Offer` entity now exists.** `Variant` is a design; `InstalledBaseCohort` is units
already sold; `Offer` is the sellable-this-quarter thing with a price, a stock allocation, a slot
role and a lifecycle status. No report had this noun and the entire loop is about it.

**G-05 — four segments ship:** Value Planners, Mainstream Upgraders, Prestige Seekers, Long-Horizon
Owners. Chosen because they map onto the three doctrines the dominance sweep has to distinguish —
Value + Mainstream carry volume, Prestige carries margin, Long-Horizon carries durability. Capability
Enthusiasts, Privacy Guardians and Institutional Operators wait; the last needs contracts, which is
Gate B at the earliest.

**G-02 — a demand model had to be invented.** No report supplies one. The model here is deliberately
the simplest thing that can express a veto: hard must-have constraints eliminate offers, then
surviving offers are scored on `fit + confidence + urgency − burden` over each segment's two or three
salient needs, per R5's stated shape. Numbers are a first guess and Gate A exists partly to falsify
them.

## Pass condition

Rescoped for one playtester per [DECISIONS.md](../DECISIONS.md) D-003. **Tester denominators are
replaced by pre-registered scenario denominators.** All three parts must hold.

### 1. Machine-measurable — no dominant posture

Three policy bots — durable/service-heavy, premium/integrated, scale-first — run across **≥200 seeds**.

**Pass:** no single posture is best on reach *and* trust *and* ownership health simultaneously in
more than **60%** of seeds, and every posture wins at least one dimension in at least **20%**.

**Fail:** any posture sweeps all three in >60% of seeds. That is dominance, and it means the
tradeoffs are decorative.

This is the part a tester panel could never have found. Seven humans playing twice would not surface
a dominant strategy; a sweep finds it in a minute.

### 2. Machine-measurable — decisions actually matter

Flipping **each** of the five headline decisions (battery, connector, supplier, support promise,
reserve split) in isolation, holding seed and all else constant, must move **at least two of the five
outcome dimensions by a visible margin** in ≥80% of seeds.

**Fail:** any decision that changes nothing is a fake choice and must be cut or made real.

### 3. Single-tester protocol — pre-registered scenarios

Five scenarios are written down **before** the run, each with its expected dominant cause. The tester
plays each and states why the quarter went the way it did.

**Pass:** correct dominant cause on **4 of 5**, without opening the inspector first.

## Kill condition

Stop or pivot, rather than iterate, if:

- Two rounds of rebalancing cannot remove a dominant posture. The decision space is too shallow.
- The tester cannot distinguish "bad lineup" from "bad luck" in 3 of 5 scenarios. Outcomes are noise.
- Composing a lineup takes under two minutes with no felt tension. There is no game here.

## Human gates — Daniel's alone, and not fakeable

- **Does this feel like chores?**
- **Does the decision feel like it has a point of view, or like filling in a form?**

Plus the only honest solo fun signal: **does he open it again, unprompted, days later.** Instrumented
by logging seed, decisions, timestamps and the gap since the last session — weak per observation,
honest in aggregate.

## Work forbidden before this passes

Building art. Renderer of any kind. `pixi.js` or `phaser` installs. Showroom. Production, returns or
repair simulation. Campaign structure beyond one quarter. Chapter or ending systems. The remaining
three segments. A second product category.

## Fixture

R9's `LARK` handheld family, reconciled onto R5's canonical market fixture per C-38:

- `LARK M1 Lite` — carried-over prior generation, discounted, still sellable
- `LARK M2 Standard` — new, must ship
- `LARK M2 Pro` — new, cuttable
- `DockPass` — ecosystem slot, service + accessory

Central tension: **sealed high-density battery versus serviceable modular pack**, with a late
ambiguous thermal signal.
