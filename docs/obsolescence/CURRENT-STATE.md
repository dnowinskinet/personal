# Obsolescence, Inc. — Current State

**Last updated:** 2026-07-26
**Phase:** 1, 2 and 3 complete. **Gate A is built and awaiting Daniel.**

This file is rewritten at the end of every session. It describes the present, not the history. For
history, read [DECISIONS.md](DECISIONS.md).

---

## Where the project actually is

**There is a playable prototype.** `/experimental/obsolescence` — compose a quarterly lineup under a
capacity ceiling, lock it, and watch five outcome dimensions disagree with each other.

**Gate A's machine-measurable conditions pass. Gate A is not closed.** The two human gates and the
scenario protocol are Daniel's and cannot be run by an agent. See
[gates/A-lineup-prototype.result.md](gates/A-lineup-prototype.result.md).

Not listed in the public experiments index. Gate A is internal; the first public playable is Gate I.

## What Daniel needs to do

1. Open `/experimental/obsolescence`.
2. Run the five **pre-registered scenarios** (in the collapsible panel). For each: read the outcome,
   say out loud what the dominant cause was, **then** reveal the expected cause. Four of five is a
   pass. Answering after revealing measures nothing.
3. Answer the two human gates: **does this feel like chores?** and **does the decision have a point
   of view, or is it filling in a form?**
4. The honest fun signal is behavioural — opening it again, unprompted, days later.

If it passes, Gate B. If the human gates fail, the kill condition applies: two rounds of
rebalancing, then pivot rather than iterate.

## Verification status

| Command | Result |
|---|---|
| `npm run oi:arch` | passes across 25 files (sim 13, content 4, presentation 2, devtools 1, tests 5) |
| `npm run oi:arch:test` | 31/31 |
| `npm run oi:sim` | purity gate clean, 54/54 |
| `npm run verify` | lint and build clean, 9 static routes prerendered |

Lazy chunk 8.12 kB compressed, against R8's 12 MiB first-playable budget.

## What the dominance sweep caught

The first Gate A build **failed**, and every failure was invisible to human playtesting:

- Durable swept **100%** of seeds — "pick the reliable supplier" beat every other decision.
- Every segment bought the £129 accessory instead of a phone. The ecosystem slot was modelled as a
  rival to the devices rather than an attach (D-016).
- Scale-first lost every dimension and had no reason to exist.
- Modular batteries, long support promises and dependability were all economically free.
- The reserve split was a fake choice in 76% of seeds.

The fix that mattered was not trait tuning: **segment population weights are the dominant balance
lever** (D-017). A posture serving 84% of buyers adequately beats one serving 52% brilliantly, and
no amount of price tuning changes that.

## Immediate next step

**Blocked on Daniel playing Gate A.** Nothing else should start first.

When it passes, Gate B is the one-quarter gray box: the quarter clock and lock deadline (Gate A has
the lock but no clock, so there is no time pressure yet), early returns, and residue carried into
Q2. Q-007 — the save-key namespace — has to be answered there.

## Phase plan

| # | Phase | Effort | Status |
|---|---|---|---|
| 0–3 | Inventory, doc triage, research synthesis, architecture | — | Complete |
| 4 | **Gate A — lineup decision prototype** | high | **Built; awaiting human gates** |
| 5 | Gate B — one-quarter gray box | high | Blocked on Gate A |
| 6 | Gate C — single-stack renderer gauntlet | medium | Blocked on Q-004 |
| 7+ | Gates D–I | TBD | Re-derive after A and B run |

## What is not settled

[OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) — Q-004 (mockups, Gate C), Q-006 (ladder re-derivation),
Q-007 (save keys, Gate B), and coverage gaps. **G-01 and G-05 are now closed** by Gate A; G-02 (demand
model) is answered provisionally by an invented model that Gate A exists partly to falsify.

[CONTRADICTIONS.md](CONTRADICTIONS.md) — eight open conflicts C-11…C-18 and seven rejected
resolutions U-01…U-07. **C-15 remains the one to watch**: four reports hand down fixture lists
totalling ~35 scenarios against R9's budget of 5, and now that every gate is scenario-denominated
that conflict gates the whole validation ladder. Gate A used five.

## Known limitations of what was built

- **Interactivity is unverified in a live browser.** The browser tool blocked navigation to the dev
  server. The route prerenders with the full UI in its HTML and 54 headless tests cover the logic,
  but nobody has clicked it.
- **No quarter clock.** The lock exists; the deadline pressure does not. Gate B.
- **The economy numbers are a first guess** that now satisfy two falsifiable conditions. That is not
  the same as being good.

## Verified repo facts

- Angular 21.2.18, TypeScript 5.9.3, Node 22.20.0, Tailwind 3.4.19, ESLint 10.7.
- `tsconfig.app.json` compiles only from entry points; unwired game files add no bundle weight.
- `/dist` is gitignored, so `dist/oi-sim` output is never committed.
- CI runs `oi:test` on Linux and Windows.
- `node --test <dir>` does not recurse on Node 22.20; `oi:sim` passes a quoted glob.
- Inside the game tree, use **relative imports** — the emitted CommonJS for the Node test build
  cannot resolve `@oi/*`. The aliases are for code outside the tree, which Angular bundles.
- `.claude/launch.json` defines a `dev` preview server on port 4200.

## Standing reminders

- Session close is non-negotiable: rewrite this file, append to `DECISIONS.md`.
- Only `idb`, `fake-indexeddb`, `@playwright/test` are approved — and **none are installed yet**;
  nothing so far has needed them. Do not install `pixi.js` or `phaser`; C-41 made Gate C a
  single-stack run, so the bake-off that justified `phaser` no longer exists.
- Do not touch GriftOS.
- `npm run verify` and `npm run oi:test` must both pass.
- Fix the vocabulary collision before writing more schema: `componentSlot` / `baySocket` /
  `packageSlot`.
