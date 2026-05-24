# Architecture

This project is a personal site that began as static HTML and later moved into Angular. The codebase still has some historical layers, but the current working shape is stable and intentionally pragmatic.

## Current Stack

- Angular 21
- Angular SSR and prerendering
- Tailwind CSS 3
- Font Awesome Pro 7
- ng-bootstrap
- Express server entry for SSR output
- GitHub Pages deployment via `angular-cli-ghpages`

## App Shape

The app is a hybrid Angular application:

- `src/app/app.module.ts` is still the root NgModule.
- Some components are standalone and imported into the module or other standalone components.
- Routing is defined in `src/app/app-routing.module.ts`.
- SSR entrypoints are `server.ts`, `src/main.server.ts`, and the Angular application builder settings in `angular.json`.

This hybrid shape is acceptable. New focused components can be standalone, but a full standalone migration should be a dedicated task.

## Folder Map

- `src/app/core`: cross-cutting services, pipes, and directives.
- `src/app/data`: static site data and schema/type files.
- `src/app/icon`: local icon path definitions.
- `src/app/layout`: persistent layout components such as navbar and footer.
- `src/app/pages`: routed page components and page-specific features.
- `src/app/shared`: reusable UI components and shared directives.
- `src/assets`: images, icons, PDFs, and other static assets.
- `src/environments`: Angular environment files.

## Important Commands

```bash
npm start
npm run build
npm run lint
npm run verify
npm run audit:prod
npm run deps:outdated
```

`npm run verify` is the preferred completion check for code changes.

## Deployment

The existing deployment path uses:

```bash
npm run push
push.bat
```

`push.bat` calls `angular-cli-ghpages` against `dist/dnowinski/browser`.

Before changing deployment, check:

- `angular.json`
- `push.bat`
- `CNAME`
- GitHub Pages settings

## Styling

Tailwind CSS is configured in `tailwind.config.ts`, with global styles in `src/styles.scss`.

The app currently uses Tailwind 3 syntax:

```scss
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Tailwind 4 should be treated as a separate migration because it changes config and stylesheet conventions.

## Dependency Policy

- Keep Angular packages in version lockstep.
- Respect Angular peer constraints for TypeScript and Zone.js.
- Avoid dependency overrides for Angular build tooling unless there is a specific reason.
- Prefer removing unused packages over upgrading packages that are no longer needed.
- Font Awesome Pro packages should resolve through `.npmrc`; local tarballs are only needed for offline installs or registry failures.
- Full Font Awesome asset downloads can live in ignored local source cache `vendor/fontawesome-source/`; only curated app assets should be promoted into `src/assets/fontawesome/`.
- Run `npm run icons:sync` to copy SVGs for Font Awesome icons imported in `src` into `src/assets/fontawesome/icons/`.

## Current Known Tradeoffs

- The lint config is tuned to pass with existing project conventions rather than enforcing a full Angular style-guide rewrite.
- Component selectors are not uniformly `app-*`.
- Some historical dependencies may still deserve a usage audit.
- The `experimental` page is playground surface and should not be treated as core site infrastructure.

## Good AI Collaboration Tasks

High-leverage, low-drama follow-ups:

- Update README into a real operator guide.
- Audit unused dependencies and remove confirmed dead packages.
- Add a dependency notes document if Dependabot alerts recur.
- Split experimental features behind a clearer boundary.
- Add small tests around pipes/services that are easy to regress.
- Plan Tailwind 4 migration separately.
