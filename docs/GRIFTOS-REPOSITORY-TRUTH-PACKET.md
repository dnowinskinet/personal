# GriftOS Repository Truth Packet

Audit date: 2026-07-17  
Evidence baseline: final working tree at audit close; this packet excluded from the GriftOS tree comparison  
Repository root: `C:\Users\dnowi\Documents\Github\personal`

This packet treats executable code, production wiring, tests, and generated simulator output as evidence of current behavior. Documentation is audited against that evidence; historical prose is not used to override the repository. Test success establishes executable consistency, not whether the game is enjoyable or correctly tuned as a product.

HEAD advanced during the audit from `32f5855` to `dc0d54d` as the local performance work was committed. The repository was allowed to settle, identity was refreshed, and every requested architecture/test/verify command plus the canonical balance reports was rerun against the source content now at final HEAD. Interim status and test values are not used below.

## 1. Repository identity

| Item | Audited value |
|---|---|
| Current branch | `main`, tracking `origin/main`; local branch is one commit ahead |
| HEAD | `dc0d54d55a860fa26a0d9343adee0e0faeb2688e` — `perf(grift-os): reuse formatters and add playtest diagnostics` |
| GriftOS working tree differs from HEAD | No. At audit close there are no modified or untracked files under `src/app/pages/experimental/grift-os-game/`. |
| Node | `v22.20.0` |
| Package manager | npm `10.9.3`; `package.json` pins `packageManager: npm@10.9.3` and declares Node `22.x` |
| Angular | `@angular/core` 21.2.18; Angular CLI 21.2.19 |
| TypeScript | 5.9.3 |

The only uncommitted file at audit close is this requested packet: `docs/GRIFTOS-REPOSITORY-TRUTH-PACKET.md`. It is not production code and is intentionally excluded from the GriftOS source-tree comparison.

The latest HEAD commit contains the current performance work across 11 files (647 insertions, 41 deletions): cached `Intl.NumberFormat` instances, query-gated performance diagnostics and UI, presentation/persistence timing hooks, and their focused tests. These are committed current behavior, not working-tree residue. The branch is local-only at audit close (`main` is ahead of `origin/main` by one commit).

## 2. Live route and composition path

The production route resolves as follows:

```text
src/app/app-routing.module.ts
  APP_ROUTES: path `experimental`
  -> ExperimentalComponent
  -> child path `grift-os`
  -> lazy load GriftOsGameComponent

src/app/pages/experimental/experimental.component.html
  <router-outlet>
  -> GriftOsGameComponent

src/app/pages/experimental/grift-os-game/grift-os-game.ts
  GriftOsGameComponent
  -> inject(ACTIVE_EMPIRE_RENDERER)
  -> activeEmpireRenderer / activeEmpireRendererInputs

src/app/pages/experimental/grift-os-game/grift-os-host.html
  *ngComponentOutlet="activeEmpireRenderer; inputs: activeEmpireRendererInputs"
  -> InfluenceEmpireRendererComponent
```

Important route and host symbols:

- `APP_ROUTES` in `src/app/app-routing.module.ts` defines `experimental/grift-os` and lazy-loads `GriftOsGameComponent`.
- `ExperimentalComponent` is the parent route component; `src/app/pages/experimental/experimental.component.html` supplies the child `<router-outlet>`.
- `GriftOsGameComponent` in `src/app/pages/experimental/grift-os-game/grift-os-game.ts` is the route host. It uses `ChangeDetectionStrategy.OnPush` and `NgComponentOutlet`.
- `ACTIVE_EMPIRE_RENDERER`, `EMPIRE_RENDERERS`, and `empireRendererFor` live in `src/app/pages/experimental/grift-os-game/empires/empire-renderer-registry.ts`. The production injection-token factory returns `empireRendererFor(DEFAULT_EMPIRE_ID)`.
- `EMPIRE_IDS` and `DEFAULT_EMPIRE_ID` in `src/app/pages/experimental/grift-os-game/empire-id.ts` contain only `influence`. The active empire is therefore Influence.
- The Influence registration mounts `InfluenceEmpireRendererComponent` from `src/app/pages/experimental/grift-os-game/empires/influence/renderer/influence-empire-renderer.ts` and maps the neutral host view plus semantic dispatcher into renderer inputs.

The active renderer is statically composed; these are not dynamically selected per mode:

| Surface | Active component and source |
|---|---|
| Stage | `InfluenceStageComponent` — `empires/influence/renderer/stage/influence-stage.component.ts` |
| Mode navigation | `InfluenceModesComponent` — `empires/influence/renderer/modes/influence-modes.component.ts` |
| Ledger | `InfluenceLedgerComponent` — `empires/influence/renderer/ledger/influence-ledger.component.ts` |
| Lane | `InfluenceLaneComponent` — `empires/influence/renderer/ledger/influence-lane.component.ts`; instantiated by the Ledger |
| Selected Context | `InfluenceContextComponent` — `empires/influence/renderer/context/influence-context.component.ts` |
| Leverage | `InfluenceLeverageComponent` — `empires/influence/renderer/leverage/influence-leverage.component.ts` |
| Rug Pull | `InfluenceRugPullComponent` — `empires/influence/renderer/rug-pull/influence-rug-pull.component.ts` |
| Extraction / Your Take | `InfluenceExtractionComponent` — `empires/influence/renderer/rug-pull/extraction/influence-extraction.component.ts`; instantiated by the Rug Pull component |

`src/app/pages/experimental/grift-os-game/empires/influence/renderer/influence-empire-renderer.html` mounts Stage first, then the progressively available mode navigation and the Ledger/Context, Leverage, or Rug Pull surface. Shared support controls, audio controls, offline notice, flyouts, playtest tools, and the performance summary remain outside that renderer in `grift-os-host.html`.

## 3. Runtime mechanics path

### Supplied engine catalog

`GriftOsGameComponent.mechanics` is `INFLUENCE_ENGINE_MECHANICS`, imported from `src/app/pages/experimental/grift-os-game/empires/influence/mechanics/influence-mechanics.ts`. That value is the mechanics catalog supplied to `GriftRunRuntime`, `GriftPersistence`, engine actions, presentation derivation, and Rug Pull/extraction calculations.

`HUSTLE_DEFINITIONS` from `content/hustle-definitions.ts` is also present on the component, but it is the content-bearing compatibility/presentation assembly. It is not the authoritative production mechanics catalog passed to the runtime. It remains live because presentation and some compatibility adapters still require names, descriptions, icons, viewport/audio metadata, and legacy combined definition shapes.

The actual assembly path is:

```text
economic-slots/economic-slot-catalog.ts
  HUSTLE_ECONOMIC_SLOT_IDS + HUSTLE_ECONOMIC_SLOTS
    -> empires/influence/mechanics/influence-mechanics.ts
       INFLUENCE_HUSTLE_ECONOMIC_SLOT_MAPPING
       validateEconomicSlotMapping(...)
       INFLUENCE_MECHANICS_PACK
       INFLUENCE_ENGINE_MECHANICS
         -> GriftOsGameComponent.mechanics
         -> GriftRunRuntime / engine functions
```

### Twelve-slot authority and Influence mapping

`HUSTLE_ECONOMIC_SLOT_IDS` and `HUSTLE_ECONOMIC_SLOTS` in `economic-slots/economic-slot-catalog.ts` are the twelve-position economic authority. `validateEconomicSlotMapping` rejects missing, extra, unknown, or duplicated slot ownership. Influence runs that validator when its mechanics module is assembled.

| Influence Hustle ID | Economic slot |
|---|---|
| `online-rage-farm` | `hustle-01` |
| `paid-friend-club` | `hustle-02` |
| `autograph-factory` | `hustle-03` |
| `paid-shoutout-studio` | `hustle-04` |
| `outrage-podcast` | `hustle-05` |
| `get-rich-books` | `hustle-06` |
| `paid-endorsement-racket` | `hustle-07` |
| `vip-experience-tour` | `hustle-08` |
| `success-university` | `hustle-09` |
| `mlm-ambassador-program` | `hustle-10` |
| `debt-club` | `hustle-11` |
| `subscriber-towns` | `hustle-12` |

### Mechanics entering the engine

`GameMechanics` in `game-engine/mechanics.ts` is a read-only Hustle-mechanics array augmented with `leverage`, `campaignStrata`, `prestige`, and `extraction` catalogs.

| Concern | Entry point into `INFLUENCE_ENGINE_MECHANICS` | Principal engine consumers |
|---|---|---|
| Hustle costs, payout, cadence, growth, automation, unlocks, initial scale | Shared `HUSTLE_ECONOMIC_SLOTS`, projected through Influence's ID-to-slot mapping | `game-engine/economy.ts`, `modifiers.ts`, `balance-sim.ts` |
| Milestones | Each economic slot's milestone catalog, projected onto the corresponding Influence Hustle | `economy.ts`, `modifiers.ts`, presentation assembly |
| Leverage | Five authored Influence deal definitions in `influence-mechanics.ts` | `game-engine/leverage.ts`, `modifiers.ts`, presentation, explicit reinvestment simulation |
| Campaign strata | `campaignStrata` in `influence-mechanics.ts` | `game-engine/progression.ts`, `rug-pull.ts`, presentation |
| Prestige | `prestige` in `influence-mechanics.ts` | Rug Pull gain, Wealth Advantage, balance target/tooling, fixtures |
| Neutral extraction preparation | `extraction` in `influence-mechanics.ts` | `game-engine/extraction.ts`, `economy.ts`, `rug-pull.ts`; presented by Influence as `Your Take` |

### Active, compatibility, and test/development code

- Active production mechanics are the shared economic-slot catalog, the Influence mechanics pack, `INFLUENCE_ENGINE_MECHANICS`, and the pure `game-engine` functions that receive that catalog explicitly.
- `content/hustle-definitions.ts`, `content/economy-tuning.ts`, `content/leverage-definitions.ts`, `content/extraction.ts`, and `content/rug-pull-preview.ts` are compatibility or enrichment adapters. Several remain production-consumed by the current host/presentation bridge, but they do not supersede the mechanics pack.
- `content/generator-definitions.ts`, the `Generator*` type aliases in `game-engine/types.ts`, and generator-named function aliases at the end of `game-engine/economy.ts` are compatibility exports with no current production consumers found.
- `game-engine/balance-sim.ts` and `scripts/grift-os-balance-report.mjs` are active development/balance tooling, not route code.
- `*.spec.ts` files, legacy ten-Hustle fixtures such as `troll-network`, and `playtest/performance-diagnostics.spec.ts` are test-only. The diagnostics spec is committed and included by the focused test glob.

## 4. State and persistence

### Active keys and schemas

Gameplay persistence is implemented by `GriftPersistence` in `runtime/run-persistence.ts`.

| Key | Current role and schema |
|---|---|
| `grift-os-meta-v3` | Primary global meta: `version: 3`, current `netWorth`, `peakNetWorth`, explicit `unlockedEmpireIds`, and `exitCountsByEmpire`. |
| `grift-os-run-v3` | Primary one-run envelope: `version: 3`, `savedAt`, one `empireId`, complete `GriftOsGameState`, and `selectedHustleId`. |
| `grift-os-audio-settings-v1` | Production audio settings: mute state, master/music/SFX volumes, and the retained `adaptiveMusic` compatibility setting. Owned by `AudioDirectorService`. |
| `grift-os-playtest-session-v3` | Query-gated local playtest session and event/metric state. It is not ordinary run progression. Owned by `playtest/playtest-session.ts`. |

Legacy read keys are `grift-os-meta-v2`, `grift-os-run-v2`, `grift-os-meta-v1`, and `grift-os-run-v1`. They are not deleted or overwritten during migration.

`GriftOsGameState` in `game-engine/types.ts` contains current and peak Valuation, current and peak Net Worth, Rug Pull count/state, extraction-preparation state, run-scoped Leverage purchases, and a complete Hustle-state record.

### Current versus peak Net Worth

- `netWorth` is the current spendable persistent balance. Influence Leverage purchases subtract from it, Wealth Advantage uses it, and `campaignComplete` compares the current value with the campaign target.
- `peakNetWorth` is a nondecreasing high-water mark. It governs campaign strata, unlock progression, and Rug Pull targets so spending current Net Worth does not regress those gates.
- Persistence reconciles the high-water mark with the maximum of saved/meta/current values, and saving meta never lowers it.
- Rug Pull adds the extracted gain to current Net Worth and preserves or raises peak Net Worth.

### One-active-empire envelope

The compile-time empire catalog contains only `influence`. V3 stores one active run with one `empireId`; it does not contain `runsByEmpire` or parallel per-empire run state. Meta is future-facing enough to store explicit unlocked IDs and per-empire exit counts, but both currently normalize to the sole Influence ID. The renderer registry likewise has one production registration.

There is no production empire picker, `switchEmpire` operation, or state transition that changes the active empire. Empire switching/replacement is not implemented.

### Migration path

1. Meta loading prefers valid v3. If unavailable or invalid, it tries v2, then v1.
2. V2 meta becomes v3 current/peak wealth, normalized unlocked IDs, and normalized per-empire exit counts.
3. V1 meta seeds both current and peak Net Worth from its one wealth value and maps its global Rug Pull count to Influence's exit count.
4. Run loading prefers a valid v3 envelope whose `empireId` matches the active empire. State values, Hustle records, and selection are reconciled against the current twelve-ID mechanics; invalid selection falls back to the first Hustle.
5. If no usable v3 run exists, a v2 run is tried before v1. The legacy envelope can provide migration timing, but its incompatible ten-Hustle state is intentionally discarded. A fresh twelve-Hustle state is created while migrated persistent wealth/history is retained.
6. The resulting state is written to the v3 keys. V2/v1 source records remain untouched for rollback safety.
7. Corrupt or unavailable storage fails to fresh/default state without making gameplay depend on storage availability.

The executable migration fixture uses the old ID `troll-network` to prove that incompatible v2 run contents are not imported; the old record remains byte-for-byte present.

### Rug Pull reset and preservation

On a successful `commitRugPull`:

- current and peak run Valuation reset to zero;
- extraction preparation resets;
- all run-scoped Leverage purchases reset;
- Hustle active/automation/cycle progress and reached milestones reset;
- each Hustle's scale resets to its mechanics-defined `initialScaleCount`—`online-rage-farm` returns to 1, and the other eleven return to 0;
- the run's Rug Pull state returns to `unavailable` and Rug Pull count increments;
- current Net Worth is preserved plus the extracted gain;
- peak Net Worth is preserved or increased;
- v3 meta preserves unlocked IDs and increments Influence's per-empire exit count;
- separately persisted audio settings and playtest history are not reset.

The host also returns the transient UI to Hustles, selects the first Hustle, closes Context, clears transient feedback/flyouts, shows the resolution, and forces persistence. A cancelled confirmation does none of the above.

## 5. Simulation and offline behavior

### Production foreground path

`GriftOsGameComponent` creates `GriftRunRuntime` from `runtime/run-runtime.ts`. A 50 ms interval runs outside Angular; foreground elapsed time is calculated by `runtime/simulation-clock.ts`, clamped to at most 5,000 ms per tick, and passed to `advanceGame`. UI publication/change detection is separately throttled to approximately 100 ms. Hidden-document ticks are skipped and the clock baseline is reset; hiding the document forces a save.

### Production offline path

On a restored run, the component calculates elapsed wall time from `savedAt` and calls `GriftRunRuntime.creditOffline`.

- Minimum delay: 30,000 ms.
- Maximum credited interval: eight hours.
- Eligible Hustles: any of the twelve whose current state has `isAutomated: true`.
- Ineligible progress: manual/nonautomated Hustles are forced inactive with zero cycle progress in the offline simulation state.
- Calculation: the same `advanceGame` mechanics path is used, then the Valuation delta is surfaced as the pending offline payout.
- Extraction nuance: because the full engine advances, active extraction preparation can also advance during an offline interval that produces automated payout. If no positive payout results, the computed offline state is not adopted.

Offline credit is production behavior on the ordinary route; it is not limited to `?playtest=1`.

### Balance simulator surface

`scripts/grift-os-balance-report.mjs` bundles the current Influence mechanics and `game-engine/balance-sim.ts` into the active report tool.

Supported purchase strategies:

`natural`, `automation-rush`, `expansion-first`, `next-hustle-rush`, `milestone-rush`, `rough-roi`, and `leverage-reinvestment`.

Supported return profiles:

| Profile | Modeled cadence |
|---|---|
| `active` | Continuous foreground play |
| `one-hour` | One-hour return interval, six-minute sessions |
| `four-hour` | Four-hour return interval, eight-minute sessions |
| `eight-hour` | Eight-hour return interval, ten-minute sessions |
| `morning-evening` | Twelve hours between sessions, but only the eight-hour cap credited, with ten-minute sessions |

Rug Pull preparation strategies are `immediate`, `prepared`, and `deep`.

### Canonical natural/prepared result

Command:

```text
npm run game:balance -- --strategy=natural --rug-strategy=prepared --max-days=14
```

Result: pass/exit 0. Ordinary `natural` bought no Leverage in any reported profile.

| Profile | Target reached | Elapsed | Windows | Rugs | Final Net Worth | Subscriber Towns acquired / automated |
|---|---:|---:|---:|---:|---:|---:|
| one-hour | No | 14.03 d | 306 | 4 | $54,112,475,752 | 222.20 h / 268.50 h |
| four-hour | Yes | 11.37 d | 66 | 5 | $2,028,775,655,025 | 206.67 h / 243.87 h |
| eight-hour | Yes | 5.78 d | 17 | 4 | $2,069,898,219,783 | 89.83 h / 114.33 h |
| morning-evening | Yes | 8.62 d | 17 | 4 | $2,069,898,219,783 | 133.83 h / 170.33 h |

The one-hour run slightly exceeds the nominal horizon because the simulator completes a modeled session/window before evaluating the stop boundary.

### Explicit Leverage-reinvestment comparison

Command:

```text
npm run game:balance -- --strategy=leverage-reinvestment --rug-strategy=prepared --max-days=14
```

Result: pass/exit 0. All five authored Leverage deals were purchased.

| Profile | Target reached | Elapsed | Final Net Worth |
|---|---:|---:|---:|
| one-hour | Yes | 1.70 d | $1,738,983,560,636 |
| four-hour | Yes | 3.10 d | $4,966,803,730,006 |
| eight-hour | Yes | 4.42 d | $8,601,741,832,137 |
| morning-evening | Yes | 6.59 d | $8,601,741,832,137 |

For the morning/evening run, Subscriber Towns was acquired and automated at 121.67 h. The five deals were bought at approximately 48.68 h, 60.83 h, 60.84 h, 109.50 h, and 146.00 h respectively.

Two additional applicable report checks also passed:

- natural/prepared with `--sensitivity`, producing the profile report plus the seven-strategy eight-hour comparison;
- eight-hour natural/deep, which reached the target in 7.15 d over 21 windows and four Rugs, used two preparation stages/20% extraction on each Rug, and ended at $4,955,450,080,111.

These numbers describe this checkout and simulator heuristic. They are not evidence of human pacing, comprehension, or fun.

## 6. Reachability and compatibility residue

Classifications below describe the current working tree. “Compatibility-only” may still be production-reachable when its purpose is migration or bridging old shapes.

| Item | Classification | Repository evidence |
|---|---|---|
| Enterprise Intensity | internally consumed but not player-facing | `deriveEnterprisePresentation` computes it; the host exposes a CSS variable/data state, presentation uses it, and audio gain consumes it. Its number is visible only in query-gated playtest debug UI. |
| Enterprise Stage | internally consumed but not player-facing | `stageForIntensity` derives `scrappy` through `pre-rug`; CSS, presentation copy, semantic stage-change events, and audio consume it. The label is not an ordinary player-facing progression system. |
| Founder Core | apparently dead | No implementation/source or asset reference was found. Current documents say the old placement is retired; only an unresolved experiment remains. |
| Generator aliases | compatibility-only | `content/generator-definitions.ts`, `Generator*` aliases in `game-engine/types.ts`, and generator-named economy aliases have no current call sites beyond their declarations. |
| Rug Pull `unavailable` / derived `available` | production-reachable | Fresh/reset state stores `unavailable`; `createRugPullPreview` derives availability from peak Valuation and the current stratum target. |
| Reserved Rug Pull `preview`, `committed`, `extracting`, `returning` state values | compatibility-only | They remain in `RugPullState`; the helper preserves some restored in-flight values, and semantic events use similarly named lifecycle events. The normal production commit path does not assign a persisted multi-step state machine through all four values. |
| Old ten-Hustle IDs | test-only in the repository | Current catalogs contain only twelve new IDs. `troll-network` appears as a legacy migration fixture; production readers treat legacy run state opaquely and discard it rather than mapping old IDs. |
| V1 and v2 save readers | compatibility-only, production-reachable | `GriftPersistence` calls them when v3 data is absent/invalid, writes v3, and leaves old records untouched. Persistence specs execute both paths. |
| Current prototype audio | production-reachable | `AudioDirectorService` is route-activated/deactivated, gesture-unlocked, consumes semantic events/presentation, generates SFX tones, and loads `src/assets/audio/grift-os/music/prototype-background.opus` through `MUSIC_MANIFEST`. Missing/failed assets remain optional. |
| Global evolution artifact code | apparently dead | No production source or asset implementation reference was found. It remains a provisional documentation hypothesis only. |
| `prestige.curatedValuationEnvelope` | apparently dead | The value `$1Q` is assembled into `INFLUENCE_ENGINE_MECHANICS`, but no runtime, presentation, persistence, or simulator consumer was found. |
| `prestige.unlockValuation` | test-only/development-fixture compatibility | The real Rug Pull threshold comes from `campaignStrata`. `unlockValuation` feeds compatibility `RUG_PULL_CONFIG`, deterministic playtest shortcuts, and tests; it is not the live threshold authority. |
| `prestige.campaignTargetNetWorth` | internally consumed but not player-facing | The balance simulator and `campaignComplete` use the `$1T` target. No production route completion/win transition consumes `campaignComplete`; its direct repository call sites are tests. |

## 7. Executable verification

All commands were rerun after the final source content was present and now matches HEAD. No verification failure was repaired as part of this audit.

| Command | Result | Relevant output |
|---|---|---|
| `npm run grift:arch` | PASS | `GriftOS engine, presentation, runtime, host/renderer, and style boundaries pass.` |
| `npm run grift:test` | PASS | Architecture check passed, then Chrome Headless 150 completed 115/115 focused GriftOS tests successfully. |
| `npm test -- --watch=false --browsers=ChromeHeadless` | PASS | Chrome Headless 150 completed 170/170 tests successfully. |
| `npm run verify` | PASS | All files passed Angular lint; browser/server production bundles built; eight static routes prerendered. The GriftOS lazy browser chunk was 180.58 kB raw / 37.87 kB estimated transfer. |
| `npm run game:balance -- --strategy=natural --rug-strategy=prepared --max-days=14` | PASS | Current natural/prepared results recorded in section 5. |
| `npm run game:balance -- --strategy=leverage-reinvestment --rug-strategy=prepared --max-days=14` | PASS | Current explicit Leverage comparison recorded in section 5. |
| `npm run game:balance -- --strategy=natural --rug-strategy=prepared --max-days=14 --sensitivity` | PASS | Produced the sensitivity/profile comparison successfully. |
| `npm run game:balance -- --profile=eight-hour --strategy=natural --rug-strategy=deep --max-days=14` | PASS | Reached target in 7.15 d; details recorded in section 5. |
| Requested Chrome-plugin live route pass | BLOCKED | The Chrome-control runtime could not start because its Node kernel exited on `windows sandbox failed: helper_unknown_error: apply deny-read ACLs`. It was retried once. No Chrome DOM, screenshot, or interaction claim is included in this packet. |

The focused and full test counts are final-HEAD counts, not stable product metrics. Passing tests, lint, and build establish executable consistency only; they do not prove design quality or enjoyment.

## 8. Documentation verification

The table reports material discrepancies against the current working tree. Historical decision entries that are clearly dated/superseded and TARGET prose that is explicitly provisional are not treated as current implementation claims.

| Document and section | Current claim | Repository evidence | Classification | Recommended disposition |
|---|---|---|---|---|
| `docs/CURRENT-STATE.md` — front matter | Last verified at `e4a8fa9...`. | HEAD is `dc0d54d...`; current diagnostics and formatter reuse are committed there. | outdated | correct now |
| `docs/CURRENT-STATE.md` — Verification baseline | Focused 109 tests and full 158 tests pass; lint/build pass. | Final HEAD produces 115 focused and 170 full passing tests; `npm run verify` also passes. The pass/fail claim remains true, but the counts/evidence snapshot is stale. | outdated | correct now |
| `docs/CURRENT-STATE.md` — twelve-Hustle migration status | Describes the twelve-Hustle shared-mechanics migration as a not-yet-committed working-tree baseline. | The twelve-slot catalog, mapping, v3 persistence, tests, and production mechanics are already at HEAD; the latest commit is performance work. | outdated | correct now |
| `docs/decision-log.md` — Temporary Decisions / audio | Says audio assets are absent by design. | The manifest and repository contain `prototype-background.opus`, and production route audio loads it after gesture unlock. | incorrect | correct now |
| `docs/ARCHITECTURE-MAP.md` — front matter | Last verified at `e4a8fa9...`. | The ownership map remains structurally accurate, but final HEAD is `dc0d54d...` and now includes committed playtest performance diagnostics. | outdated | correct now |
| `docs/INVARIANTS.md` — front matter | Last verified at `e4a8fa9...`. | Current HEAD and executable counts have advanced. | outdated | correct now |
| `docs/INVARIANTS.md` — TARGET catalog validation | “Catalog assembly validates IDs and cross-references before a run begins” remains under not-yet-enforceable TARGET. | `validateEconomicSlotMapping` already validates completeness, unknown slots, and duplicate ownership during Influence mechanics module assembly; pack/architecture tests execute the constraint. | incorrect | correct now |
| `docs/VERIFICATION.md` — front matter | Last verified at `e4a8fa9...`. | Final HEAD is `dc0d54d...`; the current canonical verify command passes. | outdated | correct now |
| `docs/VERIFICATION.md` — Save/persistence evidence row | Calls for “V2 fixtures, v1 migration and rollback mirrors.” | V3 is primary; executable coverage is v3 restore/reconciliation plus v2/v1 migration and untouched legacy records. | incomplete | correct now |
| `docs/economy.md` — Offline progress | Describes offline progress as a local playtest feature. | Ordinary production restore calls `creditOffline`; automated production is credited after 30 seconds up to eight hours. | incorrect | correct now |
| `docs/economy.md` — Leverage reset on empire replacement | Describes reset on Rug Pull or empire replacement without separating current and future behavior. | Rug Pull reset is live. No empire-switch/replacement operation exists. | ambiguous | clarify status |
| `docs/economy-tuning-brief.md` — Milestone tuning inputs | Points reviewers to per-Hustle `GRIFT_OS_MILESTONE_TUNING` in `content/economy-tuning.ts` as the tuning location. | Current economic and milestone authority is `economic-slots/economic-slot-catalog.ts`; the content file is an adapter. | outdated | correct now |
| `docs/economy-tuning-brief.md` — Prestige inputs | Lists the curated valuation envelope as an economy input without reachability status. | `curatedValuationEnvelope` is assembled but has no consumer. | incomplete | clarify status |
| `docs/prestige.md` — Reset semantics | Says Hustle scale count resets, which can read as all scale returning to zero. | `commitRugPull` resets to each `initialScaleCount`; Online Rage Farm returns to 1 and the other eleven to 0. | ambiguous | clarify status |
| `docs/prestige.md` — `$1Q` curated envelope | Presents the envelope alongside current prestige parameters. | The constant exists but is not used by runtime, UI, persistence, or balance simulation. | incomplete | clarify status |
| `docs/game-design.md` — Not implemented | Lists offline progress as unimplemented. | Offline credit is wired on the production route and covered by runtime/component tests. | incorrect | correct now |
| `docs/game-design.md` — Leverage/current prototype/open questions | Warns against inventing a purchase system and still frames a small Leverage purchase proof as future/open. | Production mechanics and UI contain five run-scoped, Net-Worth-funded deals; explicit simulation can buy all five. | outdated | correct now |
| `docs/game-design.md` — Architecture | Summarizes the feature mainly as the component/content/engine split. | Current code has distinct host, renderer registry, empire pack, economic slots, pure presentation, runtime, formatting, audio, visuals, and componentized Influence renderer owners. | incomplete | correct now |
| `docs/game-design.md` — Progressive disclosure / Net Worth | Says Net Worth should reveal only when semantically meaningful. | The active Influence Stage always mounts its Capital Panel, including a fresh `$0` state. | outdated | clarify status |
| `docs/interface-architecture.md` — Fresh save and masthead | Says the fresh interface should not show Net Worth prematurely. | `InfluenceStageComponent` always renders the Capital Panel and current/peak Net Worth view. | outdated | correct now |
| `docs/interface-architecture.md` — Leverage mode | Says the current implementation may only contain a summary and that the final interaction is unresolved. | The active renderer mounts a purchase-capable `InfluenceLeverageComponent` backed by five executable deals. Broader final design may remain open, but the current baseline is no longer summary-only. | outdated | correct now |
| `docs/interface-architecture.md` — Hustle grammar examples | Uses old examples such as Troll People Online, Forums, Shows, and Channels as if they describe the active surface. | The live twelve-ID Influence catalog uses Online Rage Farm/Followers through Subscriber Towns/Residents and its per-Hustle verbs. | outdated | move to historical |
| `docs/content-guide.md` — Current source of truth | Includes `content/hustle-definitions.ts` without distinguishing authoring authority from compatibility assembly. | Player-facing authored content lives in `empires/influence/content/influence-content.ts`; `HUSTLE_DEFINITIONS` is a combined compatibility/enrichment bridge. | incomplete | clarify status |
| `docs/audio-architecture.md` — Prototype music path | Specifies `prototype-background.wav` in source and runtime paths. | `MUSIC_MANIFEST`, its spec, and the checked-in asset use `prototype-background.opus`. | incorrect | correct now |
| `docs/playtest-plan.md` — Audio observations | Frames the current audio question only around generated debug tones and whether audio stays debug-only. | Generated SFX tones remain, but production also has a real route-owned prototype background loop and persistent user controls. | incomplete | clarify status |
| `docs/playtest-plan.md` — Strategy runs | Lists human strategy runs but omits the simulator's explicit `leverage-reinvestment` strategy even though the balance note recommends testing it. | The CLI supports and successfully executes that strategy across all profiles. | incomplete | clarify status |
| `docs/playtest-plan.md` — Setup/instrumentation | Documents local playtest logging but not the current performance summary/reset. | HEAD now includes query-gated timing diagnostics plus committed component, presentation, persistence, and diagnostics tests. | incomplete | clarify status |
| `docs/mechanics-experiments.md` — Experiment B | Directs milestone experiments to `content/economy-tuning.ts`. | Shared economic slots own milestone mechanics; the content path is not authoritative. | outdated | correct now |
| `docs/mechanics-experiments.md` — Experiment C | Frames one run-specific Leverage modifier purchase as a future proof. | A five-deal run-scoped purchase layer is already production-reachable. | outdated | move to historical |
| `docs/mechanics-experiments.md` — Experiment H | Frames one looped base music layer as part of a future smallest prototype. | The loop and manifest path already exist; real SFX assets/layered final audio do not. | merely provisional | clarify status |

Items reviewed and found consistent enough to leave unchanged:

- The natural/prepared balance snapshot in `docs/economy.md`, `docs/economy-tuning-brief.md`, and `docs/playtest-plan.md` matches the newly generated output.
- The v3/v2/v1 persistence description in `docs/CURRENT-STATE.md`, `docs/ARCHITECTURE-MAP.md`, and the CURRENT invariants matches executable behavior apart from the specific rows called out above.
- `docs/prestige.md` correctly labels the six-value Rug Pull vocabulary as reserved rather than claiming a fully persisted six-step live state machine.
- The global evolution artifact and Founder Core passages that explicitly call themselves provisional/unimplemented remain accurate as status statements.
- Historical decision-log entries that are visibly superseded by later entries should remain historical; they should not be rewritten as though they were current claims.

## 9. Unrepresented current behavior

Meaningful behavior not accurately described in any current canonical document:

1. HEAD's `?playtest=1` performance instrumentation measures presentation snapshots, persistence serialization/storage, simulation ticks, semantic event work, explicit change detection, UI render latency, Angular turns, and browser long tasks; it exposes a compact summary and reset control.
2. `formatting/number-format.ts` caches `Intl.NumberFormat` instances for repeated count and significant-number formatting rather than constructing formatters on each call.
3. Foreground elapsed simulation is capped at 5,000 ms per tick, with a roughly 50 ms simulation scheduler and a separately throttled roughly 100 ms UI publication cadence.
4. Run persistence uses a two-second ordinary-save throttle while forced lifecycle/action saves bypass it; the committed observer times JSON serialization and storage writes.
5. Offline simulation advances the full engine with manual Hustles disabled, so extraction preparation can progress during an automated, positive-payout offline interval.
6. The real prototype music asset and manifest are Opus, not WAV: `src/assets/audio/grift-os/music/prototype-background.opus`.
7. Invalid restored `selectedHustleId` values are normalized to the first current Hustle, while current Hustle records are reconciled against the twelve-ID mechanics catalog.
8. A `$1T` campaign completion predicate exists and is used by tests/tooling, but the production route has no corresponding completion/win transition.

## 10. Unimplemented documented targets

The following are meaningful documented destinations or strongly implied end states that are not implemented. This list reports status and does not settle whether they should still be built.

| Target or implication | Current repository status |
|---|---|
| Additional empires | Only `influence` exists in `EMPIRE_IDS`, mechanics/content/visual packs, and the renderer registry. |
| Empire switching/replacement after prestige | No selector, command, runtime transition, or per-empire run collection exists. V3 stores only one active run. |
| Top-level `grift-os/` relocation and final ownership layout | The feature remains local to `pages/experimental/grift-os-game/`; several target paths in the architecture map are destinations only. |
| Formal shared interaction layer | Focus/overlay/Escape/touch behavior remains distributed through the current host and Influence components; the target `interaction/` owner is absent. |
| Formal visual and audio pack contracts/extraction | Influence-owned visuals exist and the renderer is componentized, but final pack interfaces/extraction are not present. |
| Final Hustle artwork system | Current Lane and Context use prototype raster viewport assets, including shared source renditions where final docs permit later differentiated crops/assets. |
| Final adaptive soundtrack and production SFX assets | One optional prototype Opus loop exists; SFX are generated tones and `adaptiveMusic` is retained without gating a final adaptive system. |
| Global evolution artifact / a decided Founder Core successor | No implementation exists, and the interaction/meaning remains an open product decision. |
| Production campaign-completion experience | The target value and predicate exist in mechanics/tooling, but the route has no player-facing victory/completion transition. |
| Giant-milestone or cross-Hustle resurgence layer | Explicitly deferred; current milestones remain per-slot/per-Hustle modifiers. |
| Any final Leverage model beyond the current five deals | The five-deal system is live, while broader “final” Leverage direction remains unresolved and therefore is not a settled implementation contract. |

## Confidence and limits

Confidence is high for repository identity, route/component wiring, mechanics ownership, state/persistence logic, compatibility reachability, test results, and simulator output because each is grounded in current source, call sites, executed tests, or generated reports. Confidence is medium for claims about visible production behavior: headless tests exercise contracts, but the requested Chrome-plugin connection failed before a tab could be inspected and no manual multi-viewport session was completed.

The following could not be proven statically or by the requested commands:

- subjective pacing, clarity, comedy, balance quality, or enjoyment;
- real-user legacy-save diversity beyond the executable fixtures;
- successful audio decoding/playback on every target browser and device;
- final responsive visual fidelity, focus behavior, and touch ergonomics across real devices;
- live Chrome DOM state, interaction behavior, and screenshots for this checkout because the requested Chrome control runtime could not start;
- deployed hosting/runtime behavior; this audit built and prerendered locally but did not deploy or fetch the deployed site;
- product intent behind unresolved targets or whether any provisional idea should be retained.

