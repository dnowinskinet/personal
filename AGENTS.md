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

