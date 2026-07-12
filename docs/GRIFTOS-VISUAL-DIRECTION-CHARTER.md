---
title: "GriftOS Visual Direction Charter"
status: "DRAFT — EDITORIAL NORTH STAR"
date: "2026-07-11"
scope: "Visual hierarchy, atmosphere, composition, motion, responsive expression, and implementation flexibility"
authority: "Subordinate to CURRENT STATE and DECISION LOG; complements interface architecture and game design; does not authorize mechanic changes"
source_precedence: "CURRENT STATE > DECISION LOG > latest canonical domain docs > this charter > experiments and visual references"
---

# GriftOS Visual Direction Charter

## 1. Purpose

This document defines the stable visual and editorial direction for the current GriftOS game while leaving room for later composition, art, and implementation decisions.

It is **not** a final screen specification and **not** an implementation contract.

Its job is to help future design and Codex work distinguish:

- the visual qualities GriftOS should consistently pursue;
- the boundaries that should not move casually;
- the parts of the visual system that should remain replaceable;
- the unresolved decisions that require human editorial approval.

The target is not a prettier dashboard.

The target is:

> **A browser-native incremental game that begins as a sparse personal hustle and grows into a seductive, institutionally plausible machine.**

---

## 2. Core visual thesis

The governing direction is:

> **Editorial Machine + Living System**

### Editorial Machine

GriftOS should use:

- strong typography;
- disciplined hierarchy;
- clear information priority;
- negative space;
- restrained credibility;
- carefully chosen framing;
- concise labels;
- serious presentation of absurd behavior.

The game should feel authored rather than assembled from generic dashboard components.

### Living System

As the enterprise grows, the interface should accumulate:

- motion;
- traces;
- density;
- structural relationships;
- ambient activity;
- stronger material presence;
- visible automation;
- changes in atmosphere.

The whole interface should feel increasingly powered, not merely display larger numbers.

### Combined effect

The player should feel that:

> a small, manually operated grift has become an institution with machinery, staff, flows, leverage, and its own atmosphere.

---

## 3. Settled boundaries

### 3.1 The site navbar remains the site navbar

The existing Nowinski navbar is global website navigation.

It must remain visually and structurally distinct from GriftOS.

GriftOS owns only the experience **below** the navbar.

Do not:

- move GriftOS modes into the site navbar;
- restyle the site navbar as game chrome;
- replace site navigation with a game-specific top bar;
- let the game visually swallow the rest of the website.

### 3.2 Game navigation remains inside the game surface

Hustles, Leverage, and Rug Pull are game modes.

Their navigation belongs below the game masthead and should reveal progressively when each mode becomes meaningful.

Do not show decorative or empty modes merely to create a richer navigation bar.

### 3.3 Existing mechanics are the source of visual meaning

Visual structure should express real game state:

- manual operation;
- expansion;
- automation;
- milestones;
- Leverage;
- Founder Take;
- Rug Pull;
- Net Worth;
- current Hustle selection;
- actual production cycles.

Do not invent metrics, currencies, or fake analytics to fill visual space.

### 3.4 Native light and dark expressions

Light mode and dark mode must each feel intentionally designed.

Light mode must not be a simple inversion of dark mode.

Dark mode must not default to generic navy SaaS or cyberpunk styling.

### 3.5 Site-wide accent colors remain supported

GriftOS inherits the user-selected site accent color.

The game should not assume a permanent cyan, purple, orange, or gold identity.

Meaning must not depend on one accent hue.

Actual errors, warnings, destructive actions, and success states should use separate semantic treatments where needed.

### 3.6 Mobile-safe architecture is mandatory

Desktop may receive the richest composition first, but the architecture must remain valid for:

- wide desktop;
- ordinary laptop;
- medium/tablet;
- narrow mobile.

Mobile must not be treated as a compressed desktop screenshot.

### 3.7 Progressive disclosure remains a governing rule

The interface should show slightly less than the full game, but exactly enough to reveal the next meaningful decision.

Complexity should appear because the player has earned a reason to understand it.

---

## 4. Desired emotional and visual qualities

GriftOS should feel:

- seductive;
- self-serious;
- specific;
- sharp;
- institutionally plausible;
- slightly sinister;
- increasingly powerful;
- expensive without becoming gaudy by default;
- alive without becoming chaotic;
- funny through contrast rather than overt joke decoration.

The player should enjoy becoming the asshole.

The presentation should make the machine desirable before the satire fully curdles.

---

## 5. What the current visual references contribute

The recent exchange-hall desktop and mobile references are not literal target screens.

They are useful because they demonstrate qualities missing from the current implementation.

### Borrow from them

- monumental treatment of Valuation;
- a sense that the interface occupies a place, not a blank page;
- spatial depth;
- enterprise-scale presence;
- richer production lanes;
- visible automation;
- clearer grouping of systems;
- stronger selected-state treatment;
- more deliberate hierarchy;
- atmospheric continuity across the whole interface;
- a premium mobile composition;
- a stronger feeling that the machine is operating.

### Do not borrow literally

- game navigation moved into the Nowinski site navbar;
- Insights, Ledger, Flow Monitor, System Status, or Discourse Feed;
- Reach, Outrage, Conversion, Sponsor Yield, or other invented metrics;
- cockpit-style permanent side rails;
- multiple decorative status panels;
- fake system telemetry;
- generic command-center composition;
- mobile bottom navigation copied without regard to the existing site and game architecture;
- baked-in visual representations of mechanics that do not exist.

### Interpretation rule

Use the references to answer:

> **How can the current mechanics feel larger, more alive, and more institutionally powerful?**

Do not use them to answer:

> **What extra systems can we invent to fill the screen?**

---

## 6. Reserved visual direction

The ornate cathedral mockup is reserved for a future **Religion / Cult / Belief Grift Empire**.

Reserved qualities include:

- cathedral architecture;
- stained glass;
- black-and-gold ecclesiastical materials;
- candles, altars, relics, incense, prophecy, tithes, guilt, devotion, and holy real estate;
- belief presented as a productive system;
- the interface itself becoming a church.

That direction should not bleed into the current attention-and-belonging empire.

The current empire may become monumental, atmospheric, and powerful without becoming explicitly religious, secret-society-coded, or ecclesiastical.

---

## 7. Composition hierarchy

The following priority and Stage model are stable.

### 7.0 Confirmed multi-empire Stage model

Each empire owns a materially distinct Stage composed from three responsibilities:

1. replaceable non-semantic background artwork;
2. a strongly defined central Chamber/Frame containing the empire identity and Valuation;
3. a stable Capital Panel using real persistent Net Worth data.

The Chamber is the Stage's visual centerpiece. Valuation remains its most important current-run information, but the number complements the authored object rather than replacing it. Empire renderers share a presentation contract; they do not share one mandatory Chamber DOM or rely on a theme-only reskin.

On desktop the Chamber remains centered and the Capital Panel occupies the right side. On mobile the current convention stacks the Capital Panel beneath the Chamber. Exact empire-specific silhouette, ornament, assets, and motion remain replaceable.

### 7.1 Valuation is the central current-run object

Valuation should feel:

- theatrical;
- alive;
- financially obsessive;
- spatially important;
- more than a plain KPI.

It should remain the clearest current-run anchor.

The central Valuation presentation may use:

- stronger framing;
- depth;
- subtle atmosphere;
- controlled gain feedback;
- visible motion tied to production;
- an optional replaceable background/media layer.

It should not require fake secondary metrics.

### 7.2 Net Worth is persistent and prestigious

Net Worth should feel distinct from Valuation:

- less volatile;
- more permanent;
- more owner-oriented;
- connected to inherited power.

It should not visually compete with the central Valuation during ordinary Hustles play.

### 7.3 Hustles remain the primary operating surface

The Hustle ledger is where the player operates the machine.

It should prioritize:

- identity;
- expansion unit;
- payout and cadence;
- cycle state;
- automation;
- milestone horizon;
- expansion cost;
- current primary action.

Rows should feel like operating lanes or small machines, not generic SaaS records.

### 7.4 Selected-Hustle context carries understanding and flavor

Selected context should hold:

- richer descriptions;
- concrete economics;
- next milestone;
- automation explanation;
- real modifiers;
- sharper satire.

The ledger is where the player acts.

The context surface is where the player understands and enjoys the specific grift.

### 7.5 Leverage and Rug Pull may have distinct visual modes

Do not force Hustles, Leverage, and Rug Pull into one identical layout.

They may share the same visual language while using different compositions:

- Hustles: operating field;
- Leverage: structural deals and distortion;
- Rug Pull: extraction ceremony and irreversible decision.

---

## 8. Atmosphere and place

GriftOS should feel like it occupies a real institutional environment without becoming a literal illustrated room that constrains every layout.

A replaceable atmospheric layer may provide:

- scale;
- depth;
- implied staff or activity;
- architecture;
- distant screens or media surfaces;
- ambient movement;
- a sense of operational presence.

### Requirements

- atmospheric assets sit behind semantic UI;
- no important text or controls are baked into background art;
- contrast is maintained through independent scrims and masks;
- backgrounds can be swapped without restructuring components;
- the interface remains readable when the atmospheric asset is absent;
- light and dark mode may use different treatments rather than one image with inversion.

### Stage background asset contract

Provide four authored source masters per completed empire:

| Variant | Source dimensions | Aspect ratio |
|---|---:|---:|
| Desktop dark | 2560 × 720 px | 32:9 |
| Desktop light | 2560 × 720 px | 32:9 |
| Mobile dark | 1440 × 1080 px | 4:3 |
| Mobile light | 1440 × 1080 px | 4:3 |

Source delivery should be opaque, 8-bit sRGB PNG. PNG is the editable/generation master, not the intended runtime payload. Runtime export should use AVIF as the primary format with WebP fallback; no JPEG is needed unless an image fails to encode acceptably. Target production payloads are at most roughly 650 KB per desktop AVIF and 400 KB per mobile AVIF, with fallback WebP kept as lean as practical.

Desktop composition safe areas at the displayed crop:

- the Chamber overlays approximately the center 28–72% horizontally and 15–82% vertically;
- the Capital Panel overlays approximately 80–97% horizontally and 24–76% vertically;
- important faces, symbols, or unique environmental events should remain outside those regions;
- architecture, lighting, texture, and incidental activity may continue behind the overlays.

Mobile composition safe areas:

- the Chamber occupies approximately 5–95% horizontally and the upper 10–62%;
- the Capital Panel occupies approximately 5–95% horizontally around 68–88%;
- treat the mobile image as an authored scenic crop, not an automatic crop of desktop art.

Do not bake in the Chamber, Frame, Capital Panel, values, labels, graphs, or readable signage. The environment should frame the semantic UI rather than duplicate it. Current CSS hooks accept an image or `image-set()` through:

- `--influence-stage-backdrop-dark-desktop`;
- `--influence-stage-backdrop-light-desktop`;
- `--influence-stage-backdrop-dark-mobile`;
- `--influence-stage-backdrop-light-mobile`.

### Avoid

- full-screen wallpaper that competes with the ledger;
- literal command centers;
- military/tactical rooms;
- generic cyberpunk cities;
- gamer RGB;
- scenery that dictates fake mechanics.

---

## 9. Motion and visible operation

Motion should communicate game state, not merely decorate.

Useful motion includes:

- manual action feedback;
- cycle progression;
- automated restart;
- payout completion;
- local activity traces;
- milestone arrival;
- Leverage activation;
- Valuation gain;
- Rug Pull transition;
- restrained ambient movement after structural growth.

### Motion hierarchy

- Early/manual state: sparse and comparatively still.
- Automated state: local repeated motion and visible self-running behavior.
- Structural state: broader relationships, traces, and atmospheric activity where supported by real mechanics.

### Avoid

- constant global pulsing;
- arbitrary particle noise;
- decorative charts;
- motion that obscures values;
- per-frame Angular state churn;
- collisions among gain messages;
- generic glow as the primary progression system.

Reduced-motion mode must preserve state and legibility while removing nonessential motion.

---

## 10. Typography and material language

Typography should do more work than boxes.

Prefer:

- clear scale differences;
- strong numeric treatment;
- disciplined labels;
- concise copy;
- tabular numerals for changing values;
- deliberate alignment;
- editorial spacing;
- restrained uppercase eyebrows;
- premium but readable display treatment for major values.

Materials may become richer as the enterprise grows, but should remain coherent.

Potential material qualities:

- dark glass;
- smoked metal;
- warm institutional light;
- restrained illuminated traces;
- clean paper or stone-like light surfaces;
- controlled borders;
- subtle depth.

Avoid:

- endless nested cards;
- sci-fi bezels;
- ornamental frames on every element;
- glossy crypto-game chrome;
- bronze RPG controls;
- fake terminal text.

---

## 11. Theme and accent behavior

### Accent color

Use the site accent for:

- selected state;
- progress traces;
- active mode framing;
- important production emphasis;
- controlled highlights;
- focus treatment where contrast permits.

Do not let accent color alone communicate:

- success;
- failure;
- affordability;
- destructive action;
- locked state.

### Light mode

Light mode should preserve:

- hierarchy;
- material depth;
- selected-state clarity;
- readable progress traces;
- atmospheric identity.

It should not become a flat collection of white cards.

### Dark mode

Dark mode may carry more scenic depth, but must preserve:

- strong typography;
- readable secondary text;
- clear separation between content and atmosphere;
- restrained glow.

### Validation accents

At minimum, later visual work should be checked with:

- blue;
- orange;
- yellow;
- red;
- green;
- purple;
- olive.

Yellow and olive are likely to require the most careful contrast handling.

---

## 12. Responsive expression

### Wide desktop

May use:

- a more atmospheric Valuation stage;
- a dominant Hustle ledger;
- pinned selected context;
- restrained secondary summaries;
- greater spatial depth.

The production surface must remain dominant.

### Ordinary laptop

Must avoid:

- oversized sticky mastheads;
- content viewed through a narrow slit;
- excessive side panels;
- loss of operating density.

### Medium/tablet

Use:

- full-width ledger at rest;
- overlay selected-context drawer;
- simplified atmosphere;
- preserved hierarchy.

### Mobile

Use:

- compact but premium Valuation presentation;
- clear mode navigation;
- stacked Hustle lanes;
- selected context in a bottom sheet or similarly immediate surface;
- touch-safe actions;
- no horizontal scrolling.

The mobile expression should feel authored for mobile rather than a collapsed desktop layout.

---

## 13. Reversibility and implementation flexibility

The visual system should distinguish between high-commitment composition decisions and replaceable visual layers.

### Structural and high-commitment

These should be decided deliberately:

- DOM hierarchy;
- information priority;
- Valuation-stage height;
- game-navigation placement;
- Hustle row density;
- ledger/context proportions;
- selected-context behavior;
- responsive composition;
- sticky behavior;
- relationship between atmosphere and content.

Do not disguise weak structural decisions as temporary placeholders.

### Replaceable

These should remain swappable:

- background art;
- scrims;
- glow intensity;
- border treatment;
- shadows;
- icon skins;
- decorative traces;
- ornamental framing;
- surface textures;
- motion timings;
- optional ambient figures or screens;
- future global evolution artifact visuals.

Prefer:

- CSS custom properties;
- semantic classes;
- replaceable media slots;
- SVG/CSS decoration;
- one semantic DOM;
- reusable visual primitives that do not encode one empire’s art.

### Deferred

Do not create placeholders for:

- fake metrics;
- nonexistent currencies;
- Insights;
- Ledger;
- Flow Monitor;
- Discourse Feed;
- System Status;
- topology maps implying mechanics;
- empty side modules;
- future empire-specific content.

An empty placeholder is not neutral. It creates layout debt and implies a product decision.

---

## 14. Current unresolved editorial decisions

The following remain open and require human approval:

- scenic/architectural versus typographic/editorial emphasis;
- whether the Hustle ledger visually overlaps the hero;
- degree of atmospheric visibility;
- amount of ornament;
- density of Hustle rows;
- selected-context width on large screens;
- exact breakpoint values;
- whether real Leverage relationships receive visual traces;
- whether any compact Leverage or Rug Pull summary appears during Hustles play;
- final background artwork;
- final icon treatment;
- final motion timings;
- final global evolution artifact;

Codex must flag these rather than silently settling them.

---

## 15. Design tests for future work

A proposed visual change should pass these tests:

### Hierarchy

Can the player immediately identify:

1. current Valuation;
2. what is producing;
3. what can be acted on;
4. what the next meaningful goal is?

### Mechanical honesty

Does every visual object correspond to:

- a real mechanic;
- a real state;
- a real action;
- useful flavor?

### Personality

Does the screen feel specifically GriftOS, or could it belong to any startup dashboard?

### Progression

Does later growth change the atmosphere and behavior of the interface, not only its numbers?

### Restraint

Has empty space been allowed to remain empty where no real system belongs?

### Flexibility

Can background, color, texture, and motion direction change without rebuilding the information architecture?

### Responsiveness

Does the design still work at laptop, tablet, and mobile sizes?

### Accessibility

Are controls semantic, focusable, touch-safe, contrast-safe, and understandable without color alone?

---

## 16. North-star summary

GriftOS should evolve from a sparse personal hustle into a living institution.

It should feel:

- monumental without becoming pompous everywhere;
- atmospheric without becoming scenic wallpaper;
- mechanical without becoming a cockpit;
- premium without becoming generic luxury UI;
- game-like without borrowing RPG or military language;
- alive without filling every region with telemetry;
- sinister without sacrificing comprehension.

The strongest visual principle is:

> **Make the current mechanics feel larger before adding more mechanics.**

The strongest architectural principle is:

> **Commit carefully to composition; keep atmosphere, material, ornament, and motion replaceable wherever possible.**
