# Agent Guide

Start here for any AI collaborator working in this repository.

This file covers **site-wide facts only**. Individual games and experiments carry their own
doctrine, and that doctrine does **not** transfer between them. Find your area below and read its
guide before writing code.

## Router

| Area | Guide | Notes |
|---|---|---|
| Site (build, deploy, routing, layout, pages) | [docs/architecture.md](docs/architecture.md) | Stack, folder map, deployment, dependency policy |
| GriftOS | [docs/griftos/AGENTS.md](docs/griftos/AGENTS.md) | Mature incremental game under `/experimental/grift-os` |
| Obsolescence, Inc. | [docs/obsolescence/AGENTS.md](docs/obsolescence/AGENTS.md) | Management game in pre-implementation planning |

**GriftOS and Obsolescence, Inc. are unrelated projects.** They share a navbar entry under
Experiments and nothing else — no code, doctrine, save keys, content, or visual direction. Do not
apply one project's conventions to the other. If you arrived here from a GriftOS document, its
authority stops at the GriftOS route.

Other experiments under `src/app/pages/experimental/` (sudoku-game, model-grip-game,
ai-settlement-game, senator-matching-game, game-prototype, degrees) have no dedicated guides.
Treat them as small self-contained toys.

## Project posture

- Angular 21.2 personal site with SSR and prerendering, deployed to dnowinski.com.
- Tested toolchain: Node 22, npm 10, Angular 21.2, TypeScript 5.9.
- Hybrid Angular structure: classic `AppModule` plus standalone components. Do not perform a broad
  standalone migration unless explicitly requested.
- Tailwind remains on v3; treat Tailwind 4 as a separate migration.
- ng-bootstrap 20, Express 5 SSR entry, Karma/Jasmine tests, ESLint 10.
- Font Awesome Pro resolves through the configured npm registry. Local icon assets live in
  `src/assets/fontawesome/`; run `npm run icons:sync` after changing imported icons.
- Keep changes scoped and **add no dependency without explicit approval**.
- `src/app/pages/experimental/` is playground surface and is not core site infrastructure.

## Verification

All implementation work must pass:

```bash
npm run verify
```

That runs lint plus build. Per-area guides may require additional commands — GriftOS work also
requires `npm run grift:test`. Check the guide for your area.

## Repository conventions

- Routed pages live under `src/app/pages/`; shared UI under `src/app/shared/`; cross-cutting
  services under `src/app/core/`.
- Deployment is `npm run deploy:pages`, which builds and publishes `dist/dnowinski/browser` to the
  `gh-pages` branch and preserves the `CNAME` custom domain.
- The site must keep working. No experiment may break SSR, prerendering, or the Pages deployment.
- Preserve fictional composite targets in satirical content; do not imitate or allege wrongdoing by
  real people.
