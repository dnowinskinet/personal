# Obsolescence Inc Facilities Simulation Foundation Verdict

## Executive answer

### FOUNDATION-VERDICT.md

**Decisive recommendation.** Obsolescence, Inc. should use a **SimTower-style vertical circulation game skeleton**, but not a full SimTower clone. The closest proven foundation is: **SimTower and Yoot Tower for vertical transport, crowd readability, observation-driven pleasure, and mixed-use tower pressure; Theme Hospital and CorsixTH for room-as-machine grammar, equipment wear, queue readability, humor-through-operations, and modern diagnostic tooling; Project Hospital, Software Inc., Prison Architect, RimWorld, and Oxygen Not Included for staff qualification, priority policies, zoning, and autonomous work selection; Good Company, Another Brick in the Mall, Production Line, and SimAirport for buffers, reservations, logistics, bottleneck thinking, and throughput diagnostics; News Tower for deadline cadence and operational payoff.** That combination preserves the project’s novel part-constrained product payoff while avoiding the dead ends of weaker successors. citeturn14view0turn14view2turn14view3turn31search4turn31search7turn23search22turn23search18turn24search0turn24search4turn37search14turn37search7turn24search26turn25search24turn25search9

**What should be borrowed essentially unchanged.** Borrow, with very little alteration, these commodity genre systems: explicit room zoning on a tile grid; required objects for room validity; staff professions and strict job eligibility; autonomous task selection from a scored job pool; operator-and-machine reservations; localized input buffers; routine versus emergency maintenance; visible queues; a small set of staff needs; pause-and-build; multiple speed settings; copy/move/undo/blueprint tools; utilization and bottleneck overlays; and a separate deterministic simulation core. These are not novel design problems anymore, and the evidence consistently shows that failing to ship them early makes management sims feel either opaque or tedious. citeturn31search4turn31search7turn23search22turn23search0turn23search18turn24search0turn24search4turn37search14turn37search7turn25search24turn32search22turn33search1

**What should be adapted.** Adapt, rather than copy, elevators, needs, prestige/room-quality, maintenance, and progression. SimTower’s elevator drama is foundational, but its full timetable-like control and 15-floor express transfer logic are too genre-defining to import wholesale into Obsolescence’s electronics-firm fantasy. Two Point–style prestige is useful as a room-quality shorthand, but should be capped by category and function so the game does not devolve into item spam. Staff needs should be lighter than colony sims and closer to a narrow-band operational rhythm: enough to create layout consequences, never enough to turn the game into restroom babysitting. citeturn14view0turn14view1turn14view2turn14view3turn31search24turn31search16turn24search3turn24search4turn24search26

**What should remain original.** Three things should remain first-principles design territory: the **inventory-constrained product-resolution payoff**, the **showroom/offices/basement satirical split**, and the **specific way research, production quality, market readiness, and physical components combine into a launchable product**. Comparable games offer useful cadences and buffer systems, but none of them solve this exact “you can only sell the product your institution physically earned” payoff. That is the project’s strongest differentiator and should be protected from abstraction drift. citeturn25search9turn37search7turn25search24turn31search4

**Technical stack.** Keep the existing **Angular 21 shell + pure TypeScript deterministic simulation kernel + headless Node test harness**. For the world renderer, the most defensible foundation is **stay on the current Angular-integrated SVG/HTML approach for the first serious substrate**, but formalize a render adapter seam so that **PixiJS v8** becomes the fallback if Gate Ten performance or mobile readability fails. I do **not** recommend moving the foundation phase to Phaser Editor, and I do **not** recommend making Phaser itself the simulation host. Phaser 4 is a credible renderer and camera/input layer, but its scene lifecycle is unnecessary for a game that already has a deterministic kernel and rich Angular UI shell. If the current SVG approach breaks at stress load, choose PixiJS over Phaser because Pixi changes the fewest architectural assumptions: it is a renderer, not a second game-runtime opinion. Phaser 4 remains a solid fallback if the team later wants a fuller canvas scene stack; Phaser Editor v5 should be rejected for foundation work because it is commercial, tool-dependent, and mismatched to a data-authored room-and-system sim. citeturn28view0turn29search1turn29search3turn29search4turn35search1turn35search5turn36search0turn36search1turn36search3turn33search1

**The ten most important unintuitive joy factors.**  
1. Watching is fun when causes are readable.  
2. Support space is satisfying only when its absence creates legible drag, not catastrophe.  
3. Vertical growth is pleasurable when it creates a new circulation problem.  
4. Autonomous workers feel smart when the UI explains their current blocker.  
5. Rooms become memorable when they act like machines, not stat bins.  
6. Specialization is exciting when the scarce specialist changes strategy, not just efficiency.  
7. Maintenance is fun when it is mostly preventive staffing, not repetitive clicking.  
8. Deadlines work when they create short bursts of focus inside an otherwise calm sim.  
9. Copy/move/resize/undo are not polish; they are anti-fatigue infrastructure.  
10. Personality, animation, and sound prevent the institution from becoming a spreadsheet. citeturn12view4turn13view0turn13view1turn13view2turn31search22turn31search24turn31search28turn24search18turn32search23turn25search9turn21search20turn22search10

**The ten most dangerous failure patterns.**  
1. Teleport-like or abstracted circulation that makes the tower feel dead.  
2. Elevator/pathfinding defects that invalidate player planning.  
3. Post-setup passivity where the optimal move is to wait.  
4. Staff AI opacity that hides why work is blocked.  
5. Needs tuned so high that they become janitorial busywork.  
6. QoL omissions that make iteration painful.  
7. Theme-first, substrate-thin design.  
8. Prestige/item-spam exploits that trivialize layout.  
9. Cluttered alerts that replace observation with alarm fatigue.  
10. Small-screen UI failure in a game whose whole fantasy depends on readable flow. citeturn21search10turn21search13turn21search20turn22search1turn22search16turn26search0turn26search23turn31search1turn31search5turn31search8turn32search8turn37search12

**Initial balance priors and timing profile.** Start with a **24-minute quarter at 1×**. Target roughly **18–30 meaningful work cycles per qualified worker per quarter**, **2–4 restroom trips**, **1–2 food or short-rest recoveries**, **a consequential player decision every 45–120 real seconds**, and **one visible reward pulse every 2–4 minutes**. Start the company with cash equal to roughly **four quarters of present overhead at the tiny-company scale or about three quarters of overhead once the first specialized capability is opened**; require **1.5 quarters of post-expansion runway** before expensive leaps; make specialists cost **2.4× to 3.0× a junior salary**, seniors **1.8×**, and competent mid-rank staff **1.35×**; target room-or-machine payback at **two to four quarters**; and expect **18% to 28%** of built floor area to be support space in healthy layouts. These values are synthesis, not direct historical copies, but they align with the recurring expansion/overhead tensions seen in tower, hospital, software, airport, and factory management games. citeturn12view4turn26search0turn26search23turn21search13turn31search24turn37search14turn37search7turn25search24turn32search22turn25search9

**Smallest meaningful foundation build.** The first serious build should include: room zoning; door-and-corridor access; six professions; strict qualification rules; autonomous job scoring; three needs; personnel and freight cores; one standard personnel elevator model and one freight elevator model; machine wear and routine maintenance; receiving/storage/room buffers; quarterly settlement; one showroom-sales loop; one research room, one assembly room, one QA room, one maintenance room, one warehouse, one restroom, one break room, one cafeteria nook, and the existing flagship showroom; plus the diagnostics needed to answer “why is this not working?” without a debugger. That is enough to test layout meaning, staff rhythm, logistics, and the preserved product payoff. citeturn14view2turn14view3turn31search4turn23search22turn23search18turn24search4turn37search14turn37search7turn25search9

**Human decisions still needed before coding.** Very little remains genuinely blocking. My view is that only **two** taste decisions remain before implementation begins: how sharp versus humane the satirical tone should be in staff presentation and event text; and whether the final visual direction should preserve the current schematic cutaway look longer, or pivot earlier toward a richer “pixel-real” operational tableau. Neither should block the foundation substrate. Everything else below is specific enough for a coding agent to begin. citeturn21search20turn19search11turn31search22turn31search27

**Assumptions and confidence.** I was not able to verify project-specific files named `CURRENT-STATE.md`, `DECISIONS.md`, and `AGENTS.md` for Obsolescence, Inc. from the accessible file sources in this session, so I treated the long brief as authoritative and did not contradict its described live prototype. Confidence is **high** on the genre skeleton, commodity systems, and anti-patterns; **medium-high** on the technical stack choice; **medium** on exact timing priors; and **low-medium** on certain handheld lineage specifics for The Tower DS because authoritative English-language documentation is sparse.  

## Tower lineage and mechanics matrix

### TOWER-LINEAGE.md

**The original lineage begins with The Tower in Japan and SimTower in the West.** SimTower: The Vertical Empire was developed by OPeNBooK under Yoot Saito and released in 1994 for Mac and Windows, with later ports to 3DO and Sega Saturn. The underlying design premise was already unusual for the era: the tower was not just a land-value builder or landlord simulator, but a **transport-and-stress simulator** where elevator management was central. Saito’s own manual introduction explains that the tower’s “collective state of being” emerges from each tenant’s local condition, while the reference section repeatedly centers traffic timing, rush periods, and diagnostics such as the magnifying glass, tenant windows, and find-person browsing. citeturn12view1turn12view3turn12view4turn13view0turn13view1turn19search21

**The hidden design assumptions in SimTower are more important than the feature list.** The manual makes clear that the game is built around traffic rhythms. It states that the in-game clock correlates with rush hour and lunch, that game time **speeds up during inactivity and slows during heavy activity**, and that the player should study daily surges and lulls when designing transportation. That is a subtle but crucial joy principle: time compression is calibrated around decision density rather than realism. It is part of why “waiting” in SimTower feels more like observation of a living machine than like a stall. citeturn12view4

**SimTower’s circulation rules were concrete enough to create real layout problems.** Lobbies could be placed every 15 floors as transfer points, explicitly to support express elevators; stairs relieved stress but were used only for shorter traversals, with residents unwilling to use more than four sets in one trip; escalators were restricted to public/commercial uses and were preferred because they had no wait time, but tenants would not take more than seven in one passage; standard elevators carried up to 17 people per car, could be up to 30 floors tall, and were limited by shaft and car counts; service elevators also carried 17 but existed for support staff and infrastructure; express elevators served 15-floor increments and could carry 36 passengers. None of this was merely decorative. The manual repeatedly warns that poor elevator placement creates stress, low evaluation, and eventual tenant departure. citeturn14view0turn14view1turn14view2turn14view3

**SimTower also shipped early with tools many successors underappreciated.** The tenant window exposed where someone belonged, where they were going, and how stressed they were. The find-person window let the player tag and locate named individuals. The magnifying glass exposed the internal state of elevators, stairs, and facilities. That combination of person-level peeking and system-level inspection is a major reason the simulation felt alive instead of purely numerical. Modern successors often copied the building cutaway but not this level of explainability. citeturn13view0turn13view1turn13view3turn13view4

**Yoot Tower, released in Japan as The Tower II and abroad as Yoot Tower, expanded the formula rather than replacing it.** The 1998 sequel kept the same basic interface and simulation style but added more scenarios, more facility types, more explicit specialty shops, public restrooms, billboards, freight elevators, multiple towers, and sky bridges. Contemporary and retrospective sources consistently describe it as “more stuff, still basically SimTower,” which matters because it shows what players actually wanted preserved: not reinvention, but more expressive tower composition around the same living-building logic. In the American release, Tokyo, Hawaii, and Kegon Falls were the major locations; Japanese TowerKit expansions extended that with Statue of Liberty, Tokyo Tower, Kyoto Station/Gamera 3, King Naniwa Building Legend, and Christmas Story, while Lunar Base, Luxury Cruise Ship, and Hokkaidō were reportedly planned but unreleased. citeturn18search6turn18search10turn19search22turn26search11turn26search4

**What Yoot Tower improved.** It broadened the fantasy from “single skyscraper” to “scenario-specific vertical complex” and increased the range of meaningful support spaces. The ATPM review specifically notes public restrooms, security, garbage detail, freight elevators, multiple towers, and skyways as salient additions. Those are not just content additions; they deepen the sense that a tower is an institution with backstage logistics, which is directly relevant to Obsolescence’s offices-above/showroom-at-grade/basement-below structure. citeturn26search11turn18search10

**What Yoot Tower made riskier.** More content also raised maintenance drag and scenario-specific complexity, and players sometimes found the maintenance fee cadence frustrating or encountered opaque requirements around VIP progression and utilities. The lesson is not “avoid backstage systems”; it is “add them only when the game explains them and keeps the reward cycle moving.” citeturn26search11turn19search12

**The Tower SP is best understood as a constrained handheld reinterpretation.** Released first in Japan in 2005 and in North America in 2006, it was a port-plus-revision of SimTower with selected Yoot Tower ideas. Because of handheld limitations, the most elite “Tower” status came at a lower population threshold and lower building-height envelope. It also made support facilities more explicit: restrooms had to be built, security patrolled nightly, housekeeping cleaned offices weekly, and cockroach infestation escalated in phases. Review coverage and later summaries agree that it added more direct interaction than the original, but also that once the player had sufficient janitorial and security support the building could become self-running, and long stretches of waiting became a real issue. citeturn19search23turn26search0turn26search16turn26search19turn26search23

**The Tower SP’s failure mode is especially instructive.** GameSpot’s review is harsh, but the load-bearing criticism is not really about graphics; it is that, after the early buildout, there is *not enough to do*. That is exactly the kind of post-setup passivity Obsolescence must avoid. The portable revision also demonstrates that adding manual actions, like tapping to lure customers or clean bathrooms, does not fix a weak operational cadence. Manual chores are not a substitute for meaningful management choices. citeturn26search0turn26search23

**The Tower DS is lineage-important but mechanically under-documented in English.** It released in Japan in 2008 on Nintendo DS as a follow-on to The Tower SP. English-language sources confirm the release and its place in the line, and longplays suggest a scenario- and character-framed format, but I found too little primary documentation to confidently claim detailed changes at the same granularity as SimTower and SP. For implementation purposes, it should be treated as a low-confidence branch rather than a primary design authority. citeturn18search16turn18search12turn18search8turn19search10

**The practical lineage verdict.** The line’s strongest through-line is not “build a tower with elevators.” It is this: **make the building feel like a legible organism whose bottlenecks are caused by real space, real transport, and visible people**. The line’s weakest recurring tendency is post-setup passivity, particularly in handheld adaptations. Obsolescence should inherit the first and aggressively defend against the second. citeturn12view4turn13view0turn14view2turn26search0turn26search23

### MECHANICS-MATRIX.md

**Comparison matrix by subsystem.** The table below is intentionally opinionated: it identifies the **best donor** for each subsystem, the best **secondary donor**, and the main **rejection warning**.

| Subsystem | Best donor | Why it is proven | Secondary donor | Main warning |
|---|---|---|---|---|
| Vertical transport drama | SimTower / Yoot Tower | Explicit capacity, transfer logic, visible waits, stress coupling. citeturn14view0turn14view2turn14view3 | Mad Tower Tycoon | Do not inherit broken-tuning frustration. citeturn22search1turn22search14 |
| Deterministic elevator reference architecture | tower-together | Pure TS sim, replay traces, strict parity testing. citeturn33search0turn33search1turn33search3 | Elevator Saga | Unmaintained; use only for microbenchmarks. citeturn10search0turn10search1turn10search13 |
| Room-as-machine grammar | Theme Hospital / CorsixTH | Required furniture, queues, equipment, wear, teach-by-observation UI. citeturn31search4turn31search7turn38search7 | Two Point Hospital | Avoid prestige spam. citeturn31search24turn31search20turn31search16 |
| Professions and specialization | Project Hospital / Software Inc. | Strong role separation, training, specializations, team fit. citeturn23search11turn37search14turn37search26 | Prison Architect | Room/deployment assignment useful, but keep simulation human-scale. citeturn23search18turn23search6 |
| Autonomous job selection with policy override | RimWorld / Oxygen Not Included | Categorical priorities, manual policy, specialization, proximity edges. citeturn24search0turn24search4turn24search13 | SimAirport | “Sticky” assignment lessons. citeturn37search16 |
| Needs and recovery rhythm | Two Point Hospital / Software Inc. | Consequential but not colony-sim overwhelming. citeturn31search24turn37search14 | Another Brick in the Mall | Optional staff needs prove the need for tunability. citeturn24search26turn37search17 |
| Logistics and buffers | Good Company / Another Brick in the Mall | Staff logistics, room buffers, loading dock logic. citeturn37search7turn24search26turn37search5 | Production Line | Strong bottleneck math; weaker readability when opaque. citeturn25search24turn25search4turn25search16 |
| Deadline cadence | News Tower | Regular settlement/deadline pulse without constant emergency spam. citeturn25search9turn25search2 | SimTower VIP visits | Use special visits as spikes, not the whole game. citeturn19search21 |
| QoL and diagnostics | CorsixTH / Two Point Hospital | Machine menu, queue inspection, sorting, room copy. citeturn31search7turn38search7turn31search28 | OpenRCT2 | Patrol/path highlight lessons from years of fixes. citeturn9view5turn39search1turn39search2 |
| Busy-system readability | Overcrowd / News Tower | Watching jams and flow is part of the fun. citeturn32search23turn25search2 | SimTower | Pixel-real legibility remains exemplary. citeturn30image0turn30image1 |

**Compact mechanics cards.** I am including concise cards only for the titles that materially shaped the final recommendation. Titles with thin evidence or low transfer value are handled in the failure autopsy or source-adoption sections.

**SimTower.** 1994, Mac/Windows, OPeNBooK/Maxis, still accessible through retro channels. Loop: build, observe, relieve traffic stress, unlock more uses, satisfy VIPs, reach star goals. Spatial model: side-view tower with explicit shafts, lobbies, and floor growth. Staff model: mostly support personnel, light direct management. Room model: placed facilities with operational demands. Needs model: tenant stress via transport, services, and mixed-use side effects. Job/queue model: visible queues and person movement. Equipment/maintenance: housekeeping, recycling, security, parking, pests, events. Vertical movement: the core of the game. Economy/progression: rents, stars, VIP checks, major landmark end state. Pacing: mostly observational but densified by legible traffic waves. QoL: tenant windows, magnifier, find-person. Most transferable mechanic: **transport stress as the soul of the building**. Dangerous anti-pattern: long passive phases if content or feedback thins out. Relevance score: **10/10**. citeturn12view3turn12view4turn13view0turn13view1turn14view0turn14view2turn14view3turn19search21

**Yoot Tower.** 1998, Windows/Mac, OPeNBooK9003/Sega PC. Loop: same fundamental tower management, but scenario-rich and more institution-like. Spatial model: tower plus possible multi-tower layouts and sky bridges. Staff/support model: more explicit service spaces, more backstage logistics. Most transferable mechanic: **scenario-specific vertical institutions, not just generic office towers**. Dangerous anti-pattern: content growth without equally strong explanation. Relevance: **9/10**. citeturn18search6turn18search10turn19search22turn26search11

**Project Highrise.** 2016, SomaSim. Loop: construct, wire utilities, attract tenants, satisfy scenario constraints. Spatial model: rectilinear tower with utility closets and tenant modules. Staff model: light abstraction. Vertical transport: present, but abstracted enough that many players perceive it as teleportation. Most transferable mechanic: **utilities as meaningful but comprehensible support pressure**. Dangerous anti-pattern: **a tower that no longer feels alive because circulation largely disappears from player attention**. Relevance: **7/10**. citeturn21search13turn21search10turn21search20turn21search31

**Mad Tower Tycoon.** 2020, Eggcode. Loop: build larger mixed-use tower, manage elevators, satisfy tenants and random events. Spatial model: classic side-view high-rise. Vertical transport: visible cars and customizable settings. Most transferable mechanic: **moving elevators remain emotionally valuable**. Dangerous anti-pattern: broken or mistuned lifts destroy trust fast. Relevance: **7/10**, but only as a caution-rich donor. citeturn22search14turn22search15turn22search1turn22search16

**Theme Hospital and CorsixTH.** 1997 original; CorsixTH as modern open-source reimplementation. Loop: diagnose, treat, expand, staff, and maintain rooms and machines under queue pressure. Spatial model: rooms as discrete operational units built from required furniture. Staff model: role-specific doctors, nurses, janitors/handymen, receptionists. Needs model: lighter than colony sims, strong enough to matter. Maintenance: machine wear, repair, room disruption. Diagnostics: modern CorsixTH adds queue/machine/staff menus, UI scaling, ordering, and large-hospital performance work. Most transferable mechanic: **room = machine + queue + staff handoff**. Dangerous anti-pattern: if interrupted workflows are not carefully modeled, hospitals lock up or go opaque. Relevance: **10/10**. citeturn31search4turn31search7turn38search7turn31search22

**Two Point Hospital.** 2018, Two Point Studios/SEGA. Loop: build specialty rooms, train staff, manage patient flow, chase map goals. Staff model: role-based plus traits and training. Room model: prestige, optional objects, copy-room convenience. Most transferable mechanic: **training and room-copy quality of life**. Dangerous anti-pattern: prestige/item spam can dominate room design if left uncapped. Relevance: **9/10**. citeturn23search0turn23search22turn31search24turn31search28turn31search16

**Project Hospital.** More realistic counterpart to Two Point, with sharper staffing and specialization pressures. Best as a donor for qualification rigor and departmental role separation. Dangerous anti-pattern: easy slide into micromanagement-heavy realism if not filtered. Relevance: **8/10**. citeturn31search13turn23search19

**Prison Architect.** Loop: zone, assign, deploy, and keep workflows and security balanced. Best donor for logistics/deployment-style policy overlays and capacity planning. Dangerous anti-pattern: sprawling policy complexity before the core rhythm is proven. Relevance: **8/10**. citeturn23search18turn23search6turn23search3

**RimWorld.** Colony sim with manual work priorities and mood/need interaction. Best donor for **policy-driven autonomous labor with player override**. Dangerous anti-pattern: players can easily misconfigure manual priorities and lower efficiency. Relevance: **8/10**. citeturn24search0turn24search3turn24search24

**Oxygen Not Included.** Strong donor for errands, priorities, proximity weighting, and “check the queue to understand why nothing happens.” Dangerous anti-pattern: too much complexity for this project’s intended scale. Relevance: **7/10**. citeturn24search4turn24search13turn24search1

**Software Inc.** Office/team/production sim focused on specialized staff, needs, specializations, compatibility, and working conditions. Best donor for categorical professions, team assignment, commute/parking support, and mid-complex employee simulation. Dangerous anti-pattern: letting the HR/staff layer balloon into spreadsheet play. Relevance: **9/10**. citeturn37search14turn37search22turn37search26

**Good Company.** Production-oriented tech-company sim centered on production lines and employee logistics. Best donor for **buffers, transfer logic, and the fact that workers and logistics staff are different constraints**. Dangerous anti-pattern: logistics bugs or hidden buffer rules make the whole factory feel unreliable. Relevance: **8/10**. citeturn37search7turn25search0

**Production Line.** Strongest donor for bottleneck thinking, parallelization, line balancing, and payback logic. Dangerous anti-pattern: obscure throughput math and poor readability of the core constraint. Relevance: **7/10**. citeturn25search24turn25search4turn25search16turn25search28

**Another Brick in the Mall.** Best donor for inbound deliveries, loading docks, store-bound storage, and optional staff hunger/bladder toggles. Dangerous anti-pattern: brittle logistics chains or unclear delivery conditions. Relevance: **8/10**. citeturn24search26turn37search5turn37search33

**SimAirport.** Best donor for bottleneck visualization, shift/staff scheduling, and lessons from task-swapping and pathfinding fixes. Dangerous anti-pattern: staff allocation quirks and small-screen UI problems. Relevance: **8/10**. citeturn32search22turn37search16turn37search12

**News Tower.** Best donor for deadline cadence and “watch the flow to sense the jam.” Dangerous anti-pattern: onboarding opacity and one-playthrough repetition. Relevance: **8/10**. citeturn25search9turn25search2turn25search13

## Failure autopsies and joy principles

### FAILURE-AUTOPSIES.md

**Project Highrise failed to replace SimTower’s emotional core because it solved some of the wrong problems.** It is a competent building sim and a useful utilities/cost donor, but even sympathetic reviews note that elevator access and foot traffic were deliberately minimized to allow design freedom, and player commentary repeatedly fixates on elevators feeling abstract or teleport-like. The consequence is subtle but decisive: the tower becomes a clean diagram rather than a struggling organism. Root cause: circulation was demoted from central drama to supporting abstraction. Prevention rule for Obsolescence: **never let vertical and local movement collapse into invisible throughput math**. Prototype test: if players cannot visually spot elevator stress, restroom distance, or freight drag in a thirty-second observation window, the build is failing. citeturn21search13turn21search10turn21search19turn21search22turn21search20

**Mad Tower Tycoon proves that visible elevators are not enough by themselves.** The game explicitly markets “realistic elevators” and moving cars, which is directionally right, but users still report that lift performance becomes unacceptable around mid-height expansion, tenants oscillate between elevators instead of making sensible stair choices, and console players found the control layer painful and tutorialization insufficient. Root cause: the game inherited the important *symbol* of SimTower but not its trustworthy operational feel. Prevention rule: **ship elevator depth only to the level you can test relentlessly, explain clearly, and tune deterministically**. Prototype test: in an elevator congestion fixture, 90% of failed journeys should trace back to an explainable rule and not an AI oddity. citeturn22search14turn22search1turn22search16turn22search18

**Hospital Tycoon is the clearest warning against façade-first design.** Recurring criticism is not that the hospital theme is wrong, but that the game lacks depth, slows down, and does not meaningfully expand beyond its tutorialized first impression. Some reviews also criticize its campaign discontinuity, where investment in one mission does not produce a satisfying institutional continuity in the next. Root cause: management theater without enough substrate. Prevention rule: **do not spend foundation scope on theme wrappers, campaign framing, or bespoke events until the room-staff-machine substrate is intrinsically fun**. Prototype test: in sandbox with placeholder art, the operation should remain enjoyable for at least one quarter-length session. citeturn31search1turn31search5turn31search17

**Two Point Hospital shows how a strong successor can still produce undesirable exploits.** It modernized Theme Hospital effectively and added highly praised conveniences such as room copying, but player discussion and reviewer guidance show how prestige can drift toward formulaic item stacking. Once that happens, room design risks becoming “how do I satisfy the hidden value function cheaply?” rather than “how does this workplace actually perform?” Root cause: too much quality packed into unbounded décor scoring. Prevention rule: **cap room-quality categories and tie quality mostly to useful support items or category diversity, not repeated filler**. Prototype test: a high-prestige junk room should not outperform a modest, operationally logical room. citeturn31search24turn31search28turn31search20turn31search16

**Project Hospital and some realistic management sims demonstrate the danger of over-resolving specialization.** Their appeal comes from strict professional boundaries and department logic, which Obsolescence needs, but community guidance also shows how easy it is for players to hit wrong-room assignment edge cases or desiderata for more precise room targeting. Root cause: realism increases the number of invalid states and therefore the demand for explanation tools. Prevention rule: **use strict qualifications, but keep room-role mapping understandable and expose the blocker chain plainly**. Prototype test: every unstaffed or wrongly staffed station should answer “what exact qualification is missing?” in one click. citeturn23search11turn23search19

**Factory and logistics sims repeatedly fail when buffers and reservations are hidden.** Good Company players report logistics breakage and unresolved hauling issues; Production Line can become opaque if the player cannot see where time is actually lost; Another Brick in the Mall shows how a single misunderstood dock/store-storage condition can make deliveries appear “broken.” Root cause: internally reasonable transfer rules that are externally illegible. Prevention rule: **every machine and room in Obsolescence needs a visible status cause among a short controlled vocabulary: no operator, no qualification, no input, output full, broken, reserved elsewhere, waiting freight, waiting elevator, or blocked by urgent need**. Prototype test: in a stockout fixture, human testers should correctly identify the blocker in under fifteen seconds. citeturn25search0turn25search16turn25search28turn37search5

**Autonomous-staff games fail hard when workers thrash or task-swap.** ONI and RimWorld make heavy use of priority systems, but those systems need player understanding. SimAirport’s own updates called out staff task-swapping as something that required overhaul and “sticky” assignments. Root cause: over-eager replanning without commitment windows or reservation discipline. Prevention rule: **once staff commit to a nontrivial job, do not permit preemption unless a higher-priority emergency clears a meaningful score delta**. Prototype test: in a mixed-floor shift-start fixture, no more than 5% of jobs should be abandoned before reaching their first planned station unless topology changes. citeturn24search0turn24search4turn24search24turn37search16

**Player feedback themes with the highest prevalence in the reviewed sample.** High-prevalence complaints were: passivity after the exciting setup phase; opaque staff AI; broken or unsatisfying elevators/pathfinding; repetitive maintenance chores; bad small-screen or console controls; and missing blueprint/copy/move tools. High-prevalence praise was: satisfying visible flow, meaningful specialization, charming animation and humor, room layouts that behave like little machines, and growth that introduces a new bottleneck instead of just more revenue. In my judgment these patterns are structural, not just launch noise. citeturn26search0turn21search10turn22search1turn22search16turn31search28turn25search2turn32search23turn31search22turn37search14

### JOY-PRINCIPLES.md

**Counterintuitive Joy Ledger.** The table below is written as direct build rules.

| Principle | Evidence | Why it works | Failure when omitted or overused | Implementation rule for Obsolescence | Prototype test |
|---|---|---|---|---|---|
| Observation is a reward, not downtime | SimTower’s time modulation and people inspection; News Tower praise for watching jams. citeturn12view4turn13view0turn25search2 | Players enjoy reading living systems if motion reveals causality. | If nothing readable happens, waiting becomes boredom. | Always show current task, target, and blocker in-world and in panel. | Silent 30-second observation: tester can narrate three meaningful bottlenecks. |
| Vertical growth must create a new problem | SimTower express/sky-lobby logic; Mad Tower mid-height lift pain. citeturn14view0turn14view3turn22search1 | Expansion feels earned when it changes planning. | If more floors just mean more rent, the tower fantasy flattens. | Increase expected elevator/freight cost nonlinearly with floor distance. | Throughput drops measurably after expansion until support is added. |
| Support rooms are fun only in a narrow consequence band | SimTower shops/restrooms/parking/stress; Another Brick optional staff needs. citeturn14view3turn19search21turn24search26 | They create tradeoffs without dominating attention. | If too weak, players ignore them; if too strong, play becomes babysitting. | Start with three needs and a modest support-space target. | Opposite-end restroom hurts throughput, but not catastrophically. |
| Autonomous workers are acceptable if diagnosable | RimWorld/ONI priorities; SimAirport sticky assignment fixes. citeturn24search0turn24search4turn37search16 | Players accept automation when they can see “why.” | Hidden priorities feel like betrayal. | Expose exact decision score factors on hover in debug/advanced mode. | Tester can answer “why not this job?” without dev console. |
| Rooms should feel like machines | Theme Hospital/CorsixTH; Production Line. citeturn31search4turn38search7turn25search24 | Machine-like rooms invite optimization and ownership. | Decorative stat boxes feel hollow. | Every room must produce, transform, recover, or route something. | Remove one required object and room output visibly changes. |
| Specialization is strategic only when scarce | Two Point training; Software Inc specializations; Two Point Museum experts. citeturn23search0turn37search14turn23search5 | Scarcity creates planning value. | If anyone can do anything, hiring becomes generic. | Keep professions strict; allow only narrow cross-training later. | One missing specialist creates a visible but recoverable bottleneck. |
| Maintenance is satisfying when preventive | CorsixTH machine menu and wear fixes; Theme Hospital machine dynamics. citeturn31search7turn38search7 | Prevention creates staffing and reserve decisions. | Click-to-repair loops feel like chores. | No manual “repair click” in normal play; staff generate and resolve jobs. | Understaff maintenance reduces throughput before catastrophic failure. |
| QoL is core content | Room-copy praise; CorsixTH’s years of UI upgrades. citeturn31search28turn31search7turn31search0 | Building games are about iteration. | Without it, every redesign feels punitive. | Ship copy, move, resize, demolish, undo in first serious prototype. | Tester can improve a bad floor in under 60 seconds. |
| Personality prevents spreadsheet fatigue | Theme Hospital’s humor; nostalgia around SimTower’s pixel-real atmosphere. citeturn31search22turn31search14turn19search11 | Comedy and animation make operational pain enjoyable. | Sterile visuals make equivalent systems feel like chores. | Give every profession a few distinct idle/task/need animations and ambient audio. | Two testers can identify what a room does without labels. |
| Alerts should summarize, not scream | CorsixTH message-drawer deduping; repeated complaints about clunky opaque UIs in complex sims. citeturn38search7turn32search8turn25search2 | Too many alerts destroy the pleasure of watching. | Spam makes players ignore the important thing. | Escalate only sustained blockers or high-impact failures. | Alert count remains low while heatmaps still show local issues. |

## Source adoption matrix

### SOURCE-ADOPTION-MATRIX.md

**Recommendation summary.** The coding agent should treat third-party codebases in five buckets: **direct dependency**, **study and adapt**, **behavioral reference only**, **reference because of license or provenance risk**, and **reject for foundation phase**.

| Source | What I inspected | License / provenance | Maintenance status | Recommendation | Why |
|---|---|---|---|---|---|
| Phaser 4 | Official repo and release pages. Current public docs describe Phaser 4 as the major release with a new WebGL renderer; framework is MIT. citeturn29search1turn29search3turn29search4turn29search5 | MIT | Active | **Fallback only** | Good renderer/camera/input layer, but unnecessary as simulation host for this project’s existing architecture. |
| Phaser Angular template | Official template repo. Bridge component + EventBus pattern, `src/app/phaser-game.component.ts`, `src/game/EventBus.ts`, `src/game/scenes`, and note about removable `log.js` analytics script. citeturn28view0 | MIT | Active | **Study only** | Useful integration pattern if canvas fallback is needed; do not inherit the template whole. |
| Phaser Editor v5 | Official site and pricing. Built for Phaser 4, commercial subscription, active-license requirement. citeturn35search1turn35search5 | Commercial | Active | **Reject for foundation** | Tool lock-in, licensing friction, scene-authoring bias, weak fit for data-authored sim content. |
| PixiJS v8 | Official site/docs and GitHub. Open-source 2D renderer with WebGL/WebGPU focus; MIT. citeturn36search0turn36search1turn36search3turn36search5turn36search12 | MIT | Active | **Prepared fallback dependency** | Best low-opinion renderer if SVG/HTML stress tests fail. |
| Grid Engine | Documentation mentions it as a map-based movement/pathfinding layer and Phaser 4 compatibility. citeturn8search0 | **License not confidently verified in this session** | Active docs | **Reject for direct adoption** | Strong for game grids, weak fit for elevator queues, station reservations, and deterministic modular AI. |
| tower-together | Repo README, AGENTS, CODEBASE, and prompt docs. Pure TS sim, fixture-driven trace testing, runtime-neutral core, Phaser client only for rendering. citeturn33search0turn33search1turn33search2turn33search3 | MIT | Active | **Study and adapt architecture** | This is the strongest reference for deterministic simulation structure and replay tests. |
| CorsixTH | Official site, changelog, release notes, issue traces. citeturn31search4turn31search7turn38search7turn38search10 | Open-source; source pages indicate permissive licensing in project files. citeturn38search11 | Active | **Behavioral and UX reference** | Outstanding donor for room/equipment/queue tooling and “why is this stuck?” patterns. |
| OpenRCT2 | Repo README and issue/release trail. GPL-3.0, active, years of patrol/path/queue fixes. citeturn9view5turn39search1turn39search2 | GPL-3.0 | Active | **Reference only** | Excellent for patrol/path/maintenance edge cases, but wrong license for direct dependency in a mixed proprietary/personal-site context. |
| OpenSkyscraper | Repo README. GPL-2.0, requires original SimTower executable present to run. citeturn34search1 | GPL-2.0 plus original-data dependency | Stale/experimental | **Reference only** | Useful historically, but unsuitable as a production base. |
| OpenTower | Repo README. C++/cocos2d-era experiment, separate sim/render claim, but extremely incomplete and asset provenance depends on third-party sprite help. citeturn34search0 | Unclear asset provenance; old codebase | Stale | **Reject** | The architectural *idea* is good; the codebase is not a safe foundation. |
| Elevator Saga | Repo and docs. JS, MIT, not actively maintained. citeturn10search0turn10search1turn10search13 | MIT | Unmaintained | **Study only** | Great for micro-level elevator dispatch experiments and wait-time metrics. |

**Exact source files and modules worth studying.** From tower-together, the high-value references are the sim package layout called out in `apps/worker/src/sim/AGENTS.md`, especially the `trace.test.ts` fixture pattern, `determinism.test.ts`, the `carriers/`, `queue/`, `reachability/`, and `route-scoring/` subpackages, and the fact that the client and server both run the same pure TS sim. The repo’s README and AGENTS material make these modules explicit. citeturn33search0turn33search1

From CorsixTH, the important references are not one magical class but the **pattern** visible in the changelog and issue traces: machine-menu aggregation, queue inspection, staff sorting, “patients get up less often when changing queue position,” fixes for idle/action-queue edge cases, and the many bug fixes around staff returning from rest, room editing, and interrupted workflows. Those are exactly the edge categories a facilities sim hits as soon as autonomous staff and mutable rooms coexist. citeturn31search7turn38search0turn38search2turn38search7

From OpenRCT2, the most useful references are patrol-area assignment bugs, unreachable-maintenance edge cases, and the long trail of queue/path fixes called out in issues and changelogs. For Obsolescence, this project is not a code donor; it is a caution-rich catalogue of what happens in large autonomous queueing games when “reachable” and “assigned” diverge. citeturn39search0turn39search1turn39search2

**Final technical verdict.** The correct technical decision is **not framework tourism**. Keep the existing deterministic TypeScript kernel. Keep Angular as the application shell and source of truth for chrome, inspectors, onboarding, and mobile bottom sheets. Keep the world renderer separate from the simulation. Extend the current SVG/HTML renderer for the first serious foundation because changing less maximizes learning-per-dollar. Build a clean renderer seam. If Gate Ten fails, adopt **PixiJS v8** for the world layer only. Phaser 4 is an acceptable secondary fallback if a richer camera/input scene stack later becomes necessary; Phaser Editor is out. citeturn28view0turn29search1turn36search1turn36search12turn33search1

## Simulation blueprint

### SIMULATION-BLUEPRINT.md

**Foundational genre skeleton.** Obsolescence should simulate a single mixed-use vertical institution with explicit finite space, local room access, role-gated labor, visible support requirements, and enough autonomous behavior that the player manages policy and layout more often than individual clicks. The substrate should feel like a tower/facilities sim first and a product-launch game second, because the product payoff becomes powerful only if the institution underneath it is legible and consequential. citeturn14view2turn14view3turn31search4turn37search14turn25search9

**Staff data model.** Use a compact `Staff` schema with: `id`, `profession`, `rank`, `specializations[]`, `stats`, `traits[]`, `salaryPerQuarter`, `hireCost`, `needs`, `satisfaction`, `experience`, `trainingQueue`, `assignment`, `state`, `reservation`, `currentLocation`, `shiftPolicy`, `absenceState`, and `lastStateChangeTick`. The minimal universal stat set should be **four stats only**: `proficiency` for work speed, `precision` for quality/error/wear influence, `endurance` for need resistance, and `initiative` for job-seeking responsiveness. Keep each stat in a narrow band, such as `0.8–1.2`, so rank and specialization stay more important than hidden spreadsheets. Rank should be `junior`, `regular`, `senior`, `principal`; professions in the first implementation should be `scientist`, `operator`, `qa_technician`, `maintenance_tech`, `logistics_clerk`, `sales_associate`, and `marketer`. Later roles like legal and HR can exist in data definitions without entering the first milestone. Qualification must be hard-gated by profession plus optional specialization, not stat substitution. A scientist with empty legal desks nearby still cannot perform legal work. citeturn23search0turn23search22turn37search14turn23search5turn24search0

**Traits and satisfaction.** Traits should be a small curated set, with one positive and one negative maximum in the first pass: `tireless`, `methodical`, `quick_learner`, `social`, `sloppy`, `fussy`, `restless`, `fragile`. Traits should modify narrow domains, not rewrite identity. Satisfaction should be a slow-moving meter influenced by pay fairness, room quality exposure, unmet needs frequency, overtime-style workload, and stalled training. Do not build a social-graph system in the foundation phase. Turnover should be soft: repeated low satisfaction creates wage demands, occasional absence spikes, and eventually resignation risk, but not constant churn. citeturn23search7turn23search4turn37search22

**Staff state machine.** Recommended states are: `idle_assigned`, `seeking_job`, `travel_to_job`, `waiting_for_station`, `waiting_for_input`, `working`, `urgent_need_interrupt`, `travel_to_amenity`, `queue_for_amenity`, `using_amenity`, `training`, `maintaining`, `repairing`, `blocked_repath`, and `off_shift_or_absent`. The priority order is: hard emergencies, self-preservation needs, committed repair/maintenance, committed time-sensitive production/research/QA jobs, then normal room work, then training, then idle fallback. To prevent thrashing, every non-emergency job reservation gets a **minimum commitment window** and a **resume token**. If interrupted for a need, staff try to resume the same job if the reservation is still valid. If topology invalidates the path, the reservation expires and the job re-enters the queue with age preserved. Starvation is prevented by job aging and an `idle_bonus` that slowly tilts selection toward long-waiting work. Deterministic tie-breaking should always fall back to stable IDs. citeturn24search0turn24search4turn37search16turn38search7

**Job scheduler.** The right implementation is a deterministic scored-job model with explicit reservations. Each room or machine publishes jobs into a central queue: work jobs, haul jobs, maintenance jobs, repair jobs, cleaning jobs, training jobs, and showroom/customer-facing jobs. The staff-side score should be:

```text
score =
  roleEligibility
+ specializationMatch * 40
+ rankFit * 12
+ departmentAssignment * 10
+ roomAssignment * 8
+ userPriority * 20
+ jobPriority * 30
+ ageMinutes * 0.4
+ urgencyBonus
- estimatedTravelSeconds * 0.15
- expectedElevatorDelaySeconds * 0.10
- needRiskPenalty
- preemptionPenalty
- stationContentionPenalty
```

Jobs with any missing hard precondition are excluded before scoring. Reservation happens in two phases: the job reserves its station and input batch; then a worker reserves the job. Cancellation returns reservations cleanly. Fairness comes from age accumulation plus a “same staff cannot repeatedly win the same low-priority room job” cooldown. Performance remains manageable for dozens or low hundreds of agents if scoring is rerun only on meaningful events: state change, new job publish, expired commitment window, topology invalidation, or urgent need threshold crossing. This borrows the *policy flavor* of RimWorld/ONI while adding the stricter reservation discipline demanded by production/logistics games. citeturn24search0turn24search4turn37search7turn25search24

**Needs and recovery.** For the first implementation, staff should have exactly **three active needs**: `bladder`, `hunger`, and `energy`. `comfort` and `morale` should remain derived or slow-moving modifiers, not immediate needs. Needs decay continuously during work and travel, more slowly while idle, and pause while absent. Thresholds should be: warning around 45%, soft penalty around 30%, mandatory interruption around 18%, and severe penalty below 10%. Recovery rates must be fast enough that amenities create a rhythm rather than a punishment; a restroom visit should be short, a cafeteria/break-room visit medium, and a full rest state uncommon inside one quarter. Amenity choice should weigh travel cost, queue length, quality, and current need severity. Traits should have small impact only on decay or threshold, not create bespoke systems. The design goal is to make restroom distance and break space placement matter, without ever making the optimal play “stare at toilets.” citeturn24search26turn31search24turn37search14

**Room zoning and validity grammar.** Use an integer cell grid with fixed floor height and fixed structural cores. The player builds rooms by **drag-zoning rectangles**, not by freehand wall drawing in the foundation phase. A room rectangle must touch at least one corridor cell; doors are auto-placed on a valid corridor-facing edge but may later be overridden. Each room type defines `minFootprint`, `maxFootprint`, `requiredObjects`, `optionalObjectCategories`, `capacityRule`, `noiseProfile`, `freightNeed`, `powerNeed`, and `floorClassRequirement`. Room quality should come from capped categories such as `efficiency`, `comfort`, `cleanliness`, `prestige`, and `special_support`, with strong diminishing returns after the second repeated item in the same category and a mild diversity bonus. This avoids Two Point–style prestige spam while keeping quality legible and data-driven. Copy, resize, move, blueprint, demolish, and undo must exist in the first serious prototype. Invalid rooms must show an explicit checklist with red-line reasons, such as no corridor access, missing sink, not enough power taps, missing ventilation clearance, or missing qualified station. citeturn31search20turn31search24turn31search28turn23search1

**Equipment and machine model.** Every equipment definition should include `footprint`, `accessCells`, `operatorSlots`, `allowedProfessions`, `requiredSpecialization`, `recipes`, `cycleTime`, `inputBufferSize`, `outputBufferSize`, `powerDraw`, `consumables`, `wearPerCycle`, `maintenanceInterval`, `calibrationAfterInstall`, `slowdownThresholds`, and `breakdownCurve`. Machine condition runs `0–100`. Above `70`, normal operation; `40–70`, small slowdown and increased defect chance; `15–40`, warning state with visible maintenance icon and larger penalty; below `15`, breakdown risk; at `0`, hard stop. Labs and QA machines should have a `calibrated` flag that reduces quality until a setup or post-repair job completes. Maintenance jobs are preventive and scheduled at threshold or interval; repair jobs are emergency and preemptive. No direct user repair clicking in normal play. The player influences uptime through staffing, spare capacity, upgrades, and replacement timing. citeturn31search7turn38search7

**Materials and logistics model.** Simulate materials at **batch granularity**, not as thousands of loose items. Inbound trucks deliver material batches to B1 receiving. Batches are then reserved into warehouse stacks and room-local buffers. Hauling is represented either by logistics staff jobs or by simplified freight transfer jobs, but the ownership model should always be clear: `unreserved`, `reserved_for_room`, `reserved_for_machine`, `in_transit`, `quarantine`, `waste`, `recovery`. Research outputs should usually be aggregate tokens or unlock states; physical component production and quality should be batched per recipe and lot. Finished components move into a central company inventory where the product-resolution system can assemble only from what exists. Returns and waste should also be batched. This is the minimum viable logistics model that still creates meaningful dock, storage, and freight decisions without simulating each screw. citeturn37search7turn24search26turn25search24

**Movement and elevators.** Within-floor pathfinding should be grid A* over corridor cells, door cells, and designated station access cells, backed by a cached floor graph plus an inter-floor transport graph. Personnel and freight use separate carrier graphs. Elevator modeling should be **medium fidelity**: visible cars, explicit capacity, floor-by-floor movement, calls, waiting queues, service zones, and rolling expected wait estimates. Do **not** reproduce SimTower’s full manual car-control panel or exact express semantics in the foundation phase. Instead, support: standard personnel elevators, optional express designation later, freight elevators with heavier capacity and fewer stops, and stairs for short-range backup travel. Travel estimation for job scoring should combine path length, recent average elevator wait, and predicted ride time. When construction invalidates paths, staff re-route; if impossible after bounded retries, their plan fails gracefully and they enter `blocked_repath`. Visual interpolation must remain entirely separate from simulation truth so headless tests stay deterministic. citeturn14view1turn14view2turn14view3turn33search0turn33search1

**Economy and progression model.** Costs are salaries, hiring, training, construction, fit-out, equipment, utilities, materials, maintenance, and occasional event losses. Revenue should come from two streams: **continuous operating revenue from the current product line and showroom/sales performance**, plus **quarter settlement adjustments** for standing, launch quality, and milestone bonuses. Growth gates should be mainly capability and standing based, not arbitrary stars. Floor expansion costs should rise by depth/height and special obstacles such as the subway limit already described in the prototype. One simple bridge loan system is worth including only after the first cash-flow loop works; for the foundation phase, a small overdraft or “credit line unlocked at standing milestone” is enough. The correct emotional target is: a modest company can coast safely; a big leap in capability is tempting but risky; failure is recoverable if reserves were sane. citeturn12view4turn21search13turn31search24turn37search14turn25search24

**Time model.** My recommended first timing profile is **Balanced Twenty-Four**: one quarter lasts **24 real minutes at 1×**. Speed settings are `1×`, `2×`, and `4×`; build/edit actions are fully allowed while paused. Under this profile, routine work cycles are roughly `20–80s`, research phases `45–120s`, small haul jobs `10–30s` plus travel, maintenance jobs `20–60s`, elevator waits healthy at `5–20s` and stressed at `20–45s`, and deliveries every `90–150s` once logistics is live. Wages and utilities accrue in small regular pulses so the player feels drag before quarter-end; strategic bonuses and standing shifts occur at settlement. This profile is slow enough to make observation pleasant and fast enough to avoid Tower SP–style dead air. Alternative candidate profiles are **Lean Eighteen** for more deadline-like play and **Deliberate Thirty-Two** for a more meditative tower sim, but neither is the right first build. citeturn12view4turn26search0turn26search23turn25search9

**Events and operational variation.** Event design should be mostly emergent, not random-chaos driven. First implementation event families should be: material delivery delay, machine overload breakdown, quality scare, reviewer/VIP showroom visit, staff absence, minor safety incident, and demand spike from marketing/showroom success. Every event should have a physical location, an escalation timer, a visible responsible response path, and a deterministic seed. Offscreen events should generally wait unless the player already has the relevant overlay or alert context. Event frequency target: one moderate event every `3–5` minutes once the company is beyond tutorial scale, with quieter early play. Rewards matter too: a great VIP visit or excellent QA run should create a visible positive spike, not just fewer punishments. citeturn19search21turn22search14turn25search9

**Showroom and product integration.** The flagship showroom should earn its space operationally. It should consume qualified sales/demo staff, display fixtures, and current-product stock. It generates steady baseline revenue, standing pressure, customer insight, and launch visibility. Marketing and showroom activity together create a `market_readiness` metric. Research creates recipe availability and quality ceilings. Production creates component lots. QA changes the reliable-share of those lots. Marketing and showroom work produce readiness and reputational momentum. At launch or product-resolution time, the interface reads the actual component inventory, validated design state, lot quality, and readiness, then restricts the player to products that the institution can physically support. Existing products may continue selling while a new one is prepared, but their demand and cachet decay. This keeps the project’s distinctive payoff intact while grounding it in a proven operations substrate. citeturn25search9turn37search7turn25search24

## Balance priors, scenarios, and gates

### BALANCE-PRIORS.json

The following priors are **implementation defaults, not final balance**. They are synthesized from the comparative evidence above and should be externalized immediately for sweeps and replays. The core rationale comes from the recurring genre tension between support-space cost, worker specialization, visible bottlenecks, and expansion runway. citeturn21search13turn31search24turn37search14turn37search7turn25search24turn32search22turn25search9

```json
{
  "time": {
    "quarterDurationMinutesAt1x": { "value": 24, "range": [18, 32], "confidence": "medium" },
    "speedOptions": ["1x", "2x", "4x"],
    "pauseAllowsBuildEdit": true
  },
  "economy": {
    "startingCashInCurrentOverheadQuarters": { "value": 4.0, "range": [3.0, 5.0], "confidence": "medium" },
    "recommendedReserveBeforeMajorCapabilityLeapInPostExpansionOverheadQuarters": { "value": 1.5, "range": [1.0, 2.0], "confidence": "medium" },
    "specialistSalaryVsJunior": { "value": 2.6, "range": [2.4, 3.0], "confidence": "medium" },
    "seniorSalaryVsJunior": { "value": 1.8, "range": [1.6, 2.1], "confidence": "medium" },
    "regularSalaryVsJunior": { "value": 1.35, "range": [1.2, 1.5], "confidence": "medium-high" },
    "roomFitoutCostInSeniorQuarterSalaries": { "value": 2.0, "range": [1.5, 3.0], "confidence": "medium" },
    "advancedMachineCostInSeniorQuarterSalaries": { "value": 3.5, "range": [2.5, 5.0], "confidence": "medium" },
    "targetCapabilityPaybackQuarters": { "value": 3.0, "range": [2.0, 4.0], "confidence": "medium" }
  },
  "space": {
    "supportSpaceShare": { "value": 0.23, "range": [0.18, 0.28], "confidence": "medium" },
    "stressSupportSpaceUpperHealthyBand": { "value": 0.35, "range": [0.30, 0.40], "confidence": "low-medium" }
  },
  "staff": {
    "productiveTimeShareHealthy": { "value": 0.58, "range": [0.50, 0.65], "confidence": "medium" },
    "walkingTimeShareHealthy": { "value": 0.16, "range": [0.10, 0.22], "confidence": "medium" },
    "needsRecoveryTimeShareHealthy": { "value": 0.12, "range": [0.08, 0.18], "confidence": "medium" },
    "idleTimeShareHealthy": { "value": 0.08, "range": [0.03, 0.15], "confidence": "medium" },
    "waitingForStationOrInputHealthy": { "value": 0.06, "range": [0.03, 0.12], "confidence": "medium" }
  },
  "needs": {
    "warningThreshold": 0.45,
    "softPenaltyThreshold": 0.30,
    "mandatoryInterruptThreshold": 0.18,
    "severeThreshold": 0.10
  },
  "maintenance": {
    "activeMachinesPerMaintenanceWorkerHealthy": { "value": 12, "range": [10, 14], "confidence": "medium" },
    "routineMaintenanceEventsPerSupportedMachinePerQuarter": { "value": 0.6, "range": [0.3, 0.9], "confidence": "low-medium" }
  },
  "elevators": {
    "healthyAverageWaitSeconds": { "value": 12, "range": [5, 20], "confidence": "medium" },
    "stressedAverageWaitSeconds": { "value": 28, "range": [20, 45], "confidence": "medium" },
    "personnelCarCapacity": { "value": 8, "range": [6, 12], "confidence": "medium-low" },
    "freightCarCapacityBatchUnits": { "value": 4, "range": [3, 6], "confidence": "low-medium" }
  }
}
```

**Required metrics.** The simulation should report: productive time share, walk share, needs share, idle share, wait-for-station share, wait-for-input share, block-by-breakdown share, average trip length, average amenity queue and wait, elevator wait and travel time, room utilization, station utilization, specialist utilization, machine downtime, output per staff-hour, output per productive square, salary per useful output, support-space cost versus productivity saved, material waste, operating margin, reserve runway, and payback age of capability investments. Those metrics are directly downstream of the most common failure complaints in the genre: passivity, hidden blockers, excessive walking, broken AI, and dead-end expansion. citeturn25search0turn25search16turn32search22turn25search2turn37search16

### TEST-SCENARIOS.md

**Deterministic fixture suite.** All scenarios should use seeded generation, fixed layout specs, and replayable input scripts. Each row below names the setup, the core metric, the expected qualitative outcome, and the pass band.

| ID | Setup | Duration | Primary metrics | Expected outcome | Pass band | Human feel question |
|---|---|---:|---|---|---|---|
| S01 | Compact, well-designed baseline | 1 quarter | output, utilization, margin | Smooth operation | margins positive, healthy time shares | Does it feel calm but alive? |
| S02 | Restroom + break room adjacent | 1 quarter | walk share, needs time | Best-case support layout | walk share reduced vs S01 by visible margin | Does adjacency feel rewarding? |
| S03 | Restroom opposite end of floor | 1 quarter | walk share, lost output | Throughput drop, no collapse | 5%–15% output loss vs S02 | Is the cause obvious? |
| S04 | Too few restrooms | 1 quarter | bladder interruption, queue wait | Recoverable annoyance | queue spikes but no full deadlock | Does it feel fixable, not cruel? |
| S05 | No break room | 1 quarter | energy penalties | Reduced efficiency, not disaster | 5%–12% output loss | Is absence legible? |
| S06 | Excess support space | 1 quarter | output per square, margin | Stable but inefficient | output per square lower than baseline | Does overbuilding feel safe but costly? |
| S07 | Junior-heavy staffing | 1 quarter | quality, throughput, wage ratio | Cheap, lower quality | lower output but good runway | Does cheap labor feel strategically valid? |
| S08 | Specialist-heavy staffing | 1 quarter | margin, quality | Higher quality, reserve pressure | runway shorter, quality higher | Does expensive talent feel valuable? |
| S09 | One specialist bottleneck | 1 quarter | blocked jobs, queue age | Single-point fragility | obvious stalled chain | Can player locate the missing skill fast? |
| S10 | Undertrained staff on advanced machines | 1 quarter | defects, breakdowns | Visible misuse cost | defect rate elevated vs trained baseline | Is qualification failure explicit? |
| S11 | One maintenance tech for many machines | 1 quarter | downtime, pending repairs | Preventive backlog | downtime rises steadily | Does understaffed maintenance read clearly? |
| S12 | Overbuilt maintenance capacity | 1 quarter | salary drag, downtime | Stable but wasteful | downtime low, margin unnecessarily lower | Does “too much support” exist as a real tradeoff? |
| S13 | Delayed materials | 1 quarter | input starvation | Visible stockout chain | wait-for-input spike | Can player trace the blocker chain? |
| S14 | Freight-core congestion | 1 quarter | haul delay, machine idle | Basement drag visible | output drops without floor AI breaking | Are freight bottlenecks legible? |
| S15 | Elevator congestion after expansion | 1 quarter | elevator waits, walk fallback | Upper/lower floors underperform | average waits exceed stress band | Does vertical growth create understandable pain? |
| S16 | Advanced capability opened too early | 2 quarters | reserve runway, payback | Tempting but dangerous | negative margin first quarter, recoverable with restraint | Is the risk seductive rather than stupid? |
| S17 | Conservative company coasting | 3 quarters | standing drift, demand decay | Safe stagnation | cash grows slowly, opportunity cost rises | Does coasting feel valid but limiting? |
| S18 | Aggressive expansion then recovery | 3 quarters | reserve, payback | Shock then stabilization | dip below healthy runway, recover by Q3 | Is recovery possible without save-scumming? |
| S19 | High-quality low-volume production | 2 quarters | quality, revenue mix | Premium but capacity-limited | higher standing, slower cash | Does quality have visible market value? |
| S20 | High-volume low-quality production | 2 quarters | defect, returns, margin | Fast early cash, later drag | returns/service load rises | Does corner-cutting boomerang clearly? |

**Decision gates.** The measurable gates below are the project’s go/no-go checks.

| Gate | Fixture | Pass threshold | Likely failure causes | Simplification fallback |
|---|---|---|---|---|
| Foundation adoption | S01 with edit operations | Multi-floor edit + sim + headless replay stable | Renderer leaking state, Angular/sim coupling | Freeze renderer choice, use existing SVG only |
| Room and job grammar | Add new specialized room from data | New room via data + prefab + tests, minimal loop edits | Hard-coded room logic | Reduce room family features until data path is clean |
| Staff rhythm | S01/S04/S10 | No excessive task thrash; blockers explainable | Preemption too eager, bad reservations | Increase commitment windows; fewer need interrupts |
| Layout meaning | S02/S03/S06 | Support placement changes throughput meaningfully, not absolutely | Effects too weak or too punitive | Tune travel and amenity weighting |
| Maintenance meaning | S11/S12 | Preventive staffing matters without click spam | Repair model too binary | Emphasize gradual slowdown before failure |
| Vertical meaning | S15 | Upper/lower expansion introduces cost and delay | Abstract elevators or broken queue logic | Reduce fidelity, keep visible wait math |
| Economic leap | S16/S18 | Risky expansion is tempting and recoverable | Costs too flat or too spiky | Narrow investment sizes first |
| Product payoff preservation | S19/S20 | Actual inventory/quality/readiness reshape launch options | Product layer too detached | Delay fancy market UI, keep hard inventory gate |
| UX comprehension | Any failed scenario | Tester can explain underperformance from UI | Missing diagnostics | Add cause-chain cards before more content |
| Mobile and performance | S15 on laptop/phone target | Readable at target viewport and stress load | Renderer overload, dense UI | Switch world layer to Pixi fallback |

## Implementation sequence and code-agent handoff

### IMPLEMENTATION-SEQUENCE.md

**Phase one: deterministic substrate hardening.** Implement grid/corridor graph formalization, room definitions, station definitions, and the reservation-based job system without changing the existing novel product payoff. Deliberately fake or omit final art, nonlinear economy events, advanced specializations, and shifts. Acceptance tests: headless determinism, fixture loading, topology invalidation, and two rooms with one shared specialist. Performance target: deterministic tick under stress on laptop-class hardware with no DOM leakage into the sim. Exit criterion: a simple tower can build, route, work, and explain blockers. Reusable later: all of it. citeturn33search1turn33search0

**Phase two: support-space meaning.** Add the three-need model, restroom/break/cafeteria amenities, local support-space metrics, and support layout overlays. Deliberately omit complex shifts and social simulation. Acceptance tests: S02–S05. Exit criterion: adjacent and remote support layouts have measurable, understandable differences. Reusable later: need decay/recovery, amenity selection, and diagnostics. citeturn24search26turn31search24turn37search14

**Phase three: machinery, wear, and maintenance.** Add machine condition, routine maintenance jobs, emergency repairs, calibration, and the machine-status menu. Deliberately omit consumable subtypes beyond one simple maintenance material if needed. Acceptance tests: S10–S12, plus “machine idle because no operator/no input/broken” UI checks. Exit criterion: maintenance is a staffing/investment choice, not a click chore. Reusable later: yes, directly. citeturn31search7turn38search7

**Phase four: receiving, storage, freight, and basement pressure.** Add B1 receiving, batch inventory, warehouse racks, room buffers, freight elevator jobs, and visible stockout causes. Deliberately omit bespoke conveyor drawing and per-item hauling spectacle. Acceptance tests: S13–S15. Exit criterion: basement/logistics decisions matter and remain explainable. Reusable later: yes. citeturn37search5turn37search7turn25search24

**Phase five: quarter settlement and preserved product payoff.** Connect research, production, QA, marketing, and showroom outputs to the product-resolution menu so it derives launch options from actual institutional output. Deliberately omit deep campaign framing, installed-base ledgers, and per-customer simulation. Acceptance tests: S16–S20. Exit criterion: the game produces a distinctive launch decision from real operations. Reusable later: core identity system. citeturn25search9turn37search7turn25search24

**Phase six: renderer and mobile gate.** Preserve the current renderer if it passes Gate Ten. If it fails, switch the world layer behind a render adapter to PixiJS v8 without touching the simulation API. Acceptance tests: mobile viewport inspection, overlay readability, stress-load frame stability. Exit criterion: readable fixed-width vertical play on target laptop and phone. citeturn36search1turn36search12turn28view0

### HUMAN-DECISIONS.md

Only these product-taste questions still deserve human judgment before coding:

1. How sharp should the satire be in staff/event writing: lightly absurd, or meaningfully bitter?  
2. Should the long-term visual target stay near schematic “pixel-real operations,” or pivot toward a friendlier stylization closer to Two Point or News Tower?  
3. If the first stronger prototype feels good, should legal/HR arrive as operational rooms early, or remain later-phase thematic garnish?  

Everything else in this report is specific enough to implement provisionally.

### CODE-AGENT-HANDOFF.md

```text
You are implementing the reusable facilities-management substrate for Obsolescence, Inc.

Read first:
- CURRENT-STATE.md
- DECISIONS.md
- AGENTS.md
- FOUNDATION-VERDICT.md
- TOWER-LINEAGE.md
- MECHANICS-MATRIX.md
- FAILURE-AUTOPSIES.md
- JOY-PRINCIPLES.md
- SOURCE-ADOPTION-MATRIX.md
- SIMULATION-BLUEPRINT.md
- TEST-SCENARIOS.md

Non-negotiable constraints:
- Preserve the existing deterministic pure-TypeScript simulation kernel.
- Preserve architecture boundaries: no Angular, DOM, renderer, or framework state inside the simulation package.
- Keep all tunable values externalized in config/data.
- Keep content data-authored.
- Keep the existing inventory-constrained product-build payoff; do not replace it with a generic freeform product catalog.
- Use placeholder visuals only.
- Do not add campaign bloat, multiplayer, LLM/runtime AI, cloud accounts, belts, deep social graphs, or per-customer simulation.

Technical stack:
- Keep Angular 21 as shell/UI.
- Keep the current renderer unless Gate 10 performance/readability fails.
- Pre-build a renderer seam so the world layer can move to PixiJS v8 later if needed.
- Do not adopt Phaser Editor.
- Do not adopt Grid Engine as a dependency.
- Do not import GPL code.
- Study tower-together, CorsixTH, OpenRCT2, Elevator Saga, SimTower/Yoot lineage, and the adjacent mechanics research as references only.

Implement in this order:
1. Formalize floor/corridor/nav graph and room data grammar.
2. Implement staff schema, strict qualification rules, reservation-based job system, and deterministic state machine.
3. Add three needs: bladder, hunger, energy.
4. Add room validity checklist, selected-agent blocker UI, machine status causes, and utilization overlays.
5. Add machines with wear, routine maintenance, repair, and calibration.
6. Add B1 receiving, warehouse storage, room-level buffers, freight jobs, and freight elevators.
7. Connect research, production, QA, marketing, and showroom outputs into the existing launch/product-resolution payoff.
8. Build the deterministic scenario runner and metrics reporter before broad content expansion.

Acceptance tests required:
- Determinism/replay tests over fixed fixtures.
- Topology invalidation tests after room edits.
- Staff no-thrash tests under mixed priorities.
- Qualification failure explainability test.
- Restroom distance and support-space throughput tests.
- Maintenance understaff/overstaff tests.
- Freight and personnel elevator congestion tests.
- Early expansion cash-crisis recovery test.
- Product-resolution integrity test: launch options must derive from actual inventory, quality, and readiness.

Deliverables from implementation:
- New config schema for timing, salary, needs, maintenance, elevators, rooms, and materials.
- Scenario runner for S01-S20.
- Metrics export from headless runs.
- UI answers for:
  - why this person is not working
  - why this room is invalid
  - why this machine is idle
  - what qualification is missing
  - what is causing this queue
  - whether the company can afford expansion
- A short deviation report if any assumption in the research proves wrong.
- Stop and report rather than silently inventing a different game.

Performance target:
- Normal-load deterministic sim should remain smooth on small laptop hardware.
- Stress-load fixtures must remain debuggable.
- Renderer changes must not alter sim output.

If a requirement conflicts with implementation convenience, preserve:
1. deterministic sim correctness,
2. blocker explainability,
3. layout meaning,
4. product-payoff preservation,
5. then visual sophistication.
```

**Final verdict.** The coding agent should build **a narrow, test-heavy, legible facilities sim foundation** that feels like a living tower-institution, not a checklist of tycoon features. Borrow the plumbing aggressively. Keep the product payoff original. Preserve the deterministic kernel. Treat renderer changes as optional until proven necessary. And measure the simulation like a factory, because the genre’s most common failures are not lack of ideas; they are invisible blockers, post-setup boredom, and systems that the player cannot trust. citeturn33search1turn31search4turn31search7turn21search10turn22search1turn25search0turn25search2