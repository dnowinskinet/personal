# Website Optimization Plan

## Purpose

Improve the website's runtime efficiency, SSR behavior, loading performance, and structural maintainability without changing the existing layout, player-facing copy, navigation intent, or page content.

Primary scope:

- Home: `src/app/pages/home/`
- About: `src/app/pages/about/`
- Shared shell and configuration that affect Home/About:
  - `src/app/app.module.ts`
  - `src/app/app-routing.module.ts`
  - `src/app/core/services/meta.service.ts`
  - `src/app/layout/footer/footer.ts`
  - `angular.json`
  - `src/environments/`

This is an optimization and cleanup effort, not a visual redesign or full Angular migration.

## Non-negotiable constraints

- Preserve the current Home and About layout.
- Preserve all existing player-facing or personal copy.
- Preserve route URLs and navigation behavior.
- Keep the app's hybrid Angular architecture; do not perform a full standalone migration.
- Keep the GriftOS and other experimental work outside the scope of unrelated refactors.
- Do not rewrite the About content unless required to represent the same content data-for-data.
- Keep SSR and prerendering working.
- Keep light and dark themes working.
- Make one focused phase at a time and verify after each phase.

## Current baseline

The current repository review found:

- `npm test -- --watch=false --browsers=ChromeHeadless`: 112 tests passing.
- `npm run lint`: passing.
- `npm run build`: passing.
- Initial browser build: approximately 736 KB raw / 184 KB estimated transfer.
- Experimental routes are split into lazy chunks, but router preloading may fetch them after startup.
- About is a large static template: approximately 478 lines / 28 KB.
- Home is split into an intro section and an expertise section, but the Home hero is deferred and has a likely platform-injection bug.

## Prioritized work

### Phase 1 — Establish a correct production baseline

Priority: critical

Files:

- `angular.json`
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
- `src/environments/environment.development.ts`

Tasks:

1. Wire `environment.prod.ts` into the production build configuration.
2. Ensure the production environment contains every field used by the application, including `url` and `mainColor`.
3. Confirm the production bundle enables Angular production mode.
4. Confirm development builds continue to use the development environment.

Acceptance criteria:

- `ng build --configuration=production` uses `production: true`.
- Metadata URLs, language-tool URLs, and theme colors remain valid in production.
- No layout or content changes occur.

### Phase 2 — Repair Home SSR and initial rendering

Priority: critical

Files:

- `src/app/pages/home/expertise-area/intro.ts`
- `src/app/pages/home/home.component.ts`
- `src/app/pages/home/home.component.spec.ts`

Tasks:

1. Replace the incorrect `Inject(PlatformCheckService)` property usage with Angular's `inject(PlatformCheckService)` API.
2. Ensure the primary Home copy is present in prerendered HTML rather than only inside an immediate defer block.
3. If deferring the illustration remains useful, defer only the non-critical visual portion and keep the name, bio, and resume CTA SSR-rendered.
4. Remove unused Home/Intro imports, fields, and subscriptions once behavior is covered by tests.

Acceptance criteria:

- Prerendered Home HTML includes the primary name, bio, and resume CTA.
- The illustration still renders in the browser.
- SSR and client hydration produce no console errors.
- Home layout and copy remain unchanged.

### Phase 3 — Simplify router and module configuration

Priority: high

Files:

- `src/app/app.module.ts`
- `src/app/app-routing.module.ts`

Tasks:

1. Choose one router registration path. Prefer the existing `provideRouter` configuration if its features are retained.
2. Remove the redundant competing `RouterModule.forRoot` registration path after verifying all router directives still work.
3. Remove the broad `NgbModule` import if `NgbAccordionModule` is sufficient for the eagerly loaded pages.
4. Audit root-level Font Awesome module registration and icon-library registration for imports that are no longer required by actual templates.

Acceptance criteria:

- Home, About, Experimental, and wildcard routes still work.
- Router preloading, scroll restoration, and view transitions behave as intended.
- Accordion behavior on About remains unchanged.
- The initial bundle does not increase.

### Phase 4 — Prevent unnecessary loading of Experimental features

Priority: high

Files:

- `src/app/app.module.ts`
- `src/app/app-routing.module.ts`

Tasks:

1. Review whether `PreloadAllModules` is appropriate for the experimental routes.
2. Prefer `NoPreloading` or a custom strategy that does not preload experimental games during normal Home/About visits.
3. Verify the lazy chunks remain available when the user explicitly navigates to Experimental.

Acceptance criteria:

- Home/About navigation does not eagerly download experimental game chunks.
- Experimental routes still load successfully on demand.
- First-load transfer size and network requests improve or remain unchanged.

### Phase 5 — Correct route metadata and asset references

Priority: high

Files:

- `src/app/core/services/meta.service.ts`
- `src/app/pages/home/home.component.ts`
- `src/app/pages/about/about.component.ts`
- `src/assets/image/`

Tasks:

1. Replace repeated `Meta.addTags` calls with an update-safe metadata strategy so SPA navigation does not accumulate duplicate tags.
2. Use the correct `property` attribute for Open Graph tags.
3. Correct the default social image path to the asset that actually exists.
4. Standardize page asset URLs on `/assets/...` rather than component-relative paths.
5. Add focused tests for Home-to-About metadata updates.

Acceptance criteria:

- Navigating between Home and About leaves one current value for each route metadata tag.
- Open Graph and Twitter image URLs resolve successfully.
- Prerendered Home and About pages contain the correct title, description, URL, and image metadata.

### Phase 6 — Optimize About image loading and layout stability

Priority: medium

Files:

- `src/app/pages/about/about.component.html`
- `src/app/pages/about/about.component.ts`
- `src/app/pages/about/about.component.scss`

Tasks:

1. Keep the biography image eager because it is near the top of the page.
2. Add `loading="lazy"` and `decoding="async"` to below-fold logos and other non-critical images.
3. Add intrinsic dimensions to images to reduce layout shift while preserving their current aspect ratios.
4. Leave accordion-only degree images lazy through their existing template structure.
5. Remove unused or redundant page-local CSS only after confirming no visual dependency exists.

Acceptance criteria:

- The visual layout is unchanged at desktop and mobile breakpoints.
- Below-fold image requests are deferred until useful.
- No unexpected layout shift is introduced.
- Accordion images still load when opened.

### Phase 7 — Reduce recurring and high-frequency runtime work

Priority: medium

Files:

- `src/app/layout/footer/footer.ts`
- `src/app/pages/home/expertise-area/directive/spotlight.directive.ts`
- `src/app/pages/home/expertise-area/service/spotlight.service.ts`

Tasks:

1. Update the footer clock at minute-level precision instead of running Angular work every second.
2. Scope spotlight pointer handling to the expertise container rather than the entire window.
3. Throttle spotlight updates with `requestAnimationFrame`.
4. Avoid repeated card-array creation and unnecessary layout reads during pointer movement.
5. Preserve the existing spotlight appearance and interaction.

Acceptance criteria:

- The footer continues to show the correct Eastern Time label and current minute.
- Spotlight behavior looks unchanged while pointer movement causes less main-thread work.
- No global mouse listener remains for the expertise cards unless profiling proves it necessary.

### Phase 8 — Improve static page maintainability

Priority: medium / optional

Files:

- `src/app/pages/about/about.component.html`
- `src/app/pages/about/about.component.ts`
- New page-local About data/component files as needed

Tasks:

1. Represent work, education, and activity entries as typed data.
2. Render repeated timeline entries through a focused reusable component or page-local template.
3. Replace repeated `<br>` spacing with semantic section spacing while preserving the current visual spacing.
4. Keep all existing text, links, images, ordering, and accordion behavior identical.
5. Add a small render/content regression test before and after the refactor.

This phase is primarily for maintainability. It should not be presented as a performance project unless bundle or render measurements show a meaningful benefit.

### Phase 9 — Strengthen tests and regression protection

Priority: medium

Files:

- `src/app/pages/home/home.component.spec.ts`
- `src/app/pages/about/about.component.spec.ts`
- New focused specs for metadata, routing, and image behavior as needed

Tasks:

1. Replace broad `NO_ERRORS_SCHEMA` usage where practical with explicit test imports or stubs.
2. Test that Home renders its primary copy and resume CTA.
3. Test that About renders its contact data and key timeline sections.
4. Test route metadata updates during client navigation.
5. Add a production-build smoke check to the completion checklist.

Acceptance criteria:

- Tests would fail if the Home hero disappears behind an SSR/defer mistake.
- Tests would fail if About contact data or key content bindings break.
- Metadata and production environment regressions are covered.

## Suggested Codex execution order

When implementing this plan later, Codex should:

1. Confirm the working tree and preserve unrelated user changes.
2. Read `docs/architecture.md`, `package.json`, and `angular.json`.
3. Implement only one phase at a time.
4. Run focused tests after each phase.
5. Run the full verification set after the final phase:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
npm run lint
npm run build
```

6. Compare build output before and after, especially initial transfer size and lazy chunk behavior.
7. Report any visual, SSR, route, or content differences before proceeding with further refactoring.

## Definition of done

- Production builds run in Angular production mode.
- Home's critical content is present in SSR/prerendered HTML.
- Home and About retain their current layout and content.
- Router configuration has one clear registration path.
- Experimental features remain on-demand for normal visitors.
- Metadata is correct and does not duplicate during navigation.
- About images load progressively without layout shift.
- High-frequency Home and footer work is reduced without visible behavior changes.
- Tests, lint, and production build pass.
- No unrelated GriftOS or personal working-tree changes are modified.
