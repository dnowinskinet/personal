# Gate A — The quarter race — Result

**Date:** 2026-07-26
**Status:** Machine-measurable conditions **PASS**. Human gates **NOT YET RUN**.

Brief: [A-quarter-race.brief.md](A-quarter-race.brief.md)

---

## Verdict

| Condition | Result |
|---|---|
| 1 — All three sinks are live | **PASS** — no single-sink strategy wins any seed |
| 2 — The deadline binds | **PASS** — reallocating beats set-and-forget in 78% |
| 3 — Assembly is genuinely constrained | **PASS** — 81% of non-reactive runs hit a wall |
| 4 — Pre-registered scenarios | **NOT AUTHORED** — see below |
| Human — does the rush feel like a rush? | **NOT RUN** — Daniel's |
| Human — is the assembly a payoff or an anticlimax? | **NOT RUN** — Daniel's |

Playable at `/experimental/obsolescence`. Not in the public experiments index.

## Sweep, 200 seeds

| Bot | Mean score | Wins | Meets goal |
|---|---:|---:|---:|
| Research-heavy | 33.7 | 0 | 0% |
| Production-heavy | 9.0 | 0 | 0% |
| Market-heavy | 21.0 | 0 | 0% |
| Balanced (set once) | 53.5 | 69 | 21% |
| Adaptive (reallocates) | 60.2 | 131 | 98% |

The shape that matters: **balanced meets the goal 21% of the time, adaptive 98%.** Setting it once
and walking away ships something adequate and misses the target. Watching the shelves and
redirecting production hits it almost every time. That gap is the reason to be present while the
clock runs.

Every lopsided bot is badly punished. Production-heavy is worst at 9 — it never researches, so
every part is tier 1 and it can only ever build salvage.

## Verified in a live browser

Unlike the previous Gate A, this one was actually played:

- The clock ticks at 10 Hz, pauses, and runs at 1×/2×/4×.
- Research level rises mid-quarter and visibly raises the tier being produced.
- The shelf display makes scarcity readable at a glance — an empty tier-3 column is obvious.
- At the deadline with balanced play, seed 4242: chassis 3/1/1, board 2/3/0, cell 2/1/1.
  **Flagship blocked: "no board at tier 3 or better."** Tier-3 research, tier-3 chassis and cells,
  and no boards — so the best option is off the table.
- Shipped Standard: quality 61, readiness 63%, **score 46 against a target of 56. Goal missed,
  standing −8.**

That is exactly the intended experience, produced by ordinary play rather than a contrived fixture.

## What tuning revealed

**Everything saturated at first.** Every bot scored identically because research, market and parts
all maxed out long before the deadline. A quarter with no scarcity has no decisions in it.

**Scarcity and attentiveness traded against each other.** Making parts scarcer raised the assembly
constraint but *eroded* the adaptive bot's edge — because its advantage comes from tier-3 parts, and
when those are rare it gets blocked too. Fixed by making top-tier parts rarer *without* reducing
throughput: the constraint bites, but paying attention still pays.

**The adaptive bot had to actually adapt.** A fixed three-phase schedule is just a static allocation
with extra steps. It now checks which part is scarcest at the current tier and redirects production
— which lifted its edge from 55% to 78% and is precisely the behaviour the design wants to reward.

**Condition 3 is measured on non-expert play.** Gating it on the adaptive bot was wrong: an expert
who watches the shelves *should* be able to route around scarcity, and calling that a failure would
punish the game for rewarding skill. It is measured on the balanced bot instead.

**A build bug worth recording:** `tsc` does not delete outputs for source files that no longer
exist, so the deleted lineup tests kept running from stale `dist/oi-sim` output. `oi:sim` now cleans
first.

## Not done

- **Condition 4 has no scenarios yet.** The five pre-registered situations for the single-tester
  protocol are not authored. The machine conditions pass without them; the human comprehension check
  cannot run until they exist.
- **No residue.** Cash and standing come out of a quarter but nothing consumes them yet. Permits and
  expansion are the next layer and are deliberately out of scope.
- **One quarter only.** No second quarter, no obsolescence of the previous product.
- **Offices are one slider.** Marketing, sales and business development are collapsed into "market
  prep". Legal and HR do not exist. That is the right level for testing the loop, but it is not the
  design.

## Next

Gate A cannot close until Daniel plays it:

1. **Does the rush at the deadline feel like a rush?**
2. **Is finding out what you can build a payoff, or an anticlimax?**

If it passes, the next questions are the residue layer — cash and standing gating expansion — and
whether the office side needs to be more than one slider before it is interesting.
