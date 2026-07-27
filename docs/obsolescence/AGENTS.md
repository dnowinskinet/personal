# Obsolescence, Inc. — Agent Guide

Doctrine for work on the Obsolescence, Inc. game.

**Scope warning:** this guide governs Obsolescence, Inc. only. GriftOS documentation under
`docs/griftos/` has **no authority here** — different architecture, different save keys, different
visual doctrine, different design goals. The two projects share a navbar entry and nothing else.
See the root [AGENTS.md](../../AGENTS.md) for site-wide facts.

## Boot sequence

Every session runs this read order in its first few minutes, then stops:

1. **[CURRENT-STATE.md](CURRENT-STATE.md)** — where the project actually is right now
2. **[INVARIANTS.md](INVARIANTS.md)** — constraints you must not violate
3. **The active gate brief** in [gates/](gates/) — what is being proven right now

Read nothing else unless the task demands it. This budget is what makes session 2 through session
80 cheap, which matters because the work cadence is opportunistic — Daniel picks this up when he
feels like it, sometimes after weeks away.

Consult on demand, not by default:

- [DECISIONS.md](DECISIONS.md) — when you need to know *why* something is the way it is
- [ARCHITECTURE.md](ARCHITECTURE.md) — when touching structure, boundaries, or build wiring
- [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) — when you hit something undecided
- [research/](research/) — when a design question needs its evidence base
- [HANDOFF.md](HANDOFF.md) — the origin document; historical context, superseded by CURRENT-STATE

## Session close protocol

**Non-negotiable. This is not housekeeping.**

Every session that changes anything must end by:

1. Rewriting [CURRENT-STATE.md](CURRENT-STATE.md) to describe the new reality.
2. Appending any newly settled decision to [DECISIONS.md](DECISIONS.md) — dated, numbered, with
   rationale.
3. Updating [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) if a question was answered or a new one appeared.

If you skip this, the next session pays for it. CURRENT-STATE.md is rewritten, not appended to —
it describes the present, not the history. DECISIONS.md is append-only.

## What this project is

A pausable real-time management game about designing, launching, supporting, repairing, replacing,
and disposing of consumer product lineups from one flagship building that remembers its own
promises.

- **Thematic thesis:** the showroom is the story the company tells; the basement is how that story
  is produced.
- **Core loop:** define lineup → allocate capacity and promises → survive production uncertainty →
  stage launch → absorb consequences → begin next quarter with residue.
- **Target:** desktop web and mobile web, single-player, statically deployed, no backend.
- **Route:** `/experimental/obsolescence`.

## Working agreements

- **The agent is the implementer, end to end.** Daniel is not writing the code. Do not hand back
  plans that assume a human will do the typing.
- **Playtesting is Daniel alone. N=1.** Any validation design that needs "5 of 7 testers" is void
  here. See [DECISIONS.md](DECISIONS.md) D-003 for the replacement model.
- **No new dependencies without explicit approval.** This is a site-wide rule and it is enforced
  here too.
- **Do not touch GriftOS.** Not its code, not its docs, not its save keys, not its scripts.
- **The site must keep working.** SSR, prerendering, and the GitHub Pages deployment are not
  allowed to regress.
- **Ugly is fine early.** Gates A and B are explicitly not visual work. Do not polish ahead of the
  gate you are on.

## Verification

Site-wide, all work must pass:

```bash
npm run verify
```

Obsolescence-specific commands do not exist yet. When they do, they will be named `oi:*` and
documented here and in [ARCHITECTURE.md](ARCHITECTURE.md).

## Research base

Nine research reports (R1–R9) are mirrored read-only into [research/](research/). They are finished
artifacts and should not be edited. R9 is self-declared **partial** — it was produced without R1–R8
attached. Its gate ladder is still the backbone of the plan, but treat its cross-report claims as
unverified until the synthesis pass reconciles them.
