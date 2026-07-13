---
Status: CURRENT/TARGET — CANONICAL NAVIGATION MAP
Authority: Navigational and ownership guidance; product decisions remain governed by the decision log and dated canonical domain documents
Scope: GriftOS source locations, dependency direction, ownership, UI vocabulary, and migration status
Last verified against commit: 993725d2427b7efcd94d04fa0d84dc61446eb2e2
Update trigger: Source ownership, dependency direction, feature paths, renderer boundaries, or migration status changes
Supersedes: Repository-location and ownership guidance scattered across historical task briefs
---

# GriftOS Architecture Map

## CURRENT — existing at HEAD

The route lazy-loads `GriftOsGameComponent` from `src/app/pages/experimental/grift-os-game/`.

```text
grift-os-game/
  empire-id.ts   Shared compile-time empire ID catalog and runtime validator
  economic-slots/ CURRENT shared ten-position Hustle tuning, milestone mechanics,
                  scoped slot IDs, and empire-mapping validator
  content/        Compatibility assembly and label-enrichment adapters
  empires/
    empire-renderer-registry.ts
                  CURRENT injectable renderer registration; production default is Influence
    influence/
      mechanics/  CURRENT Influence tuning and mechanical catalogs
      content/    CURRENT Influence player-facing language
      renderer/   CURRENT Influence renderer boundary, local root template, and scoped
                  renderer-wide surface/action compatibility styles
        stage/    CURRENT statically composed Stage view/template/style owner with
                  internal Backdrop, Chamber, Frame, and Capital Panel composition
        modes/    CURRENT capability navigation component
        ledger/   CURRENT statically composed Ledger/Lane templates and local visual rules
        context/  CURRENT selected-Hustle Context template and component-local
                  interaction/visual styles
        leverage/ CURRENT Leverage presentation component
        rug-pull/ CURRENT Rug Pull component with an internal Founder Take child
  host/           Renderer-neutral host view, typed semantic request, and registration contracts
  game-engine/    Mechanics-only contracts, formulas, state, modifiers, prestige, simulation
  presentation/   Pure rule-complete view models and typed gameplay actions
  runtime/        V2 single-run persistence, v1 migration/mirroring, simulation policy,
                  semantic event history
  formatting/     Number and value formatting
  audio/          Shared policy/director plus the current manifest
  playtest/       Session logging and metrics
  grift-os-game.ts / grift-os-host.html / grift-os-game.scss
                  Shared host, Angular scheduling, action execution, UI effects,
                  fixtures, and shared utilities
src/styles/_grift-os.scss
                  Shared shell/theme tokens and mobile Context/site-scroll bridge only
```

Current dependency problems are known implementation evidence, not approved boundaries:

- compatibility `HustleDefinition` still mixes content, icons, and audio references, but engine functions consume `GameMechanics` instead;
- Influence's stable Hustle IDs map one-to-one onto the shared economic-slot catalog; the pack validator rejects missing, extra, unknown, or duplicate slot ownership before the mechanics pack is consumed;
- content-bearing compatibility types remain in `game-engine/types.ts` pending later type-ownership work;
- the host owns platform scheduling, action execution, shared UI effects, fixtures, and utilities; the Influence renderer owns game-world rendering and Context focus behavior through a semantic request boundary;
- the host imports no Influence renderer type. The composition registry adapts the neutral host view with Influence content and supplies the production renderer registration;
- the replacement renderer exists only in the component test and proves the boundary; it is not a second production empire or a runtime switching feature;
- the Influence renderer template is local to its renderer and statically composes every current visual region;
- the renderer stylesheet contains no Stage, Context, Modes, Leverage, or Rug Pull selectors. Ledger/Lane components own their final Circulating Institution overrides while the renderer sheet retains shared surface/action compatibility rules.

## TARGET — approved destination, not yet implemented

The following structure is the approved migration destination. Feature-local mechanics, content, presentation, runtime, host contract, registry, the single Influence renderer boundary, and renderer-level style containment now exist. The proposed top-level relocation, interaction layer, visual/audio packs, and renderer-internal component ownership below are not yet implemented:

```text
grift-os/
  host/           Route host and the single runtime-selected empire boundary; CURRENT locally
  runtime/        Current-run policy, v2 persistence plus v1 compatibility, events,
                  offline credit; CURRENT locally
  engine/         Pure shared formulas and mechanical primitives
  presentation/   Rule-complete view models and semantic actions; CURRENT locally, final placement deferred
  formatting/     Shared formatting
  interaction/    Focus, overlay, Escape, touch, and reduced-motion contracts
  empires/
    influence/
      mechanics/  Influence tuning and mechanical catalogs
      content/    Influence player-facing language
      audio/      Influence event mappings and assets
      renderer/   Boundary and modular static Angular composition CURRENT; visual/audio
                  pack extraction remains TARGET
  playtest/       Deterministic fixtures and instrumentation
```

Target dependency direction:

```text
Composition root associates mechanics/content/visual/audio packs
  -> host receives one renderer registration and supplies a neutral view + dispatcher
  -> runtime invokes shared engine with mechanics only
  -> presentation combines state + mechanics + content + formatting
  -> renderer consumes view models and dispatches semantic actions
  -> audio director consumes semantic events + audio pack
```

A second production empire will map its local Hustle identities onto the CURRENT shared economic-slot catalog. Its names, nouns, verbs, descriptions, icons, audio, motion, and renderer remain empire-owned and are not implied by the shared tuning seam.

Target prohibitions:

- engine must not depend on Angular, DOM/storage, content, visuals, audio, or renderers;
- renderers must not call economy functions, access saves, own timers, or infer affordability/reveal rules;
- the shared host must not import a concrete empire renderer;
- shared presentation must not depend on an empire renderer;
- empire visuals must not style another empire or leak global selectors.

## UI glossary and ownership

| Region | Definition | Current owner | Target owner | Migration status | Shared or empire-specific | Desktop behavior | Mobile behavior |
|---|---|---|---|---|---|---|---|
| Navbar | Nowinski site navigation above the game | Site layout | Site layout | Stable | Shared site shell | Global navigation | Global compact navigation |
| Shell | Boundary of the game below Navbar | Shared host plus global shell/theme bridge | Shared GriftOS host | CURRENT; replacement proven | Shared | Contains one registered renderer | Contains one registered renderer |
| Stage | Primary empire identity and Valuation composition | `InfluenceStageComponent` with a presentation-only view and local styles | Empire-owned Stage consuming the shared presentation contract | CURRENT; revised K.2 composition | Empire-specific | Centered Chamber plus right Capital Panel | Centered Chamber then stacked Capital Panel |
| Backdrop | Replaceable non-semantic artwork behind Stage content | Four Stage-owned CSS image hooks with fallbacks; temporary dark-desktop art is active | Empire visual pack feeding Stage-local hooks | Hooks CURRENT; final art absent | Empire-specific | Authored 32:9 desktop art | Authored 4:3 mobile art, not an automatic crop |
| Chamber | Bounded focal area around Valuation | Internal Stage composition; no independent behavior | Stage-internal unless complexity warrants extraction | CURRENT inside Stage | Empire-specific | Anchors the dominant value | Compact focal area |
| Frame | Structural visual boundary around a region | Stage Frame is component-local; other frames remain renderer-level | Owning Influence component | Stage CURRENT; other regions pending | Empire-specific | Authored valuation boundary | Reduced but preserved framing |
| Valuation | Current spendable in-run value presentation | Shared facade data consumed by `InfluenceStageComponent` | Shared facade data; Influence Stage presentation | CURRENT | Shared mechanic, empire expression | Dominant value | Preserved dominant value |
| Pulse | Gain/spend and production feedback tied to real events | Host feedback state + Stage/Lane-local Influence motion | Shared semantic feedback; Influence motion | Component ownership CURRENT | Shared event, empire expression | Directional feedback | Reduced non-obscuring feedback |
| Rail | Long connective spine or track language used in operating flows | `InfluenceLedgerComponent` and `InfluenceLaneComponent` styles | Influence Ledger/Lane | CURRENT | Empire-specific composition | Connects operating lanes | Simplified in stacked lanes |
| Capital Panel | Stable owner/Net Worth presentation using only real facade data | Persistent panel internal to `InfluenceStageComponent` | Stage-internal unless complexity warrants extraction | CURRENT inside Stage | Shared meta data, empire-specific expression | Right-side panel, including real `$0` | Compact panel stacked beneath Chamber |
| Modes | Navigation among shared mechanical capabilities | `InfluenceModesComponent` consuming shared availability | Influence Modes | CURRENT | Shared capabilities, empire expression | In-game navigation | Touch-safe compact navigation |
| Ledger | Ordered Hustle operating field | `InfluenceLedgerComponent` with local template/styles | Influence Ledger | CURRENT | Empire-specific composition | Dominant operating surface | Full-width stack |
| Lane | One Hustle's identity, production, and actions | `InfluenceLaneComponent` consuming one rule-complete row with local visual/progress rules | Influence Lane | CURRENT | Empire-specific composition over shared VM | Horizontal machine/row | Stacked touch-safe unit |
| Context | Rich selected-Hustle explanation | `InfluenceContextComponent` consuming one rule-complete row with component-local Context styles | Shared interaction contract + Influence Context | K.4 component and style ownership CURRENT | Shared behavior, empire expression | Pinned when genuinely wide | Bottom sheet |
| Horizon | Next meaningful Hustle establishment | `InfluenceLedgerComponent` template/styles | Influence Horizon | CURRENT inside Ledger | Empire-specific content/composition | After current portfolio | Inline after relevant lanes |
| Utilities | Audio and development controls | Shared host template/component | Shared host utilities; dev tooling isolated | Host ownership CURRENT | Shared/player plus DEV_ONLY | Subordinate | Compact and touch-safe |

Intermediate widths have no dedicated art direction. They must keep the Ledger usable, actions readable, navigation functional, and Context available through an overlay/drawer.

## Change-surface map

| Change | CURRENT owner(s) | TARGET owner — not yet implemented |
|---|---|---|
| Formula | Shared engine formula receiving an explicit mechanics-only catalog | Shared engine formula (CURRENT dependency direction) |
| Hustle-ladder balance | `economic-slots/economic-slot-catalog.ts`; Influence maps stable IDs in its mechanics pack and `content/economy-tuning.ts` remains a compatibility adapter | Shared economic-slot tuning with an independently validated mapping for every production empire |
| Hustle/manual/automation wording | Influence content pack, assembled through current `content/` exports; presentation assembles current action labels | Influence content pack plus shared presentation contract |
| Icon or motion | Influence component styles and current definition metadata | Influence visual pack/component |
| Sound | Definitions, global manifest, director | Influence audio pack |
| Action availability/mode reveal | Pure presentation facade consumed by the main component | Shared runtime/presentation facade (CURRENT ownership) |
| Stage layout | `InfluenceStageComponent` and its local stylesheet | Influence Stage (CURRENT) |
| Lane/Leverage/Rug Pull layout | Corresponding Influence renderer component | Corresponding Influence renderer component (CURRENT) |
| Global Net Worth behavior | Prestige/modifier engine and v2 runtime meta | Shared mechanics/meta contract (CURRENT persistence ownership) |
| Mobile Context behavior | Shared host interaction/focus policy, `InfluenceContextComponent` breakpoints, and global scroll bridge | Shared interaction contract + Influence Context |

## DEFERRED

- Exact prestige-complete transition UI, final shared terminology, and empire unlock requirements.
- Any later economy change that makes prestige easier for empire switching.

The CURRENT v2 envelope is not `runsByEmpire`: it stores one active `empireId` and run, global Net Worth, explicit unlocked IDs, and per-empire exit counts. Completed runs will be replaced after a prestige-gated, player-chosen transition; inactive empires have no saved run and earn no offline progress.

## HISTORICAL

`docs/HUSTLES-UX-RESET.md` is an implemented historical task contract. It may explain why current behavior exists but is not current architecture authority.
