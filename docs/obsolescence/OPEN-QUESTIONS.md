# Obsolescence, Inc. — Open Questions

Questions that are genuinely undecided, with what each one blocks. When one is answered, move it to
[DECISIONS.md](DECISIONS.md) as a numbered entry and delete it here. **IDs are never reused.**

**Resolved so far:** Q-001 and Q-003 → D-011 (repo shape). Q-002 → D-012 (dependencies).
Q-005 → D-015 (research synthesis; produced [CANON.md](CANON.md) and
[CONTRADICTIONS.md](CONTRADICTIONS.md)).

Unresolved cross-report conflicts are tracked as `C-*` in
[CONTRADICTIONS.md](CONTRADICTIONS.md) rather than duplicated here. Eight of those are open —
C-11 through C-18 — plus seven rejected resolutions, U-01 through U-07.

---

## Blocked on an external artifact

### Q-004 — The mockups

**Blocks:** Gate C. Nothing before Gate C depends on them.

R8 and R9 both treat the mockups as composition canon. They are in neither the claude.ai Project nor
the repo. Daniel is retrieving them.

When they arrive, they belong in `research/mockups/` with a note per file recording viewport size,
device target, and intended interaction — R9 asks for exactly that metadata.

**Partially superseded 2026-07-30:** the visual-canon directive fixed the structural composition
(stack, ramp, dock, bays — see [VISUAL-CANON-NOTES.md](VISUAL-CANON-NOTES.md) and D-032), and the
facility scene implements it. The concept images shown alongside that directive were never
committed; if they are to be canon *artifacts* rather than inspiration, they still belong in
`research/mockups/` with the metadata above.

### Q-008 — Should the floor's bay grain be coarser than one simulation cell?

**Blocks:** nothing yet; revisit after Daniel plays the canonical tower.

The canon sketches "an invisible finite number of segments like 7 or 10" per floor. The simulation
zonable strip is 20 cells, and the tower presents those cells as the bays, because fixture rooms
begin and end on arbitrary cells — a coarser visual chunk would lie about where walls can go.
Re-chunking means changing simulation geometry (`FLOOR_WIDTH`, room min/max widths, travel costs,
every fixture span), so it is a balance decision to make from play, not a renderer setting. If 20
feels too granular in the hand, decide the target count first and re-derive the fixtures once.

---

## To be resolved by work, not by decision

### Q-006 — Does the R9 gate ladder survive rescoping for N=1?

**Blocks:** planning past Gate C.

D-003 replaced the tester-panel pass conditions and the Phase 2 synthesis produced the conversion
rule (scenario denominators, pre-registered). But the *ladder* — A through I — has not been
re-derived. Two findings change its shape already:

- **C-41 changes what Gate C is.** A single-stack Pixi run judged against absolute bars, not a
  Pixi-versus-Phaser bake-off. That removes the reason to install `phaser` at all.
- **C-15 is now the binding constraint.** Four reports hand down mandatory fixture lists totalling up
  to 35 scenarios against R9's budget of 5. Once every gate is scenario-denominated, that conflict
  gates the whole validation ladder.

Do not plan past Gate C in detail until Gates A and B have run.

### Q-007 — The save-key namespace

**Blocks:** Gate B.

I-011 forbids sharing storage keys with GriftOS and I-008 requires versioned saves. C-42 settles the
*versioning* shape — R8's two-version header plus R6's per-obligation rule-version pointer — but the
concrete key prefix and record layout are undesigned.

---

## Coverage gaps — no report addresses these

Found by the Phase 2 synthesis. None block Gate A; several block Gate B.

### G-01 — There is no `Offer` / lineup-slot entity anywhere in the corpus

**Blocks:** the content schema, and therefore Gate A.

`Variant` is the design. `InstalledBaseCohort` is units already sold. **Nothing represents the
sellable-this-quarter offer** — the thing with a price, a stock allocation, a display placement and a
lifecycle status. C-03 makes this urgent: the carried-over low end is a previous generation's variant
occupying a current lineup slot, which is precisely an `Offer`.

Recommended: add it. It is the missing noun the whole lineup loop is about.

### G-02 — No demand volume model exists

**Blocks:** Gate B economy.

No report says how many customers exist, how demand scales with price, quality, trust or claim
credibility, or what a conversion rate means. R5 specifies the *shape* of the choice function
(hard-constraint veto, then observed fit + confidence + urgency − burden) but no numeric resolution.

This is the largest single hole in the corpus and it is invisible until you try to run a quarter.

### G-03 — In-fiction time per quarter is unstated

**Blocks:** support-promise duration (U-01), sunset scheduling, C-21.

"Quarter" implies ~91 days. R4's Golden Quarter Gantt implies ~53. R6's support clocks imply
something else again. Until this is fixed, no support promise measured in *years* can be checked
against a campaign measured in *quarters*.

### G-04 — What the campaign starts with

**Blocks:** Gate B, and the Gen 0 mechanism C-21 depends on.

R2 requires seeded pre-existing installed-base cohorts. R6's ledger shows "none" for Q1–Q3. R5's
fixture assumes a carried-over model. These are incompatible starting conditions.

### G-05 — Which segments ship in the prototype

**Blocks:** Gate A content authoring.

R2 asks for four and does not name them. R5 asks for four at Stage 1 and does not name them either.
Seven exist. Somebody has to pick.

### G-06 — Capability and ExternalRule have no schema

**Blocks:** the content schema.

R2 names `Capability` as kernel entity #6 — the explicit anti-stat-soup mechanism — and never gives
it a schema. Same for `ExternalRule` as #12. Both survive only as string arrays on other entities.

### G-07 — No component or parts stock model

**Blocks:** Gate B operations.

R2 models component *definitions* only. Nothing models parts inventory, which R4's service-reserve
competition and repair backlog both require.

### G-08 — Active-floor budget

**Blocks:** Gate C.

R3 explicitly asked R8 to freeze how many floors may be simulated and rendered at full detail
simultaneously. R8 froze supported floor count instead and never answered the question. C-30's
resolution invented a number and was rejected for it (U-04).

### G-09 — Camera bounds at the extremes

**Blocks:** Gate C.

No report defines clamping, overscroll, rubber-banding, or what the player sees above the roof and
below the deepest basement.

### G-10 — What happens when a floor is inserted mid-campaign

**Blocks:** Gate B save migration.

R3 lists "floor addition/retool" as a required fixture; R8 requires stable floor IDs with an order
array. Neither describes the actual mid-campaign insertion event.

### G-11 — Campaign-length presets

**Blocks:** nothing. Recorded because it may dissolve C-01 entirely.

Quarter count is the most contested number in the corpus and **no report proposes short / standard /
long variants.** A 12 / 15 / 18 preset set would turn a contested production commitment into a
player-facing option.
