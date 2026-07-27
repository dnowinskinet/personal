# Gate A — Result

**Date:** 2026-07-26
**Status:** Machine-measurable conditions **PASS**. Human gates **NOT YET RUN** — they are Daniel's
and cannot be run by an agent.

Brief: [A-lineup-prototype.brief.md](A-lineup-prototype.brief.md)

---

## Verdict

| Condition | Result |
|---|---|
| 1 — No dominant posture | **PASS** |
| 2 — Every headline decision moves outcomes | **PASS** |
| 3 — Pre-registered scenarios reproduce their cause | **PASS** (verified) |
| 3 — Tester names the cause, 4 of 5 | **NOT RUN** — Daniel's |
| Human — does this feel like chores? | **NOT RUN** — Daniel's |
| Human — does the decision have a point of view? | **NOT RUN** — Daniel's |

Playable at `/experimental/obsolescence`. Not listed in the public experiments index — Gate A is an
internal prototype and the first public playable is Gate I.

## Condition 1 — no dominant posture

200 seeds, three policy bots. No posture sweeps reach + trust + ownership in **any** seed (ceiling
was 60%). Every posture wins at least one dimension in **100%** of seeds (floor was 20%).

| Posture | Reach | Portfolio | Clarity | Trust | Ownership | Defect rate |
|---|---:|---:|---:|---:|---:|---:|
| Durable / open | 79 | 52 | 71 | **93** | **92** | 5% |
| Premium / integrated | 91 | 58 | **92** | 46 | 46 | 34% |
| Scale-first | **100** | **86** | 71 | 36 | 32 | 46% |

Each has a home: durable owns trust and ownership, premium owns clarity, scale owns reach and
portfolio. Durable's clarity is weakest because its low end and Standard sit close enough to blur.

## Condition 2 — every headline decision moves outcomes

Each of the five decisions, flipped in isolation with seed held constant, moves **at least two of
the five dimensions in ≥80% of seeds**. No fake choices survive.

## What the sweep actually caught

The first build **failed**, and every failure was something a tester panel would not have found.

**Durable swept 100% of seeds.** Confidence was weighted so heavily that "pick the reliable
supplier" beat every other decision in the game. Seven humans playing twice would have called it a
good build.

**Every segment bought the £129 accessory instead of a phone.** A genuine modelling error: the
ecosystem slot was implemented as a rival to the devices when R1 describes it as an *attach*. It is
now bought alongside a device with its own attach rate, and the connector stance drives it — which
is the tension the slot exists to create.

**Scale-first had no reason to exist.** It lost every dimension to one of the other two. Three
things were wrong: the conversion curve turned a 12-point score gap into a 20× sales gap so "a bit
worse" meant "sells nothing"; dependability was economically free; and the posture's own doctrine
was badly configured. It now ships a Pro at *basic* tier — cheap enough to clear the prestige bar
and to fit three devices on a budget that only lets the others ship two.

**Modular batteries had no downside anyone felt.** They cost prestige, which only one segment
weighed. They now also cost internal volume — so capability — and 9% more to build. Durability is
not free.

**Long support promises were nearly free.** A flat charge per offer regardless of units sold. Now
costed per unit per year, so promising six years to a large installed base is a real bill.

**Reserve split was a fake choice 76% of the time.** It only mattered when a defect fired. A
well-stocked service operation is visibly better *before* anything breaks, and tied-up capital costs
money regardless — both now modelled.

**Premium was over-committed by default.** A policy bot used as a balance baseline has to be a legal
configuration, not a permanently penalised one.

## Design decisions taken to unblock the gate

**G-01 — the `Offer` entity now exists.** `Variant` is a design, `InstalledBaseCohort` is units
already sold, `Offer` is the sellable-this-quarter thing. No report had this noun and the whole loop
is about it.

**G-05 — four segments ship:** Value Planners (26%), Mainstream Upgraders (32%), Prestige Seekers
(28%), Long-Horizon Owners (14%).

The weights moved substantially during tuning and that is the finding worth carrying forward: **the
segment sizes, not the trait numbers, are the dominant balance lever.** At the first guess
(30/36/16/18) durable served 84% of the population and no amount of price or trait tuning could stop
it dominating. Rebalancing toward Prestige Seekers gave premium a real constituency and the
dominance disappeared.

**G-02 — a demand model had to be invented.** No report supplies one. The shape follows R5's
pipeline: hard must-have veto **before** any soft scoring, then `fit + confidence − burden` over two
or three salient traits. The veto is what stops "more quality wins" — Long-Horizon Owners refuse a
sealed battery at any price, and that refusal is stated, not hidden.

## Honest limitations

- **Interactivity is unverified in a live browser.** The browser tool blocked navigation to the dev
  server. The route prerenders with the full UI in the HTML, the build and lint are clean, and the
  logic is covered by 54 headless tests — but nobody has clicked the thing yet.
- **The numbers are a first guess.** They now satisfy two falsifiable conditions; that is not the
  same as being good.
- **No deadline pressure yet.** The brief calls for a lock deadline. What exists is the lock, not
  the clock — the quarter does not tick, so time pressure is absent. That is a Gate B gap.
- **One quarter only.** No residue, no next quarter, no installed base carried forward.

## What this cost

25 files under the boundary check: sim 13, content 4, presentation 2, devtools 1, tests 5. Lazy
chunk 8.12 kB compressed against R8's 12 MiB first-playable budget. `oi:test` 85 tests total.

## Next

Gate A cannot be closed until Daniel plays it. Specifically:

1. Run the five pre-registered scenarios in the UI, name the cause **before** revealing it, 4 of 5.
2. Answer the two human gates.
3. The honest fun signal is behavioural — does he open it again, unprompted, days later.

If it passes, Gate B adds the quarter clock, the deadline, and residue into Q2. If the human gates
fail, the kill condition applies: two rounds of rebalancing, then pivot rather than iterate.
