# Gate A — The quarter race

**Status:** ACTIVE
**Written:** 2026-07-26, before implementation. Replaces `A-lineup-prototype`, which answered the
wrong question.

---

## Why the previous Gate A was scrapped

It tested *"is composing a lineup interesting?"* and built **many decisions made once** — a
configuration form. The reference point is News Tower, which is **few decisions remade constantly
under rising pressure**. Same domain, opposite shape.

The missing clock was not a gap to fill in Gate B. It was the thing the loop hangs off.

Recoverable at commit `2693d3c` if any of it proves useful.

## Hypothesis

**Running a finite quarter where capacity is split between research, production and market prep —
then assembling a product from whatever you actually managed to make — produces real tension and a
legible outcome.**

The payoff moment is *finding out what you can even build*. Not enough parts, the wrong parts, or
bad parts because you skipped the research, and your options at the deadline are limited and shitty.

If this is false, the design does not work and no amount of building art will save it.

## The loop

1. **Quarter opens.** A goal, a finite clock, a fixed staff pool.
2. **Assign capacity across three sinks**, and keep re-assigning as things develop:
   - **Research** — unlocks better part tiers. The probe.
   - **Production** — converts capacity into parts. The infrastructure.
   - **Market prep** — determines how well whatever you ship actually lands. The office side.
3. **Parts accumulate** with a tier set by research level and worker quality.
4. **The deadline approaches** and you rush.
5. **Assembly.** Build a product from parts on hand. Options are visibly constrained by stock — if
   you have no cells, you are not shipping a device.
6. **Launch and score.** Product quality × market readiness.
7. **Payout.** Cash and standing, which are what persist.

## What is real

- A ticking quarter clock with a visible deadline, pausable, speed-controlled.
- Three competing capacity sinks under one pool.
- Three part types at multiple tiers, produced over time, with quality from research and staff.
- An assembly step whose menu is genuinely restricted by inventory.
- A launch score, cash, and standing.

## What is fake

The building. Floors, bays, art, the renderer, workers as individuals. The showroom.
Permits and expansion. Legal, HR, business development. Factions plural. Multiple products.
Anything after the payout.

**Ugly on purpose.** If it looks good, effort went to the wrong place.

## What persists — and what does not

Products are **disposable**. Ship a bad one and you lose money and miss the goal. There is no
installed base, no cohort ledger, no compression, no multi-year support obligation.

What carries forward is **cash** and **standing** — the things that gate expansion. The canonical
image: you cannot dig Basement 3 because there is a subway under it, and moving it needs both
standing enough to get the permit and cash enough to pay for it.

Persistence lives in the institution, not the product. That is a deliberate reversal of R6 and part
of R2, recorded in DECISIONS.md.

## Pass condition

Rescoped for one playtester (D-003). Tester denominators are replaced by **pre-registered scenario**
denominators.

### 1. Machine-measurable — the three sinks are all live

Policy bots that over-invest in each single sink, across ≥200 seeds. No single-sink strategy may
produce the best launch score in more than **55%** of seeds, and every sink must be part of the best
strategy found in at least **20%**.

**Fail:** one sink dominates. Then it is not a tension, it is a right answer with decoration.

### 2. Machine-measurable — the deadline actually binds

Across ≥200 seeds, a run that reallocates capacity at least once mid-quarter must beat a
set-and-forget run in **≥60%** of seeds.

**Fail:** if setting it once at the start is as good, there is no reason to be present while the
clock runs, and this is a spreadsheet with a timer.

### 3. Machine-measurable — assembly is genuinely constrained

In **≥30%** of seeds played to the deadline by a reasonable bot, at least one product option is
unavailable for want of parts.

**Fail:** if you can always build whatever you want, the payoff moment has no teeth.

### 4. Single-tester protocol

Five pre-registered scenarios. The tester names the dominant cause of each outcome before revealing
it. **4 of 5.**

## Kill condition

- Two rounds of rebalancing cannot make all three sinks matter.
- The tester cannot tell a bad allocation from bad luck in 3 of 5 scenarios.
- The quarter is over before there is anything to decide, or drags with nothing to do.

## Human gates — Daniel's alone

- **Does the rush at the deadline actually feel like a rush?**
- **Is finding out what you can build a payoff, or an anticlimax?**

Plus the honest solo fun signal: opening it again, unprompted, days later.

## Work forbidden before this passes

Building art or renderer. `pixi.js` / `phaser`. Floors and bays as objects. Permits and expansion.
Additional departments. A second quarter. Showroom.
