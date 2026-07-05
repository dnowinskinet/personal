# Agent Guide

This is the first stop for Codex or any AI collaborator working in this repo.

Before non-trivial changes, read:

- [docs/architecture.md](docs/architecture.md)
- [package.json](package.json) scripts
- [angular.json](angular.json)

## Project Posture

- Angular 21 personal site with SSR and prerendering enabled.
- Hybrid Angular structure: classic `AppModule` plus standalone components. Do not do a full standalone migration unless explicitly requested.
- Tailwind is intentionally on v3. Treat Tailwind 4 as a separate migration.
- Font Awesome Pro packages are installed through the configured npm registry.
- Keep changes scoped. This project has hobby-history layers; avoid broad rewrites unless the task is explicitly a migration.

## Verification

Use this before considering implementation work complete:

```bash
npm run verify
```

Useful focused commands:

```bash
npm run build
npm run lint
npm run audit:prod
npm run deps:outdated
```

## Dependency Notes

- TypeScript should stay within Angular's supported range. For Angular 21, do not jump to TypeScript 6 until Angular supports it.
- The remaining `npm audit` moderate findings are currently in Angular dev-server tooling with no direct app-level fix available.
- Do not force dependency overrides for Angular build tooling unless there is a specific failing issue or advisory path.

## GriftOS Game Work

The GriftOS game concept is governed by the project brief in `Project Brief- Satirical Tech-Elite Idle Tycoon.docx` and the maintained repo docs:

- [docs/game-design.md](docs/game-design.md)
- [docs/economy.md](docs/economy.md)
- [docs/decision-log.md](docs/decision-log.md)
- [docs/content-guide.md](docs/content-guide.md)
- [docs/playtest-plan.md](docs/playtest-plan.md)
- [docs/mechanics-experiments.md](docs/mechanics-experiments.md)
- [docs/interface-architecture.md](docs/interface-architecture.md)
- [docs/prestige.md](docs/prestige.md)
- [docs/audio-architecture.md](docs/audio-architecture.md)

Rules for game work:

- Keep the game under the Experimental route unless a later architecture decision moves it.
- Keep core economy logic independent from Angular presentation.
- Player-facing systems are Hustles, not Generators. Internal compatibility aliases may exist temporarily, but UI copy should use Hustle grammar.
- Keep Hustle/content copy data-driven and editable without changing simulation math.
- Preserve economy, UI, content, and local playtest instrumentation as separate concerns.
- Keep title and major player-facing copy centralized. Do not add hardcoded title strings across templates.
- Do not reintroduce Receipts as an assumed V1 roadmap item. It is abandoned for current V1 planning and only revisitable as a later experiment.
- Valuation is the current in-run value. Net Worth is the current persistent prestige hypothesis. Do not add another thematic currency without an explicit documented decision.
- Rug Pull is a state machine, not a bare reset helper.
- Do not add random events, bosses, extra currencies, offline progress, APIs, backend systems, or major dependency upgrades before their documented phase.
- Do not turn thematic nouns such as Aura, Hype, Narrative, or Founder Myth into currencies without an explicit documented decision.
- Do not implement Clicker Heroes-like mechanics unless a scoped experiment has been explicitly selected.
- Do not invent large mechanic trees without explicit approval. Economy values are simulation-backed hypotheses.
- Use semantic game events first. Do not call audio playback directly from components.
- Audio must be SSR-safe and gesture-unlocked. It must degrade cleanly when assets are absent.
- Visual and audio progression share Enterprise Intensity. Do not create unrelated visual/audio intensity formulas without a documented decision.
- UI must support the host site's light and dark themes.
- Preserve the fictional composite target. Do not name, depict, closely imitate, or imply factual wrongdoing by real tech leaders.
- Add tests for economy-critical logic and run tests plus production build after each implementation phase.
