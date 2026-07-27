# Gates

One brief and one result per gate. The **active gate brief is step 3 of the boot sequence** — it is
the only gate document a session reads by default.

Nothing here yet. Gate A has not been briefed.

## Naming

```
gates/
  A-lineup-prototype.brief.md
  A-lineup-prototype.result.md
  B-one-quarter-graybox.brief.md
  ...
```

The brief is written **before** the work and does not change once the gate starts. The result is
written after and records what actually happened, including failure. A gate with no result document
did not pass — it was abandoned, and the result document should say so and why.

## Brief template

Every brief states:

- **Hypothesis** — the single claim this gate can falsify.
- **What is real** — what must actually work.
- **What is fake** — what is explicitly allowed to be a placeholder.
- **Pass condition** — rescoped for N=1. See [../DECISIONS.md](../DECISIONS.md) D-003. If you find
  yourself writing "5 of 7 testers", stop.
- **Kill condition** — what result means stop or pivot, not iterate.
- **Work forbidden before pass** — the things it would be tempting to start early.

## The ladder

From R9, rescoped for one playtester. **Do not plan past Gate C in detail** — Gates A and B may
change everything downstream.

| Gate | Prototype | Answers |
|---|---|---|
| A | Lineup decision prototype | Is composing a lineup under deadline actually fun? |
| B | One-quarter gray box | Does the full quarter loop sustain 25–35 minutes without chore-feel? |
| C | Renderer gauntlet | Pixi or Phaser, measured on a real scenario against R8's budgets |
| D | Showroom launch prototype | Can representative customers make cohort outcomes legible? |
| E | Cross-generation battery benchmark | Does the causal chain stay traceable across quarters? |
| F | Chapter prototype | Is the Liability quarter interesting management or backlog duty? |
| G | Six-quarter compression | Does cohort compression preserve memory without sludge? |
| H | Visual vertical slice | Can the art pipeline hit target quality and repeat it? |
| I | First public playable | Can a stranger onboard and finish a tight slice? |

Gates A and B are the first milestone. See [../DECISIONS.md](../DECISIONS.md) D-004 — the visual
vertical slice sits at H, roughly 6–8 months out, and a beautiful cutaway proves nothing about
whether the core decision is enjoyable.

## The canonical test scenario

R9 defines it and it should be reused across gates so results stay comparable: the **`LARK`**
handheld family — M1 Lite (carryover), M2 Standard, M2 Pro, plus a `DockPass` service/accessory
slot.

Central tension: **sealed high-density battery versus serviceable modular pack**, with a late
ambiguous thermal test signal. The battery causal chain is the canonical legibility test —

> design choice → supplier → test signal → yield → launch claim → customer use → delayed defect →
> returns/diagnostics/repair → reserve consumption → refurb → cohort compression → later resurfacing
