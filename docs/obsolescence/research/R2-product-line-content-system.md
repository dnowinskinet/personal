# R2-product-line-content-system.md

## Executive verdict and category comparison

The recommended first category is **smartphones, implemented as a fictional handheld-device platform rather than a thinly veiled parody of one real brand**. This category best satisfies the project’s combined requirements: players instantly understand the object; real-world product lines already use clear **Budget / Standard / Pro** ladders; a single shared platform can drive visible consequences in showrooms, support desks, repair benches, accessories, software promises, and recycling; and the category already has strong documented patterns for connectors, trade-ins, spare-part policies, update eligibility, repairability labels, and service sunsets. Apple, Google, Samsung, Fairphone, and EU regulators all expose these relationships in public product, support, and compliance materials, which makes the category unusually well suited to a data-driven simulation rather than a one-off handcrafted ruleset. citeturn18search3turn18search1turn27search1turn7search3turn8search11turn26search0

The recommended fallback category is **printers and home-office devices**. Printers are almost as strong systemically because they combine hardware tiers, consumables, driver/software dependence, proprietary-versus-standard parts, business-versus-home segmentation, subscriptions, support queues, cartridge lockouts, and recycling programs. HP’s public documentation is especially revealing here: dynamic-security firmware can block cartridges using non-HP chips, Instant Ink is explicitly page-based, subscription cartridges stop working after cancellation, and HP maintains dedicated recycling flows for original cartridges and hardware. That is excellent material for satire and for long-lived gameplay, but printers lose to smartphones on immediate emotional appeal, showroom glamour, and broad player aspiration. citeturn11search0turn11search1turn29search10turn18search6turn21search2turn21search17

The most important design conclusion is that the game should not model “a product” as a bundle of stats. It should model **a product family as a shared platform plus variant promises plus lifecycle obligations**. That mirrors documented real behavior: Apple, Google, and Samsung all compare devices as lineups with overlapping architectures but differentiated cameras, displays, storage tiers, performance, security, battery life, and pricing; regulators increasingly impose obligations at the model family level; and support/update promises are published per model generation rather than per individual unit. citeturn18search3turn27search1turn18search1turn7search0turn7search3

The candidate scores below are an analytical synthesis. Higher is better on all axes, including **Art Ease**, **Factory Ease**, and **Parody Safety**. The scoring is grounded in official product pages, repair and support documentation, interoperability standards, and regulatory sources discussed after the table. citeturn18search3turn11search1turn30search1turn19search17turn20search8turn10search2

| Category | Comprehension | Tradeoff Richness | Visual Fit | Family Structure | Installed-Base History | Segment Range | Dark Humor Potential | Art Ease | Factory Ease | Extensibility | Mobile Readability | Parody Safety | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Smartphones as fictional handhelds | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 3 | 3 | 5 | 5 | 2 | 52 |
| Printers and home-office devices | 4 | 5 | 4 | 5 | 5 | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 52 |
| Headphones and personal audio | 5 | 3 | 4 | 4 | 3 | 3 | 3 | 5 | 5 | 3 | 5 | 4 | 47 |
| Wearables and health devices | 4 | 3 | 3 | 4 | 4 | 4 | 3 | 4 | 3 | 3 | 4 | 3 | 42 |
| Domestic robots and modular household devices | 4 | 4 | 5 | 4 | 4 | 4 | 4 | 1 | 2 | 4 | 3 | 4 | 43 |
| Smart appliances and smart-home products | 3 | 4 | 3 | 3 | 4 | 4 | 4 | 1 | 2 | 4 | 3 | 4 | 39 |

**Why smartphones edge out printers in the final recommendation.** Smartphones have the cleanest overlap between product-line strategy and building legibility. The same object can be prototyped upstairs, demonstrated in a showroom, assembled from recognizable modules, repaired on a bench, updated through software, traded in, refurbished, stripped for parts, and regulated for durability and repairability. Publicly documented lineups already normalize base/plus/pro comparisons, trade-ins, update windows, connector transitions, and accessory continuity. The EU now requires smartphone and tablet spare-part availability, battery durability thresholds, repairability labeling, and minimum OS support windows, which gives the category unusually strong built-in lifecycle stakes for gameplay. citeturn18search3turn27search1turn21search0turn7search3turn7search11turn24search0

**Why printers remain the strongest fallback.** Printers are outstanding at expressing lock-in, support burden, and ecosystem friction. HP’s documentation shows page-based subscriptions, remote supply management, mandatory cartridge replacement when subscription service ends, dynamic-security firmware, business security features, and branded recycling loops. That is superb systemic material, but the category is weaker as a first prototype because showroom excitement is lower, products are less aspirational, and the first visual slice risks reading as “office equipment management” rather than “consumer-tech lifecycle satire.” citeturn11search1turn29search10turn11search0turn18search6turn21search2

**Why wearables, smart-home devices, and robots are not the first choice.** Wearables inherit phone dependence and add health-adjacent service and regulatory complexity; smart-home products add cloud, commissioning, and interoperability complexity through ecosystems such as Matter; domestic robots have excellent visual presence but require expensive animation, navigation, dock behavior, and environment simulation very early. Each is viable later, but all three ask the simulation kernel to solve category-specific problems before the core lineup loop is proven. citeturn9search17turn9search2turn30search1turn10search2turn20search8turn20search14

## Lessons from games and real product systems

The comparable games split into two useful families. **Lineup-and-market games** such as *GearCity*, *Game Dev Tycoon*, *Mad Games Tycoon 2*, and *Smartphone Inc.* are strongest at teaching readable family strategy: trims, sequels, editions, price/feature targeting, and market-segment fit. **Factory-and-process games** such as *Good Company*, *Big Pharma*, and *Production Line* are strongest at showing how components and operations create bottlenecks, but they often risk letting the puzzle consume the product fantasy. *Automation* is brilliant at expressive design choice, but its freedom comes with extreme category specificity and a high complexity floor. *Software Inc.* is the key reminder that post-release support, franchising, and data-driven content matter as much as the initial launch. citeturn4search1turn4search0turn23search0turn23search1turn17search0turn14search10turn15search0turn16search19turn25search5turn5search5

| Comparable | How the product is represented | What the player chooses directly | Best lesson for Obsolescence, Inc. | Main warning sign | Sources |
|---|---|---|---|---|---|
| *Automation* | A deeply parameterized car-and-engine design object inside a campaign/tycoon shell | Engine architecture, styling, engineering tradeoffs, campaign choices | Rich component choices are valuable when they stay tied to visible product identity | Too much continuous design freedom becomes category-specific and hard to port to new product classes | citeturn1search6turn25search5turn25search8 |
| *GearCity* | Vehicle designs plus components, trims, generations, platform sharing, and demographic reports | Components, vehicles, trims, refits, platform sharing, marketing | The best direct model for “shared platform plus variants plus city/segment fit” | Information density is immense; without aggressive UI simplification it becomes expert-only | citeturn4search1turn4search0turn3search3 |
| *Software Inc.* | Software products, franchises, support teams, distribution, and moddable data types | Product type, features, staffing, support, hosting, marketing | Data-driven content and post-launch support belong in the core, not as afterthoughts | Products can become abstract if physical lifecycle is absent | citeturn5search5turn5search8turn5search0turn5search6 |
| *Good Company* | Blueprints and factory lines for tech products | Production-line layout, employee logistics, research, products | Persistent blueprints and physical production are excellent for a flagship-building loop | Optimization can overshadow lineup meaning if market identity stays too thin | citeturn14search10turn1search14turn1search10 |
| *Big Pharma* | Treatments assembled through machine chains and patents | Ingredient transformation, machine layout, patents | A single component/process can affect many systems at once | The end product is weakly embodied as a consumer object | citeturn15search0turn2search16 |
| *Game Dev Tycoon* | A simple release object with research, reports, and audience fit | Topic, genre, audience, platform, engine tech | Elegant market readability beats stat soup | The product object is too abstract for repair, support, and disposal gameplay | citeturn23search0turn22search7turn6search19 |
| *Mad Games Tycoon 2* | Expanding lines of games, add-ons, bundles, ports, remasters, warranty/support cases | Product forms, target groups, line extensions | Great proof that post-launch variants and support load create history | Exception sprawl is a real risk when every category gets bespoke rules | citeturn23search1turn2search2 |
| *Smartphone Inc.* | A compressed board-game representation of price, production, research, and expansion | Price, production, research, expansion sequencing | Product families are more interesting when price positioning and production compete directly | Physical lifecycle is abstracted away almost entirely | citeturn17search0turn17search13turn6search2 |
| *Production Line* | Car factory flow and throughput puzzle | Assembly-line design, optimization, tech expansions | Factory verbs should be modular and reusable | Pure throughput games can reduce variants to line noise | citeturn16search3turn3search11turn3search13 |

The design takeaway is straightforward: **take lineup structure from *GearCity* and *Smartphone Inc.*, post-release obligations and modding discipline from *Software Inc.*, physical production verbs from *Good Company* and *Production Line*, and multi-system component consequences from *Big Pharma*—but refuse the drift toward either spreadsheet opacity or factory-only optimization.** citeturn4search1turn17search0turn5search0turn14search10turn16search19turn15search0

Real product systems reinforce the same structure. OEM comparison pages already present lineups as families with shared identity but variant-level differentiation. Apple compares iPhone models in a single matrix; Google positions A, standard, Pro, and Fold lines as distinct answers to different priorities; Samsung separates A-series affordability from S-series flagship status; HP splits home, home-office, Smart Tank, and Color LaserJet/business use; and Fairphone shows how a variant can deliberately compete on repairability and spare-parts access instead of only on glamour specs. citeturn18search3turn27search1turn18search1turn18search5turn18search6turn26search2

Those same systems also show where lifecycle obligations come from. Google publishes fixed update windows for Pixel phones; Fairphone publishes long support and spare-part expectations; Apple exposes parts-and-service history, self-service repair, and parts availability rules; Google documents repair programs for specific defects such as Pixel 7a battery swelling; Nest documents support sunsets that remove cloud functionality; and trade-in programs from Apple, Google, and iRobot normalize upgrade loops that treat old devices as future inventory, credit, or waste streams rather than finished stories. citeturn7search0turn8search11turn8search3turn7search13turn7search16turn10search2turn21search0turn27search6turn21search3

Two regulatory patterns are especially valuable for the game grammar. First, the EU common-charger framework shows how a single hardware standard can propagate through charging, accessory compatibility, cable inventory, and e-waste. Second, the EU smartphone-and-tablet ecodesign rules show that durability, disassembly, battery endurance, spare-part delivery windows, and software support are all now explicit market-facing obligations rather than invisible manufacturer internals. These are exactly the kinds of external rules that can create nonlinear consequences in a management sim. citeturn24search0turn24search5turn7search3turn7search11

The final real-world lesson is that **the best content multipliers are not “more stats,” but shared promises**. A connector, battery architecture, cloud account, cartridge standard, update window, or repair policy can save cost early, then explode into support burden, compatibility expectation, resale value change, defect propagation, or regulatory trouble later. That is visible in HP’s cartridge ecosystem, Apple’s connector transition and repair flows, Fairphone’s modular spares, and Nest’s cloud-sunset documents. citeturn11search0turn29search10turn24search6turn7search21turn26search0turn10search8

## Recommended product grammar

The smallest expandable universal model is:

| Universal entity | What it represents | Why it belongs in the core |
|---|---|---|
| `ProductCategory` | A semantic ruleset and visual vocabulary | Lets content reuse the same kernel across phones, printers, audio, and later products |
| `Platform` | Shared architecture for a family | Mirrors real shared lineups and creates reuse, savings, and shared risk |
| `Generation` | A market launch with dated promises | Needed for history, updates, and compatibility decay |
| `Variant` | A sellable model inside the family | The actual release object the player prices, showcases, supports, and repairs |
| `Component` | A part choice attached to a slot | The main content multiplier |
| `Capability` | Player-facing outcomes unlocked by components or software | Prevents hidden “stat soup” by naming visible effects |
| `Supplier` | Source, lead time, reliability, cost, capacity | Makes shortages and defect propagation systemic |
| `AccessoryOrService` | Add-on hardware, subscriptions, or account-linked services | Gives the installed base a reason to matter after launch |
| `Policy` | Support promise, warranty, repair stance, trade-in rules | Turns launches into obligations |
| `Segment` | A conflict-bearing customer archetype | Creates lineup tension instead of a single best product |
| `Defect` | A batch, platform, or variant-level failure pattern | Creates history and support queues |
| `ExternalRule` | Trend, regulation, standard, or market shift | Lets the world change without rewriting the category |

That is the recommended kernel because it is small enough to reason about but broad enough to represent every documented pattern that mattered most in the research: lineups, shared platforms, support windows, standards, subscriptions, repairs, trade-ins, and defect spillover. The model is intentionally closer to *Software Inc.*’s data-driven extensibility and Good Company’s persistent blueprint identity than to a one-off handcrafted category script. citeturn5search0turn5search5turn1search14

The **explicit boundary** should be this: **the universal kernel owns relationships, state changes, queues, and compatibility edges; category modules only define slot taxonomies, demo verbs, tests, and failure visuals.** In practice, the kernel should know that a variant has a `connectorStandard`, `softwareSupportYears`, `repairBenchTime`, `installedBaseCohort`, `tradeInRule`, and `defectRiskTag`; it should not know what a “camera island,” “paper jam,” or “dock mapping pass” is. Those belong to category modules that translate core concepts into visible behavior. That is how you avoid letting printers or robots infect the smartphone kernel with special cases. The need for this separation is strongly suggested by how moddable systems such as *Software Inc.* externalize content definitions, and by how *Production Line* and *Good Company* distinguish reusable factory verbs from product-specific outputs. citeturn5search0turn3search13turn14search10

Within a lineup, the recommended rule is **share expensive architecture, differentiate visible promises**. At the platform level, share the SoC family, operating-system branch, connector geometry, enclosure language, baseline repair stance, and core manufacturing route. At the variant level, vary the display class, camera stack, storage, material finish, charging speed, software entitlements, in-box accessories, price, and support tier. Use partial sharing for the highest-yield drama: for example, let the mid and Pro share a camera module while the budget and mid share the same battery cell. That makes reuse economically rational while preserving the possibility that one supplier defect, policy choice, or regulation change hits only part of a lineup. Real product comparison pages already show this kind of laddering in practice. citeturn18search3turn27search2turn18search1turn18search6

The gameplay-visible traits should be the ones that alter multiple scenes, not just scores. In the recommended first category, **connector choice** changes chassis space, accessory stock, demo stations, adapters, data-transfer demos, repair parts, and regulatory exposure; **battery architecture** changes thickness, cycle durability, fast-charging behavior, swelling risk, bench time, and recycling value; **display class** changes showroom brightness, defect tests, breakage rates, power draw, and refurbishment outcomes; **repair policy** changes training needs, spare-parts inventory, queue length, and customer trust. Those multi-scene effects are grounded in public repair manuals, repairability regulations, update policies, and accessory/connector documentation. citeturn24search6turn24search14turn7search3turn26search0turn7search13turn12search6

## Customer, generation, lifecycle, and expansion model

The customer model should use a **small set of conflict-bearing segments**, not a dozen additive appetites. The recommended set for the first category is: **Value Seekers**, **Mainstream Upgraders**, **Status Buyers**, **Power Users**, **Longevity Pragmatists**, **Privacy Guardians**, and **Institutional Buyers**. These are not arbitrary abstractions; they map cleanly onto documented marketing emphases in Apple, Google, Samsung, HP, and Google Enterprise materials—price, battery, camera, AI features, security/privacy, trade-in convenience, and fleet/organizational deployment are openly differentiated in the way companies present products. citeturn18search1turn18search3turn27search2turn28search4turn28search2turn9search8turn18search6

Each segment must carry at least one **active dislike** so that lineups cannibalize each other and not just “reward more quality.” Value Seekers dislike fragile prestige features and subscription drag. Status Buyers dislike visible compromise and old-looking models. Power Users dislike artificially slow ports, weak storage, and locked-out workflows. Longevity Pragmatists dislike glued batteries, short support windows, and expensive spares. Privacy Guardians dislike cloud tie-ins and aggressive data-sharing features. Institutional Buyers dislike unstable SKUs, poor repair predictability, and weak fleet support. Because these conflicts are rooted in real product positioning—privacy/security selling points, support windows, repairability, and business printer/security positioning—they can be explained to the player in simple language instead of hidden formulas. citeturn28search15turn28search9turn7search3turn26search6turn18search6

History should be handled with **cohorts, not per-unit simulation**. Track installed base by `(generation × variant × region × condition band × service state)`. That matches how the real world publishes obligations: update eligibility is model-based, spare-part availability is model-based, defect programs are batch/model-based, and trade-ins are handled through condition buckets rather than full individual histories. A cohort can therefore age, fail, update, trade in, resell, or drop out without the save file exploding. citeturn7search0turn7search3turn7search16turn21search0turn27search6

Lifecycle should be a first-class layer of gameplay. A generation should carry: **support promise**, **repair stance**, **accessory compatibility promise**, **service sunset conditions**, **trade-in rule**, and **end-of-life routing**. That is grounded in current reality: Google and Fairphone publish support windows; Apple exposes self-service and parts/service history; HP and iRobot run branded recycling/trade-in programs; and Nest shows that cloud shutdown can reduce a still-physical device to partial usefulness overnight. The game does not need every legal nuance. It only needs to model the obligations that are visible to players and legible to customers. citeturn7search0turn8search11turn7search1turn7search13turn21search17turn21search3turn10search8

Expansion value is highest when new content plugs into existing rules instead of demanding a new simulation kernel. The ranking below reflects both gameplay leverage and implementation burden.

| Content type | Expansion value | Typical burden | Delivery mode |
|---|---|---|---|
| New components within existing slots | Very high | Low | Data-only |
| New defects tied to existing tags or suppliers | Very high | Low | Data-only |
| New segments or segment preference shifts | High | Low | Data-only |
| New suppliers or supply shocks | High | Low | Data-only |
| New accessories using existing standards | High | Low to medium | Mostly data-only |
| New regulations or trends | High | Low to medium | Reusable rule module |
| New services or subscriptions | High | Medium | Reusable behavior module |
| New tests and QA flows | Medium | Medium | Reusable behavior module |
| New manufacturing steps | Medium | Medium | Reusable behavior module |
| New product categories | Very high | High | New art + category module |
| New disposal routes with bespoke visuals | Medium | High | New art + behavior |
| New showroom demo types | Medium | High | New art + behavior |

This ranking follows directly from the research. Software Inc’s data-modding model shows how much mileage formally structured content can deliver; Good Company’s archived blueprints show why old content must stay referentially stable; and real-world consumer-electronics ecosystems show that the most powerful new “content” is often a new standard, promise, or supplier relationship rather than a totally new object class. citeturn5search0turn1search14turn24search0turn7search3turn12search7

To keep the system readable and balanced, the core safeguards should be: immutable content IDs; no deleting old content definitions from saves; a hard limit on simultaneously active variants per family; feature caps by platform class; visible cause-and-effect tags on every important choice; and “negative prestige” costs for gratuitous fragmentation. These are design recommendations, but they are motivated by real pitfalls visible in comparable games and in real product systems: too many trims in car games, too many exceptions in category-rich tycoons, support obligations that outlive the product launch, and only-in-retrospect costs from overly fragmented ecosystems. citeturn14search7turn23search1turn1search14turn10search2

## Sample schema and populated example

The schema below is intentionally not production code. It is a structured content model designed to support **shared platforms, multiple variants, compatibility edges, repair/support commitments, lifecycle consequences, and content versioning** without embedding category-specific logic into the kernel. The approach is informed by the value of data-driven mods in *Software Inc.* and the importance of preserving archived product definitions in *Good Company*. citeturn5search0turn1search14

```ts
type ContentVersion = {
  id: string;               // e.g. "r2.v1"
  schemaVersion: number;    // migration target
  introducedAt: string;     // ISO date
  deprecatedAt?: string;
};

type ProductCategory = {
  id: string;               // "handheld.smartphone"
  module: string;           // "smartphone"
  slotTaxonomy: string[];   // ["soc","display","battery","rearCamera","frontCamera","port","radio","shell","storage"]
  demoVerbs: string[];      // ["photo","video","charging","desktopOutput","dropTest","repair"]
  repairRoutes: string[];   // ["screen","battery","port","camera","boardSwap"]
};

type Supplier = {
  id: string;
  tags: string[];           // ["battery","camera","display"]
  costIndex: number;
  qualityIndex: number;
  leadTimeDays: number;
  capacityBand: "low" | "mid" | "high";
  geopoliticalRisk: number;
};

type Component = {
  id: string;
  slot: string;
  supplierId: string;
  standardId?: string;      // "usb-c.usb2", "usb-c.usb3", "qi2", "magring.v1"
  traits: Record<string, number | string | boolean>;
  capabilityTags: string[]; // ["fastCharge","videoOut","repairEasy"]
  qaTags: string[];         // ["swellingRisk.low","dropFragility.mid"]
  compatibleWith: string[]; // component ids or standard ids
  sharedRiskTags: string[]; // ["batteryCell.volticaA","ois.optilux.v2"]
};

type Policy = {
  id: string;
  yearsSecurityUpdates: number;
  yearsFeatureUpdates: number;
  yearsSpareParts: number;
  warrantyMonths: number;
  selfRepairAllowed: boolean;
  serializedRepair: boolean;
  tradeInEnabled: boolean;
  accountRequiredForCoreFeatures: boolean;
};

type AccessoryOrService = {
  id: string;
  kind: "accessory" | "service" | "subscription";
  dependsOnStandards: string[];
  recurringCost?: number;
  installedBaseEffects: string[]; // ["lockIn.mid","supportLoad.low","retention.high"]
};

type Segment = {
  id: string;
  likes: string[];          // capability or policy tags
  dislikes: string[];
  priceSensitivity: number;
  upgradeCadenceMonths: number;
};

type Platform = {
  id: string;
  categoryId: string;
  designLanguage: string;   // "flat aluminium slab"
  sharedComponents: string[];
  sharedPolicies: string[];
  sharedAccessories: string[];
  capacityProfile: {
    assemblySteps: string[];
    toolingComplexity: number;
    repairBenchComplexity: number;
  };
  continuityPromises: string[]; // ["usb-c.mechanical", "magring.v1", "account.cloudsync"]
};

type Variant = {
  id: string;
  platformId: string;
  skuCode: string;
  name: string;
  msrp: number;
  heroClaims: string[];
  components: string[];
  withheldCapabilities: string[];
  targetSegments: string[];
  expectedCannibalizes: string[]; // variant ids
  manufacturingModifiers: string[];
  supportLoadProfile: string[];
};

type DefectTemplate = {
  id: string;
  triggerTags: string[];
  affectedScope: "component" | "variant" | "platform" | "generation";
  symptoms: string[];
  supportConsequences: string[];
  repairRoutes: string[];
};

type Generation = {
  id: string;
  platformId: string;
  launchDate: string;
  variants: string[];
  featuredAccessoryOrService: string;
  inheritedPromises: string[];
  externalRuleChanges: string[];
  defectRisks: string[];
  continuityDecision: "preserve" | "break" | "monetize";
};

type InstalledBaseCohort = {
  generationId: string;
  variantId: string;
  region: string;
  conditionBand: "new" | "worn" | "damaged" | "refurbished";
  unitsIndex: number;               // abstracted population
  accessoryAttachRate: Record<string, number>;
  serviceAttachRate: Record<string, number>;
  trustIndex: number;
};

type ContentBundle = {
  version: ContentVersion;
  categories: ProductCategory[];
  suppliers: Supplier[];
  components: Component[];
  policies: Policy[];
  accessoriesAndServices: AccessoryOrService[];
  segments: Segment[];
  platforms: Platform[];
  variants: Variant[];
  defects: DefectTemplate[];
  generations: Generation[];
};
```

A fully populated example, trimmed to the most important relationships:

```ts
const relayTwoCore: Variant = {
  id: "variant.relay2.core",
  platformId: "platform.relay2",
  skuCode: "R2-C",
  name: "Relay Two",
  msrp: 699,
  heroClaims: ["all-day battery", "bright OLED", "works with every Relay dock"],
  components: [
    "soc.meridian2",
    "display.oled120.61",
    "battery.volticaB.4700",
    "camera.main50",
    "camera.ultrawide12",
    "port.usbc2.magringV1",
    "radio.5g.gen2",
    "storage.256.u4",
    "shell.aluminum.flat"
  ],
  withheldCapabilities: ["desktopOutput", "proZoom100x"],
  targetSegments: [
    "segment.mainstreamUpgrader",
    "segment.longevityPragmatist",
    "segment.privacyGuardian"
  ],
  expectedCannibalizes: ["variant.relay2.seed", "variant.relay1.studio"],
  manufacturingModifiers: [
    "assembly.screenBond.mid",
    "cameraCalibration.mid",
    "adhesiveUse.low"
  ],
  supportLoadProfile: [
    "support.setup.low",
    "support.battery.medium",
    "support.camera.high"
  ]
};
```

The key design point is that **the variant does not contain hardcoded outcomes**. It references components, policies, segments, and compatibility promises. That means a new connector standard, supplier shortage, repair law, or defect template can affect multiple existing generations without bespoke code. That is the content-engine property the project needs most. citeturn5search0turn3search13turn1search14

## Example lineups and stress tests

The three lineups below are fictional, but each is built from the documented real-world patterns discussed above: budget-versus-pro tiering, update support windows, repairability choices, standards transitions, accessory continuity, camera and battery differentiation, and model-level defect spillover. citeturn18search3turn27search2turn24search0turn7search3turn26search0

**Generation one: Relay One.** Shared platform: flat aluminum/plastic slab, USB-C mechanical standard, magnetic accessory ring v1, Meridian M1 SoC family, 5-year security promise, 5-year spare-parts target. Featured add-on: **DockBand** wallet/stand; featured service: **CloudSync Basic**. Shared burden: Voltica A battery lot ages poorly under repeated fast charging in hot climates. External change: common-charger regulation and repairability labeling make connector and battery choices public-facing. Continuity decision: preserve open USB-C and keep accessory ring open to third-party accessories. citeturn24search0turn7search3turn21search0turn26search6

| Variant | Price | Best at | Main compromise | Segment winners | Cannibalization risk |
|---|---:|---|---|---|---|
| Relay One Seed | 399 | Value, battery life, easy setup | Slower storage, weaker camera, plastic shell | Value Seekers, Institutional Buyers | Can make the standard model feel overpriced |
| Relay One | 649 | Best all-round fit | Mediocre prestige, ordinary camera zoom | Mainstream Upgraders, Privacy Guardians | Can eat both Seed and Studio demand |
| Relay One Studio | 899 | Camera, display, data transfer demos | Lower margin, more fragile rear camera stack | Status Buyers, Power Users | Risks overproducing prestige stock |

This first lineup demonstrates the target grammar: the three models are not simple upgrades. The Seed can outperform the standard model on battery economy and repair time; the Studio expands showroom drama but increases defect exposure and margin volatility; and the middle model is the safest commercial bet but the easiest to cannibalize. That is the correct shape for the game. citeturn18search3turn27search2turn28search4turn26search0

**Generation two: Relay Two.** Shared platform: same accessory ring v1, same USB-C mechanical fit, Meridian M2 SoC, stronger repair tooling, 6-year security promise, and carry-forward DockBand support. Featured service: **CloudSync Plus + AI Photo Cleanup**. Shared burden: OptiLux OIS module used in the standard and Studio variants develops post-drop camera wobble. External change: long support windows and spare-part availability become expected rather than premium, while privacy/security messaging becomes stronger brand territory. Continuity decision: preserve physical continuity, but monetize one premium capability—desktop output—through the Studio tier only. citeturn7search0turn8search11turn7search3turn28search15turn28search9

| Variant | Price | Best at | Main compromise | Inherited promise | New support burden |
|---|---:|---|---|---|---|
| Relay Two Seed | 449 | Fleet value, battery, lower returns | No ring charger in box, weaker OLED | Old docks and cables still work | Carry-over battery complaint tickets from Gen 1 owners |
| Relay Two | 699 | Best total attach rate for accessories and service | No desktop mode, limited zoom | All Gen 1 DockBand accessories still fit | Shared OIS wobble failures after drops |
| Relay Two Studio | 949 | Photo demos, creator workflows, USB 3 desktop output | Higher QA time, lower yield | Same account and accessory ecosystem | Camera warranty spike due to shared OIS module |

Generation two is intentionally not a clean reset. Because continuity is preserved, the family gets brand coherence and accessory goodwill—but it also inherits old replacement expectations, spare-parts inventory, and a cross-model camera problem. That is the exact tradeoff the content engine should reward and punish. citeturn7search13turn21search0turn27search6turn24search6

**Generation three: Relay Air / Relay Three / Relay Three Studio Max.** Shared platform: Meridian M3, USB-C retained, account and charger continuity retained, but the thin **Air** chassis breaks magnetic-ring alignment and requires a **Legacy Bridge Case** for old accessory fit. Featured service: **CareLoop Battery Refresh** subscription plus trade-in bonus. Shared burden: sensor shortage restricts Studio Max supply and pushes down-margin production toward Air unexpectedly. External change: tougher battery/durability expectations and stronger privacy backlash against always-on cloud features. Continuity decision: partially break physical continuity, then monetize the bridge. citeturn12search7turn7search3turn28search2turn24search6

| Variant | Price | Best at | Main compromise | Continuity stance | Why it creates tension |
|---|---:|---|---|---|---|
| Relay Air | 599 | Fashion, thinness, status crossover | Worse repairability, legacy accessories need case adapter | Break then monetize | Pulls status buyers away from Studio while angering loyalty segments |
| Relay Three | 749 | Safe mainstream upgrade | Less exciting than Air, less pro than Studio Max | Preserve | Most profitable, but easy to make boring |
| Relay Three Studio Max | 1099 | Imaging, battery, desktop workflow | Supply constrained and expensive | Preserve for core accessories | Great halo model, bad if shortages block deliveries |

The three-generation test therefore passes. Earlier decisions constrain later ones in visible ways: open USB-C increases charger/accessory goodwill; preserved accessory geometry turns into a long-term promise; shared battery and camera modules create multi-variant defect scope; and trade-in/service continuity keeps the old installed base alive instead of vanishing between launches. citeturn24search0turn27search6turn7search16turn21search0

The **component multiplier stress test** is strongest when run on the **connector standard**, not on a generic stat. A connector standard affects at least twelve systems in understandable ways:

| System | Connector consequence |
|---|---|
| Design | Port size and placement consume chassis space and influence thickness |
| Supplier choice | Standardized ports broaden sourcing; proprietary paths narrow it |
| Prototype testing | Charging, data transfer, video-out, and accessory handshake tests change |
| Manufacturing | Port soldering/module install changes line steps and failure points |
| Inventory | Cables, adapters, ports, and bridge accessories become stock items |
| Showroom | Demo stations, docks, monitors, and in-box cable messaging change |
| Customer choice | Compatibility and convenience become explicit purchase criteria |
| Support | “My old accessory doesn’t work” becomes a support class |
| Repair | Port wear is a distinct repair route and spare-parts category |
| Regulation | Common-charger rules can force or reward standardization |
| Refurbishment | Standard ports help resale and refurb usability |
| Disposal | Adapter churn and cable waste rise when continuity breaks |

This is not speculative in the abstract; it is the direct game translation of observed real-world patterns. The EU’s common-charger directive made USB-C mandatory for many devices; Apple’s support docs show both the benefits of USB-C and the need for bridge adapters for Lightning accessories; Fairphone sells the USB-C port as a separate spare part; and iFixit’s repairability notes highlight modular ports as a meaningful serviceability factor. That is exactly the kind of component that deserves to exist as a first-class content object. citeturn24search0turn24search6turn8search1turn26search2turn26search4turn12search2

The **second-category extension test** works best with **printers and home-office devices** because they stretch the same kernel without proving too little. What remains unchanged: `Platform`, `Generation`, `Variant`, `Component`, `Supplier`, `Policy`, `AccessoryOrService`, `Segment`, `Defect`, `ExternalRule`, lifecycle cohorts, trade-ins, repair queues, and support promises. What gets added: a **consumable module** for page yield and subscription status; a **media-path module** for jams and scanners/ADFs; a **driver/onboarding module** for account setup; and printer-specific demo verbs such as print-speed, photo print, duplex, and scan/fax. New art is needed for cartridge insertion, paper feed, scan lid motion, jams, and print output. The kernel should not need a rewrite if consumable depletion is built as a reusable module rather than a printer hack. This should therefore be a **later expansion or scenario pack**, not a separate game. citeturn11search1turn11search0turn29search10turn18search6turn18search13

## Minimum vertical slice, risks, kill criteria, and cross-project implications

The minimum vertical slice should use **one fictional smartphone family**, **three launch variants**, **one accessory**, **one service**, **two suppliers per critical slot**, **four customer segments**, **four tests**, **three repair routes**, **two defect templates**, and **one seeded installed-base cohort from a prior model**. That is the smallest believable package that can test the whole thesis: platform reuse, variant cannibalization, accessory continuity, support burden, repair queues, and disposal/trade-in feedback. Anything smaller risks collapsing back into “design one object and move some sliders.” The slice should be data-authored, not hardcoded, because later save-safe content growth is one of the project’s core requirements. citeturn5search0turn1search14turn7search3turn21search0

The first kill criterion is **variant collapse**: if three models consistently resolve into “cheap / normal / best” with no meaningful cannibalization, the grammar is too shallow. The second is **invisible lifecycle burden**: if update promises, accessory continuity, defects, and repair policies do not continue to matter after launch, the installed base is just a score trail. The third is **factory overdominance**: if line optimization buries product identity, the game is drifting toward *Good Company* or *Production Line* without the lineup fantasy. The fourth is **kernel contamination**: if printers, watches, or robots would require custom exceptions inside the save model instead of category modules, the architecture has failed. Those risks are visible in the research corpus and should be explicitly tested, not discovered late. citeturn14search10turn16search19turn23search1turn5search0

For **R1**, the main implication is that the recurring release object should be **a family keynote or lineup launch**, not a single product. For **R3**, the building needs obvious stations for accessory displays, support intake, bench repair, refurbishment, and waste sorting, because those are category-defining verbs. For **R4**, assembly should focus on a few reusable steps—board fit, screen fit, camera calibration, sealing, flash/install test—rather than bespoke minifactory trees. For **R5**, the showroom must visibly express why one customer reaches for the Air, another for the standard model, and a third walks away angry that last year’s dock no longer fits. For **R6**, the campaign model should seed old installed-base cohorts and force at least one continuity break, one recall-like burden, and one support sunset before the first campaign ends. Those are design implications rather than settled final answers, but they follow directly from the category choice and the documented lifecycle patterns that make it worthwhile. citeturn4search1turn5search8turn10search2turn21search0turn27search6

The firm recommendation is therefore: **launch with a fictional smartphone product family**, keep the kernel centered on shared platforms and lifecycle obligations, use **printers and home-office devices** as the first extension stress test, and reject any implementation path that treats new categories as piles of exceptions instead of new slot taxonomies and demo modules. That choice gives the project the best balance of visual clarity, systemic depth, mobile readability, and long-term content leverage. citeturn18search3turn27search1turn7search3turn11search1turn24search0turn5search0