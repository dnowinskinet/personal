# GriftOS — Agent Guide

Doctrine for work on the GriftOS game under `src/app/pages/experimental/grift-os-game/`.

**Scope warning:** everything in this file and in `docs/griftos/` applies to GriftOS only. It has no
authority over the rest of the site or over Obsolescence, Inc. See the root
[AGENTS.md](../../AGENTS.md) for site-wide facts.

## Source precedence

Use this authority order:

1. [CURRENT-STATE.md](CURRENT-STATE.md)
2. [decision-log.md](decision-log.md)
3. Latest dated canonical design, economy, and architecture documents in this folder
4. Current code and tests as implementation evidence
5. Research references
6. Historical task contracts and project chats

Code and tests prove current behavior; they do not silently overrule newer product decisions.
Orient with [CURRENT-STATE.md](CURRENT-STATE.md), then use
[ARCHITECTURE-MAP.md](ARCHITECTURE-MAP.md) to find the responsible layer.

## Verification

Use the workflow in [VERIFICATION.md](VERIFICATION.md). GriftOS work must pass both:

```bash
npm run verify
```

```bash
npm run grift:test
```

`grift:test` runs the architecture boundary check (`npm run grift:arch`, backed by
`scripts/check-grift-boundaries.mjs`) plus the focused GriftOS spec suite.

## Boundaries

- Keep GriftOS under `/experimental/grift-os` unless a later decision moves it.
- Preserve primary `grift-os-meta-v2` / `grift-os-run-v2`, the rollback-safe v1 migration/mirrors,
  and current Influence IDs unless a later approved migration explicitly changes them.
- Keep formulas, tuning, content, presentation, visuals, audio, runtime, and development tooling as
  distinct owners; see [ARCHITECTURE-MAP.md](ARCHITECTURE-MAP.md).
- The current architecture is transitional. Target paths and ownership documented as `TARGET` are
  not yet implemented.
- Desktop and mobile are authored visual targets. Intermediate widths must remain functional but
  receive no dedicated art direction.
- Support authored light/dark expressions and safe site-accent inheritance.
- Use semantic game events; components must not call audio playback directly.
- Audio remains SSR-safe, gesture-unlocked, and optional when assets are absent.
- Enterprise Intensity/Stage is compatibility state, not the required future player-facing visual
  model.
- Preserve the documented eight-hour offline-credit cap unless an approved mechanics decision
  changes it.
- Do not add currencies, random events, bosses, backend systems, major mechanic trees, or broad
  dependency upgrades without an explicit decision.
- Preserve the fictional composite target; do not imitate or allege wrongdoing by real people.

Durable constraints and their tests are indexed in [INVARIANTS.md](INVARIANTS.md). Historical task
briefs are not current authority unless a newer canonical source explicitly adopts them.

## Document index

| Document | Role |
|---|---|
| [CURRENT-STATE.md](CURRENT-STATE.md) | Canonical orientation; read first |
| [decision-log.md](decision-log.md) | Dated settled decisions |
| [INVARIANTS.md](INVARIANTS.md) | Durable constraints paired with enforcing tests |
| [ARCHITECTURE-MAP.md](ARCHITECTURE-MAP.md) | Source locations, ownership, dependency direction |
| [VERIFICATION.md](VERIFICATION.md) | Required commands and evidence |
| [game-design.md](game-design.md) | Design intent |
| [economy.md](economy.md) / [economy-tuning-brief.md](economy-tuning-brief.md) | Economy model and tuning handoff |
| [prestige.md](prestige.md) | Rug Pull extraction model |
| [interface-architecture.md](interface-architecture.md) | Target interface architecture |
| [content-guide.md](content-guide.md) | Tone and authoring rules |
| [audio-architecture.md](audio-architecture.md) | Audio posture |
| [playtest-plan.md](playtest-plan.md) | Playtest objectives |
| [mechanics-experiments.md](mechanics-experiments.md) | Scoped hypotheses, not commitments |
| [GRIFTOS-VISUAL-DIRECTION-CHARTER.md](GRIFTOS-VISUAL-DIRECTION-CHARTER.md) | Editorial north star (draft) |
| [GRIFTOS-REPOSITORY-TRUTH-PACKET.md](GRIFTOS-REPOSITORY-TRUTH-PACKET.md) | Frozen 2026-07-17 audit snapshot |
| [HUSTLES-UX-RESET.md](HUSTLES-UX-RESET.md) | Historical implemented task contract |
