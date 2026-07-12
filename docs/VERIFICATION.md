---
Status: CURRENT — CANONICAL VERIFICATION WORKFLOW
Authority: Canonical commands and evidence required to consider GriftOS work complete
Scope: Automated tests, balance evidence, deterministic fixtures, responsive/theme review, and scope auditing
Last verified against commit: 4a013e75c76796ef2e725c58cd10dc78b3b3b080
Update trigger: Scripts, fixture routes, verification tooling, supported targets, or required evidence changes
Supersedes: GriftOS verification commands scattered across task briefs and project chats
---

# GriftOS Verification

## CURRENT commands

Focused GriftOS tests:

```bash
npm run grift:test
```

Engine, presentation, runtime, renderer, and style-ownership boundaries:

```bash
npm run grift:arch
```

Full repository tests:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Lint and production SSR/prerender build:

```bash
npm run verify
```

Balance work additionally requires the applicable commands from `docs/economy-tuning-brief.md`, beginning with:

```bash
npm run game:balance -- --strategy=natural --rug-strategy=prepared --max-days=14
```

`npm run grift:test` runs the engine, presentation, runtime, and renderer dependency boundaries before the focused browser tests. `npm run verify` does not run tests. GriftOS implementation phases normally require `grift:test` and `verify`; use the full test command for phase completion and before commits that alter shared project behavior.

## Deterministic fixture routes

Start the development server with `npm start`, then use:

| State | URL | Proves |
|---|---|---|
| Fresh | `/experimental/grift-os?playtest=1&run=fresh` | Opening manual hierarchy; no premature modes or Context |
| First expansion | `/experimental/grift-os?playtest=1&run=first-expansion` | Expansion state and next-enterprise Horizon |
| Automation ready | `/experimental/grift-os?playtest=1&run=automation-ready` | Contextual automation opportunity |
| Two Hustles | `/experimental/grift-os?playtest=1&run=two-hustles` | Portfolio reveal and useful selected Context |
| Milestone near | `/experimental/grift-os?playtest=1&run=milestone-near` | Milestone progressive disclosure |
| Portfolio mid | `/experimental/grift-os?playtest=1&run=portfolio-mid` | Mixed manual/automated portfolio and Leverage reveal |
| Portfolio scale | `/experimental/grift-os?playtest=1&run=portfolio-scale` | Mature portfolio, wide pinned Context, mode hierarchy |
| Rug Pull ready | `/experimental/grift-os?playtest=1&run=rug-pull-ready&surface=rugPull` | Extraction availability and Founder Take/Rug Pull composition |
| Post-Rug | `/experimental/grift-os?playtest=1&run=post-rug` | Persistent Net Worth applied to a fresh run |
| Endgame | `/experimental/grift-os?playtest=1&run=endgame` | Large values, full catalog, and late-state density |

These routes and fixture behavior are CURRENT development contracts. Architecture work may relocate fixture ownership later but must preserve deterministic access until an approved replacement exists.

## Visual evidence matrix

Required after renderer or style work:

- Desktop dark: fresh, portfolio-mid, portfolio-scale, Rug Pull ready.
- Desktop light: fresh and portfolio-scale.
- Mobile dark: portfolio-mid with selected Context open.
- Mobile light: fresh and a dense portfolio state.
- One intermediate-width functional check: navigation, readable actions, overlay/drawer Context, and no normal-play horizontal scrolling.

Desktop and mobile are authored targets. Intermediate width is a non-breakage check only.

For every visual check also confirm:

- site navbar remains outside the game world;
- site accent inheritance remains legible;
- keyboard focus and Escape behavior work;
- reduced motion preserves state clarity;
- no browser console errors;
- utilities remain subordinate.

No screenshot-testing dependency is currently installed. Capture and compare browser evidence during review rather than adding tooling implicitly.

## Change-specific evidence

| Change | Minimum additional evidence |
|---|---|
| Formula or modifier | Engine tests, full tests, balance simulation, production build |
| Influence tuning | Content/tuning tests and before/after balance report |
| Content only | Focused tests, affected fixtures, light/dark copy fit |
| Presentation/action availability | Focused tests across affected fixtures and semantic-event assertions |
| Renderer/SCSS | Full visual matrix, accessibility interactions, production build |
| Audio | Audio tests, gesture unlock, muted/missing-asset behavior, SSR build |
| Save/persistence | V2 fixtures, v1 migration and rollback mirrors, corrupt-v2 fallback, component reload, explicit migration approval |

## Scope audit before commit

- `git status --short` contains only authorized files.
- No unrelated user changes were overwritten.
- Production files remain untouched for documentation-only phases.
- Save keys/formats and deterministic fixture URLs remain unchanged unless explicitly authorized.
- Every `TARGET` path is labeled as not yet implemented.
- `CURRENT-STATE.md`, `ARCHITECTURE-MAP.md`, `INVARIANTS.md`, and this workflow agree on migration status and authority.
