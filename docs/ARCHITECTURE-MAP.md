---
Status: CURRENT/TARGET — CANONICAL NAVIGATION MAP
Authority: Navigational and ownership guidance; product decisions remain governed by the decision log and dated canonical domain documents
Scope: GriftOS source locations, dependency direction, ownership, UI vocabulary, and migration status
Last verified against commit: 61617f8cbdf298ef561713fc3af0b56f03aeb534
Update trigger: Source ownership, dependency direction, feature paths, renderer boundaries, or migration status changes
Supersedes: Repository-location and ownership guidance scattered across historical task briefs
---

# GriftOS Architecture Map

## CURRENT — existing at HEAD

The route lazy-loads `GriftOsGameComponent` from `src/app/pages/experimental/grift-os-game/`.

```text
grift-os-game/
  content/        Compatibility assembly exports for current consumers
  empires/
    influence/
      mechanics/  CURRENT Influence tuning and mechanical catalogs
      content/    CURRENT Influence player-facing language
  game-engine/    Economy formulas, state, modifiers, prestige, simulation
  formatting/     Number and value formatting
  audio/          Shared policy/director plus the current manifest
  playtest/       Session logging and metrics
  grift-os-game.ts/html
                  Runtime orchestration, persistence, view models, interactions,
                  fixtures, and all mode rendering

src/styles/_grift-os.scss
                  Global owner of current GriftOS visual composition and motion
```

Current dependency problems are known implementation evidence, not approved boundaries:

- engine modules still import compatibility catalogs and tuning assembled from the Influence packs;
- `HustleDefinition` mixes mechanics, content, icons, and audio references;
- the component owns simulation, persistence, presentation, overlays, fixtures, and rendering;
- the global stylesheet uses source-order Phase 1/1.1 overrides as visual architecture.

## TARGET — approved destination, not yet implemented

The following structure is the approved migration destination. The Influence `mechanics/` and `content/` paths now exist under the current feature root; the other proposed paths and boundaries below are not yet implemented:

```text
grift-os/
  host/           Route host and the single runtime-selected empire boundary
  runtime/        Current-run orchestration, v1 persistence adapter, events, offline credit
  engine/         Pure shared formulas and mechanical primitives
  presentation/   Rule-complete view models and semantic action dispatch
  formatting/     Shared formatting
  interaction/    Focus, overlay, Escape, touch, and reduced-motion contracts
  empires/
    influence/
      mechanics/  Influence tuning and mechanical catalogs
      content/    Influence player-facing language
      audio/      Influence event mappings and assets
      renderer/   Influence Angular composition and locally owned styles
  playtest/       Deterministic fixtures and instrumentation
```

Target dependency direction:

```text
Composition root associates mechanics/content/visual/audio packs
  -> host selects one empire renderer
  -> runtime invokes shared engine with mechanics only
  -> presentation combines state + mechanics + content + formatting
  -> renderer consumes view models and dispatches semantic actions
  -> audio director consumes semantic events + audio pack
```

Target prohibitions:

- engine must not depend on Angular, DOM/storage, content, visuals, audio, or renderers;
- renderers must not call economy functions, access saves, own timers, or infer affordability/reveal rules;
- shared presentation must not depend on an empire renderer;
- empire visuals must not style another empire or leak global selectors.

## UI glossary and ownership

| Region | Definition | Current owner | Target owner | Migration status | Shared or empire-specific | Desktop behavior | Mobile behavior |
|---|---|---|---|---|---|---|---|
| Navbar | Nowinski site navigation above the game | Site layout | Site layout | Stable | Shared site shell | Global navigation | Global compact navigation |
| Shell | Boundary of the game below Navbar | Main component/global SCSS | Shared GriftOS host | TARGET not implemented | Shared | Contains active renderer | Contains active renderer |
| Stage | Primary Valuation and identity composition | Main template/global SCSS | Influence Stage | Transitional | Empire-specific | Rich authored composition | Compact authored composition |
| Backdrop | Non-semantic atmospheric layer behind Stage content | Stage atmosphere selectors | Influence Backdrop | Transitional | Empire-specific | May carry depth/motion | Simplified or omitted |
| Chamber | Bounded focal area around Valuation | Not independently owned | Influence Chamber | Deferred extraction | Empire-specific | Anchors major value | Compact focal area |
| Frame | Structural visual boundary around a region | Global SCSS selectors | Owning Influence component | Transitional | Empire-specific | Supports hierarchy | Reduced framing |
| Valuation | Current spendable in-run value presentation | Engine state + component + Stage CSS | Shared facade data; Influence Stage presentation | Transitional | Shared mechanic, empire expression | Dominant value | Preserved dominant value |
| Pulse | Gain/spend and production feedback tied to real events | Component flyouts/global keyframes | Shared semantic feedback; Influence motion | Transitional | Shared event, empire expression | Directional feedback | Reduced non-obscuring feedback |
| Rail | Secondary persistent-owner information beside Stage | Net Worth block in main Stage | Influence Rail | Not independently owned | Empire-specific composition over shared data | Secondary to Valuation | Compact/conditional |
| Modes | Navigation among shared mechanical capabilities | Main template/component | Influence Modes consuming shared availability | Transitional | Shared capabilities, empire expression | In-game navigation | Touch-safe compact navigation |
| Ledger | Ordered Hustle operating field | Main template/global SCSS | Influence Ledger | Transitional | Empire-specific composition | Dominant operating surface | Full-width stack |
| Lane | One Hustle's identity, production, and actions | Main loop/global SCSS | Influence Lane | Transitional | Empire-specific composition over shared VM | Horizontal machine/row | Stacked touch-safe unit |
| Context | Rich selected-Hustle explanation | Main aside/component/global SCSS | Shared interaction contract + Influence Context | Transitional | Shared behavior, empire expression | Pinned when genuinely wide | Bottom sheet |
| Horizon | Next meaningful Hustle establishment | Main template/global SCSS | Influence Horizon | Transitional | Empire-specific content/composition | After current portfolio | Inline after relevant lanes |
| Utilities | Audio and development controls | Main template/component | Shared host utilities; dev tooling isolated | Transitional | Shared/player plus DEV_ONLY | Subordinate | Compact and touch-safe |

Intermediate widths have no dedicated art direction. They must keep the Ledger usable, actions readable, navigation functional, and Context available through an overlay/drawer.

## Change-surface map

| Change | CURRENT owner(s) | TARGET owner — not yet implemented |
|---|---|---|
| Formula | Engine formulas consuming compatibility exports assembled from the Influence mechanics pack | Shared engine formula |
| Influence balance | Influence mechanics pack, assembled through `content/economy-tuning.ts` for current consumers | Influence mechanics/tuning pack (CURRENT ownership; direct engine consumption deferred) |
| Hustle/manual/automation wording | Influence content pack, assembled through current `content/` exports; some component string assembly remains | Influence content pack (CURRENT catalog ownership; presentation facade deferred) |
| Icon or motion | ID unions, definitions, global SCSS | Influence visual pack/component |
| Sound | Definitions, global manifest, director | Influence audio pack |
| Action availability/mode reveal | Main component getters | Shared runtime/presentation facade |
| Stage/Lane/Leverage/Rug Pull layout | Main template and global SCSS | Corresponding Influence renderer component |
| Global Net Worth behavior | Prestige/modifier engine and component persistence | Shared mechanics/meta contract |
| Mobile Context behavior | Component, template, and global breakpoints | Shared interaction contract + Influence Context |

## DEFERRED

- Multiple-run versus sequential-run architecture.
- Empire selection and transition ownership.
- Inactive-empire simulation.
- New save envelope or empire-namespaced persistence.
- Global, per-empire, or combined exit-count semantics.

## HISTORICAL

`docs/HUSTLES-UX-RESET.md` is an implemented historical task contract. It may explain why current behavior exists but is not current architecture authority.
