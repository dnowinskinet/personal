# Agent Guide

Start here for Codex or any AI collaborator working in this repository.

## Source precedence

Use this authority order:

1. CURRENT STATE
2. DECISION LOG (`docs/decision-log.md`)
3. Latest dated canonical design, economy, and architecture documents
4. Current code and tests as implementation evidence
5. Research references
6. Historical task contracts and project chats

Code and tests prove current behavior; they do not silently overrule newer product decisions. Orient GriftOS work with [docs/CURRENT-STATE.md](docs/CURRENT-STATE.md), then use [docs/ARCHITECTURE-MAP.md](docs/ARCHITECTURE-MAP.md) to find the responsible layer.

## Project posture

- Angular 21 personal site with SSR and prerendering.
- Tested toolchain: Node 22, npm 10, Angular 21.2, TypeScript 5.9.
- Hybrid Angular structure: classic `AppModule` plus standalone components. Do not perform a broad standalone migration unless explicitly requested.
- Tailwind remains on v3; treat Tailwind 4 as a separate migration.
- Font Awesome Pro resolves through the configured npm registry.
- Keep changes scoped and add no dependency without explicit approval.

## Verification

Use the workflow in [docs/VERIFICATION.md](docs/VERIFICATION.md). At minimum, implementation work must pass:

```bash
npm run verify
```

GriftOS work normally also requires:

```bash
npm run grift:test
```

## GriftOS boundaries

- Keep GriftOS under `/experimental/grift-os` unless a later decision moves it.
- Preserve `grift-os-meta-v1`, `grift-os-run-v1`, and current Influence IDs unless an approved save migration explicitly changes them.
- Keep formulas, tuning, content, presentation, visuals, audio, runtime, and development tooling as distinct owners; see [docs/ARCHITECTURE-MAP.md](docs/ARCHITECTURE-MAP.md).
- The current architecture is transitional. Target paths and ownership documented as `TARGET` are not yet implemented.
- Desktop and mobile are authored visual targets. Intermediate widths must remain functional but receive no dedicated art direction.
- Support authored light/dark expressions and safe site-accent inheritance.
- Use semantic game events; components must not call audio playback directly.
- Audio remains SSR-safe, gesture-unlocked, and optional when assets are absent.
- Enterprise Intensity/Stage is compatibility state, not the required future player-facing visual model.
- Preserve the documented eight-hour offline-credit cap unless an approved mechanics decision changes it.
- Do not add currencies, random events, bosses, backend systems, major mechanic trees, or broad dependency upgrades without an explicit decision.
- Preserve the fictional composite target; do not imitate or allege wrongdoing by real people.

Durable constraints and their tests are indexed in [docs/INVARIANTS.md](docs/INVARIANTS.md). Historical task briefs are not current authority unless a newer canonical source explicitly adopts them.
