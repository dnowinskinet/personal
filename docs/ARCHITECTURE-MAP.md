---
Status: CURRENT/TARGET — CANONICAL NAVIGATION MAP
Authority: Navigational and ownership guidance; product decisions remain governed by the decision log and dated canonical domain documents
Scope: GriftOS source locations, dependency direction, ownership, UI vocabulary, and migration status
Last verified against commit: 9a6eb593b742cd7bbd34846e6dc3e0db61e9fa8f
Update trigger: Source ownership, dependency direction, feature paths, renderer boundaries, or migration status changes
Supersedes: Repository-location and ownership guidance scattered across historical task briefs
---

# GriftOS Architecture Map

## CURRENT — existing at HEAD

The route lazy-loads `GriftOsGameComponent` from `src/app/pages/experimental/grift-os-game/`.

```text
grift-os-game/
  content/        Compatibility assembly and label-enrichment adapters
  empires/
    empire-renderer-registry.ts
                  CURRENT single runtime-selected renderer registry
    influence/
      mechanics/  CURRENT Influence tuning and mechanical catalogs
      content/    CURRENT Influence player-facing language
      renderer/   CURRENT Influence renderer boundary and explicitly scoped visual owner;
                  internal Angular composition pending
  host/           Typed semantic renderer request contract
  game-engine/    Mechanics-only contracts, formulas, state, modifiers, prestige, simulation
  presentation/   Pure rule-complete view models and typed gameplay actions
  runtime/        V1 persistence/reconciliation, simulation policy, semantic event history
  formatting/     Number and value formatting
  audio/          Shared policy/director plus the current manifest
  playtest/       Session logging and metrics
  grift-os-game.ts / grift-os-host.html / grift-os-game.scss
                  Shared host, Angular scheduling, action execution, UI effects,
                  fixtures, and shared utilities
  grift-os-game.html
                  Transitional Influence renderer template pending region-module extraction

src/styles/_grift-os.scss
                  Shared shell/theme tokens and mobile Context/site-scroll bridge only
```

Current dependency problems are known implementation evidence, not approved boundaries:

- compatibility `HustleDefinition` still mixes content, icons, and audio references, but engine functions consume `GameMechanics` instead;
- content-bearing compatibility types remain in `game-engine/types.ts` pending later type-ownership work;
- the host owns platform scheduling, action execution, shared UI effects, fixtures, and utilities; the Influence renderer owns game-world rendering and Context focus behavior through a semantic request boundary;
- the Influence renderer template remains at the feature root and is not yet decomposed into Stage/Lane/Context modules;
- renderer rules are co-located and root-scoped but remain one large transitional stylesheet compiled through the Sass entrypoint until region components own smaller sheets.

## TARGET — approved destination, not yet implemented

The following structure is the approved migration destination. Feature-local mechanics, content, presentation, runtime, host contract, registry, the single Influence renderer boundary, and renderer-level style containment now exist. The proposed top-level relocation, interaction layer, visual/audio packs, and renderer-internal component ownership below are not yet implemented:

```text
grift-os/
  host/           Route host and the single runtime-selected empire boundary; CURRENT locally
  runtime/        Current-run policy, v1 persistence adapter, events, offline credit; CURRENT locally
  engine/         Pure shared formulas and mechanical primitives
  presentation/   Rule-complete view models and semantic actions; CURRENT locally, final placement deferred
  formatting/     Shared formatting
  interaction/    Focus, overlay, Escape, touch, and reduced-motion contracts
  empires/
    influence/
      mechanics/  Influence tuning and mechanical catalogs
      content/    Influence player-facing language
      audio/      Influence event mappings and assets
      renderer/   Boundary and root-scoped styles CURRENT; modular Angular composition pending
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
| Shell | Boundary of the game below Navbar | Shared host plus global shell/theme bridge | Shared GriftOS host | CURRENT | Shared | Contains active renderer | Contains active renderer |
| Stage | Primary Valuation and identity composition | Influence renderer template/root-scoped renderer SCSS | Influence Stage | Styles contained; module pending | Empire-specific | Rich authored composition | Compact authored composition |
| Backdrop | Non-semantic atmospheric layer behind Stage content | Stage atmosphere selectors | Influence Backdrop | Transitional | Empire-specific | May carry depth/motion | Simplified or omitted |
| Chamber | Bounded focal area around Valuation | Not independently owned | Influence Chamber | Deferred extraction | Empire-specific | Anchors major value | Compact focal area |
| Frame | Structural visual boundary around a region | Root-scoped Influence renderer SCSS | Owning Influence component | Styles contained; module pending | Empire-specific | Supports hierarchy | Reduced framing |
| Valuation | Current spendable in-run value presentation | Presentation facade + Influence renderer + Stage CSS | Shared facade data; Influence Stage presentation | Transitional | Shared mechanic, empire expression | Dominant value | Preserved dominant value |
| Pulse | Gain/spend and production feedback tied to real events | Host feedback state + root-scoped Influence motion | Shared semantic feedback; Influence motion | Renderer ownership CURRENT | Shared event, empire expression | Directional feedback | Reduced non-obscuring feedback |
| Rail | Secondary persistent-owner information beside Stage | Net Worth block in Influence renderer Stage | Influence Rail | Not independently owned | Empire-specific composition over shared data | Secondary to Valuation | Compact/conditional |
| Modes | Navigation among shared mechanical capabilities | Influence renderer template | Influence Modes consuming shared availability | Boundary CURRENT; module pending | Shared capabilities, empire expression | In-game navigation | Touch-safe compact navigation |
| Ledger | Ordered Hustle operating field | Influence renderer template/root-scoped renderer SCSS | Influence Ledger | Styles contained; module pending | Empire-specific composition | Dominant operating surface | Full-width stack |
| Lane | One Hustle's identity, production, and actions | Influence renderer loop/root-scoped renderer SCSS | Influence Lane | Styles contained; module pending | Empire-specific composition over shared VM | Horizontal machine/row | Stacked touch-safe unit |
| Context | Rich selected-Hustle explanation | Influence renderer/component/root-scoped renderer SCSS | Shared interaction contract + Influence Context | Styles contained; module pending | Shared behavior, empire expression | Pinned when genuinely wide | Bottom sheet |
| Horizon | Next meaningful Hustle establishment | Influence renderer template/root-scoped renderer SCSS | Influence Horizon | Styles contained; module pending | Empire-specific content/composition | After current portfolio | Inline after relevant lanes |
| Utilities | Audio and development controls | Shared host template/component | Shared host utilities; dev tooling isolated | Host ownership CURRENT | Shared/player plus DEV_ONLY | Subordinate | Compact and touch-safe |

Intermediate widths have no dedicated art direction. They must keep the Ledger usable, actions readable, navigation functional, and Context available through an overlay/drawer.

## Change-surface map

| Change | CURRENT owner(s) | TARGET owner — not yet implemented |
|---|---|---|
| Formula | Shared engine formula receiving an explicit mechanics-only catalog | Shared engine formula (CURRENT dependency direction) |
| Influence balance | Influence mechanics pack, assembled through `content/economy-tuning.ts` for current consumers | Influence mechanics/tuning pack (CURRENT ownership; direct engine consumption deferred) |
| Hustle/manual/automation wording | Influence content pack, assembled through current `content/` exports; presentation assembles current action labels | Influence content pack plus shared presentation contract |
| Icon or motion | ID unions, definitions, root-scoped Influence renderer SCSS | Influence visual pack/component |
| Sound | Definitions, global manifest, director | Influence audio pack |
| Action availability/mode reveal | Pure presentation facade consumed by the main component | Shared runtime/presentation facade (CURRENT ownership) |
| Stage/Lane/Leverage/Rug Pull layout | Influence renderer template and root-scoped renderer SCSS | Corresponding Influence renderer component |
| Global Net Worth behavior | Prestige/modifier engine and v1 runtime persistence | Shared mechanics/meta contract |
| Mobile Context behavior | Component, template, and global breakpoints | Shared interaction contract + Influence Context |

## DEFERRED

- Multiple-run versus sequential-run architecture.
- Empire selection and transition ownership.
- Inactive-empire simulation.
- New save envelope or empire-namespaced persistence.
- Global, per-empire, or combined exit-count semantics.

## HISTORICAL

`docs/HUSTLES-UX-RESET.md` is an implemented historical task contract. It may explain why current behavior exists but is not current architecture authority.
