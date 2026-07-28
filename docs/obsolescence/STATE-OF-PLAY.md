# Obsolescence, Inc. — state of play

**Written:** 2026-07-27, as a self-contained handover. Assumes no prior context.

This is for a human, not an agent. The agent-facing docs are `CURRENT-STATE.md` (where things are),
`DECISIONS.md` (why), and `AGENTS.md` (how to work here).

---

## What it is

A management game about running a consumer-electronics company from one building. You spend a
quarter producing parts, then build a product out of whatever you actually managed to make, ship it,
and live with the result. The satire is aimed at institutional incentives — the showroom upstairs
tells a story, the basement downstairs is how that story gets produced.

Browser-based, single-player, no backend. It lives at `/experimental/obsolescence` on a personal
Angular site. Not linked publicly.

## What exists and works right now

A playable prototype, verified in a browser end to end.

**The building.** A vertical SVG cutaway: sky above, hatched earth below, pavement at street level,
a double-height showroom as the hinge, personnel and freight cores running the height, a loading
ramp down to the first basement, and a subway tunnel bored through B3 that you cannot dig past until
you can afford to move it. Offices go up, manufacturing goes down. Nine levels, +3 to B4.

**The quarter.** A three-minute real-time race with a clock, pause, and 1×/2×/4×. You place staff on
floors — that IS the allocation, there are no sliders — and they contribute to research, production
or market prep depending on which floor they're standing on. Parts accumulate on shelves at tiers
gated by how much research you've done.

**The payoff.** At the deadline you build a product from what's on the shelf. The menu is derived
entirely from your inventory, so "no board at tier 3 or better" is a normal outcome. Score is
build quality carried by market readiness.

**The campaign.** Cash and standing carry forward. Cash buys floors, standing decides which floors
are even offered. Products are disposable — no installed base, no ledger, nothing lingers.

**The onboarding.** Five stages that turn systems on one at a time. Q1 is one part, no choices, 60
seconds, and cannot be failed. By Q5 everything is live.

**Verification.** 66 headless tests, an architecture boundary checker with its own 31-test
regression suite, and a 200-seed balance sweep that confirms no single strategy dominates and that
reallocating mid-quarter beats setting it once (78% of seeds).

## How it's built

Angular 21, TypeScript, no new dependencies at all — nothing has been installed. Deliberately
layered: a pure deterministic simulation kernel with no framework or DOM imports, content as data,
presentation on top. A boundary script fails the build if those layers get crossed. The simulation
runs headlessly under `node --test`.

Roughly 4,000 lines of source across 29 files, plus documentation.

## What's decided, and the reasoning worth keeping

Twenty-six numbered decisions are in `DECISIONS.md`. The load-bearing ones:

- **Persistence lives in the institution, not the product.** Products are obsolete within a quarter.
  What survives is cash and reputation, and what they buy is floors. This deliberately killed a
  large research-derived model of installed bases, support obligations and generational memory.
- **Few decisions remade under pressure, not many decisions made once.** An earlier build had you
  configure a product lineup up front; it read as a form. The clock is the thing the loop hangs off.
- **Systems arrive one at a time.** Dropping a player into the full game "hits the learning curve
  like a brick wall."
- **The building is the interface.** You don't set "research: 5", you put five people in the lab, and
  only if you built a lab.
- **One playtester, so validation is split.** Machine sweeps for balance and dominance, pre-registered
  scenarios for comprehension, and two questions only a human can answer.

## What's open

- **The showroom has no mechanical job.** It's the most prominent floor and it does nothing. It
  visibly accepts staff who then contribute nothing. There's a sketch of it becoming a keynote /
  unveiling moment at quarter end, but nothing is decided.
- **Market prep has no physical form.** Production makes visible parts; research raises a visible
  tier; marketing fills a bar. It's half the core decision and the least legible thing in the game.
- **Nothing happens during the quarter.** No events, no RNG to react to. You place staff, press Run,
  and watch. The intended feel was "plough through random events with finite resources"; that half
  isn't built.
- **Legal and HR are just office floors** with no distinct mechanic.
- **No renderer decision.** The SVG is explicitly a skeleton, not a commitment. Pixi, Phaser, canvas —
  all still open.

---

## The reinventing-the-wheel question

This is the honest part, and it's worth taking somewhere else to think about properly.

### Where we genuinely re-derived things the genre already solved

**The demand model.** Nine research reports were commissioned and *none* of them supplied one — how
many customers exist, how demand responds to price or quality, what a conversion rate means. So one
was invented from scratch, then hand-tuned across roughly ten iterations to stop a single strategy
dominating. Every tycoon game of the last thirty years has an answer to "customers choose between
your products." Game Dev Tycoon, Software Inc., Project Highrise and Big Pharma all ship working
versions. We derived instead of borrowing.

**Progression gating.** Money plus reputation unlocking new floors is SimTower and Project Highrise
standard. It was arrived at here by reasoning from News Tower's faction system rather than by
recognising it as the genre default.

**Worker allocation.** "Distribute finite staff between competing departments" is Fallout Shelter,
RimWorld, Software Inc., and a hundred others.

**Balance by sweep.** Building a policy-bot sweep and tuning constants against it is rigorous, and it
did catch seven real failures. But some of what it was tuning — cost curves, progression pacing —
has well-known conventions that could have been starting points rather than discoveries.

### Where the work was not wasted

**The architecture.** Deterministic kernel, enforced boundaries, headless tests. Genre-independent
engineering hygiene, and it has already paid for itself — the design pivoted twice without the
foundation moving.

**The research reconciliation.** Nine reports had been commissioned before any of this started and
they contradicted each other in 64 places. Reconciling them was unavoidable once they existed. That
said — see below.

**The genuinely novel part.** Assembling a product at the deadline *from whatever you happened to
produce*, with the menu constrained by your actual inventory, is the bit I haven't seen elsewhere in
this form. Crafting games have inventory constraints; tycoon games have product design; the
combination — where the interesting moment is finding out what you can even build — feels like the
real idea. So does the specific satirical frame.

### The uncomfortable observation

The nine research reports may have been the wrong instrument. They surveyed comparable games
extensively — News Tower, Project Highrise, Two Point Hospital, Good Company, Software Inc., Big
Pharma are all in there — but they produced abstraction rather than transferable mechanics. They say
things like "the recurring public object should be a quarterly lineup launch." They do not say
"Project Highrise gates floor unlocks like this, here are the numbers, copy it."

So the project has been deriving a design from a survey of designs, rather than starting from a
known-good base and changing the parts that need to be different.

### Questions worth taking elsewhere

1. **Should the base be "SimTower plus a production chain plus a quarterly deadline"** — a known
   genre skeleton with known solutions — rather than something derived from research documents?
2. **Which parts are actually novel enough to deserve first-principles work?** My honest list is
   short: the assemble-from-what-you-made payoff, and the satirical frame. Everything else probably
   has a good answer already in print.
3. **What should the showroom do?** Rather than inventing something, what do comparable games do with
   their public-facing floor, and does one of those fit?
4. **Is the economy worth designing at all**, or should it be lifted from a game with a proven curve
   and reskinned?
5. **What is the actual reference?** "SimTower up, Fallout Shelter down, News Tower's deadline" has
   been the working shorthand. Is that the design, and if so should it be written down as the
   explicit target rather than being reconstructed each time?

### One caution

Borrowing genre solutions is right for the plumbing and wrong for the premise. The two design
changes that most improved this project both came from a human playing it for three minutes and
saying what felt wrong — not from research and not from convention. Whatever gets lifted, the thing
that makes it worth building probably still has to be derived.
