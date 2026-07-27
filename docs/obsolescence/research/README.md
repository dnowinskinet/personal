# Research — R1 through R9

**Frozen and read-only.** These are finished artifacts mirrored into the repo because agents need
them at edit time. Do not edit them. Reconciliation output belongs in a separate canon document.

All nine were authored 2026-07-26 with GPT-5.6 Deep Research. Filenames were normalized to
kebab-case on import; content is byte-identical to the originals.

| Doc | Subject | Lines | Status |
|---|---|---:|---|
| [R1](R1-core-loop-and-launch-cadence.md) | Core loop and launch cadence | 211 | Complete |
| [R2](R2-product-line-content-system.md) | Product line content system | 364 | Complete |
| [R3](R3-flagship-building-and-flow.md) | Flagship building and flow | 556 | Complete |
| [R4](R4-development-factory-and-operations.md) | Development factory and operations | 324 | Complete |
| [R5](R5-showroom-market-and-customers.md) | Showroom, market and customers | 4313 | Complete |
| [R6](R6-campaign-generations-and-progression.md) | Campaign generations and progression | 554 | Complete |
| [R7](R7-satire-player-role-and-tone.md) | Satire, player role and tone | 284 | Complete |
| [R8](R8-browser-architecture-visual-feasibility-and-ai-capability.md) | Browser architecture, visual feasibility, AI capability | 542 | Complete |
| [R9](R9-prototype-and-product-brief-plan-PARTIAL.md) | Prototype and product brief plan | 381 | **PARTIAL** |

Total ~664 KB across 7,529 lines. R5 alone is 252 KB — roughly five times any other report, and
large enough that reading it in full is a deliberate act, not an incidental one. The handoff's
"≈150 KB, small enough to read in full" estimate was low by more than 4×.

## One-line verdicts

- **R1** — Quarterly lineup launch is the recurring public object. One carried-over low end, one new
  Standard, one new Premium, one optional ecosystem slot. 25–35 minutes of active play per quarter.
- **R2** — First category is a fictional smartphone/handheld family. Model a product as *shared
  platform + variant promises + lifecycle obligations*, never as a bundle of stats. Printers are the
  fallback category and the extension stress test.
- **R3** — Fixed-width, three-lane, side-on vertical cutaway. Street-level showroom hinge, B1
  dock/ramp industrial hinge, modular lifecycle bands below, configurable project bands above.
- **R4** — Modular bays with fixed service trunks and limited internal snap slots. Automatic routing
  between lifecycle phases. The player configures; they never draw conveyors.
- **R5** — Transforming flagship observatory. Visible customers are representative evidence, not
  tiny gods whose purchases are multiplied into global sales. Seven conflict-bearing segments. Five
  disagreeing outcome dimensions, no overall grade.
- **R6** — Chaptered permanent-company campaign with optional post-credits continuation. Proposes 18
  quarters across 6 chapters. Three visible generations maximum; older ones compress into cohorts.
- **R7** — Satirize institutional incentives, not "products designed to fail". The player is the
  company's operating logic. Keep the humour in systems and euphemism; stay sincere at the point of
  harm. Retain the title, broaden the thesis.
- **R8** — Angular shell + lazy game route + PixiJS + pure TS deterministic sim + worker-capable host
  + `idb` saves + GitHub Pages. Phaser 4 is the defined fallback with named triggers.
- **R9** — Gate ladder A→I. Working assumption of 15 quarters / 5 chapters / one category / 3 visual
  waves. `LARK` handheld family as the canonical test scenario.

## Reading R9 carefully

R9 is **self-declared provisional**. The Deep Research run that produced it did not have R1–R8
attached — it worked from a summary brief. Its gate architecture is still the backbone of the plan,
but every cross-report claim in it is unverified.

A Deep Research rerun is *not* needed. An agent that can read all nine reports directly can do the
reconciliation itself. That work is a planned phase, not an external dependency. See
[../OPEN-QUESTIONS.md](../OPEN-QUESTIONS.md) Q-005 for the contradictions already visible.

## A warning that applies to all nine

Every report proposes pass conditions of the form "at least 80% of testers can name three of the
four causal reasons" (R5), "at least 5 of 7 testers can explain why their quarter succeeded" (R9),
or "at least 80% of testers can correctly explain two present burdens" (R6).

**There is one playtester.** All of these are void as written. See
[../DECISIONS.md](../DECISIONS.md) D-003 for the replacement validation model. Do not implement a
gate straight from a research report without rescoping its pass condition first.
