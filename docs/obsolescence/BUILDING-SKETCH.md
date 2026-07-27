# Building sketch — deliberately rough

**Status:** a napkin, not a spec. Written 2026-07-26 to find out what we don't know.
Nothing here is ratified. If it contradicts [CANON.md](CANON.md), canon wins.

The point of drawing it is that laying out boxes forces questions that arguing in prose doesn't.
Open questions are at the bottom and they're the useful part.

---

## Opening state — everything crammed on one floor

Your whole company is the ground floor. Showroom at the front because that's the bit the public
sees, desks in the middle, one workbench at the back. No basement. No upstairs.

```
                        ░ signage ░
        ┌────────────────────────────────────────────┐
        │  GROUND FLOOR                              │
        │  ┌───────────┬───────────┬──────────────┐  │
        │  │ SHOWROOM  │   DESKS   │    BENCH     │  │
   st   │  │           │           │              │  │
   re   │  │  ▯  ▯     │  ☺ ☺      │  ☺   ⚙       │  │
   et → │  │  display  │  research │  production  │  │
        │  │  + sales  │  + market │  + assembly  │  │
        │  └───────────┴───────────┴──────────────┘  │
        └────────────────────────────────────────────┘
        ════════════════════════════════════════════════  ← pavement
                  (nothing below yet — just dirt)
```

Three lanes, front to back: **public / work / service**. That's R3's depth-lane idea, which
survives the pivot fine. Front is what customers see, back is where things get made, middle is
where people sit.

The three Gate A sinks map straight onto the three lanes at this size. That's a nice accident —
it means the current slider prototype is already secretly this floor.

---

## After a few quarters — bought up and dug down

```
        ░░░░░░░░ ROOF — signage, aircon, one sad plant ░░░░░░░░
        ┌────────────────────────────────────────────────────┐
   +3   │  ▓▓▓  LEGAL & HR  ▓▓▓          LOCKED              │
        │  ▓▓▓  needs: standing 40 + £80k                    │
        ├────────────────────────────────────────────────────┤
   +2   │  MARKETING & SALES        ☺☺☺☺        ▓▓▓▓▓░░░     │
        │  front: campaign board   back: press desk          │
        ├────────────────────────────────────────────────────┤
   +1   │  DESIGN & PROGRAM         ☺☺          ▓▓▓░░░░░     │
        │  front: pinboard         back: spec files          │
        ╞════════════════════════════════════════════════════╡
    0   │  SHOWROOM              ▯ ▯ ▯      ☺                │ ← street
        │  the bit the public sees. hero plinth, demo table. │
        ╞════════════════════════════════════════════════════╡
   B1   │  DOCK & STORES     ▪▪▪▪▪   ▪▪▪   ▪▪                │
        │  ↘ ramp            chassis  board  cell            │
        ├────────────────────────────────────────────────────┤
   B2   │  ASSEMBLY & BENCH         ☺☺☺☺        ⚙ ⚙          │
        ├────────────────────────────────────────────────────┤
   B3   │  ▓▓▓▓▓▓▓▓ SUBWAY TUNNEL ▓▓▓▓▓▓▓▓                   │
        │  needs: standing 60 + £240k to have it moved       │
        └────────────────────────────────────────────────────┘

        ║ personnel core (people)      ║ freight core (stuff)
```

Two cores running the full height — people in one, materials in the other. R3 is firm that these
are visibly related but never the same capacity problem, and that's cheap to honour: two thin
columns, different colours.

**Street level is the hinge.** Everything above is telling the story. Everything below is producing
it. That contrast is the whole thesis and it's free — it's just a horizontal line.

---

## What each glyph is doing

| Glyph | Is | Comes from |
|---|---|---|
| `☺` | one staff member, on the floor you assigned them to | the three sliders, made spatial |
| `▪` | a part on the shelf, column per kind | `stock` in `QuarterState` |
| `▯` | a product on display | the assembled product |
| `⚙` | a machine / bench | not modelled yet |
| `▓░` | progress on this floor's output | research points, market points |
| `▓▓▓ LOCKED` | a floor you could buy | not modelled yet |

**The allocation UI stops being sliders.** You drag people onto floors. Four people on B2 means
four people making parts. That's the same decision the sliders make now, except you can see the
office standing empty while the basement is heaving — which is the entire up-versus-down tension,
rendered for free.

---

## The locked floor is the best part

```
   B3   │  ▓▓▓▓▓▓▓▓ SUBWAY TUNNEL ▓▓▓▓▓▓▓▓                   │
        │  needs: standing 60 + £240k to have it moved       │
```

It's visible from quarter one. You can see the thing you can't have, and exactly what it costs.
Every quarter you miss a goal and lose standing, it gets further away.

That's the whole persistence model (D-020) in one box, and it needs no ledger, no cohorts, no
installed base. Just a greyed-out floor with a price on it.

---

## Phone

One floor at a time, rail down the side to jump between them. R3 already specified this and it
still holds.

```
   ┌──────────────┐
   │ ▲ +1 design  │
   ├──────────────┤   ║
   │  B1 DOCK     │   ║ +2
   │              │   ║ +1
   │  ▪▪▪▪▪ chas  │   ║  0
   │  ▪▪▪   board │   ║ ▶B1
   │  ▪▪    cell  │   ║  B2
   │              │   ║ ▓B3
   │  ☺☺☺         │   ║
   ├──────────────┤
   │ ▼ B2 assembly│
   └──────────────┘
```

---

## What drawing it exposed — the actual point

1. **Is R&D a floor or a department?** Right now "research" is a sink. On a building it has to be
   somewhere. Upstairs with design, or downstairs next to the bench? It changes whether research is
   white-collar or workshop, which changes what the satire is about.

2. **What does market prep look like as a place?** Production makes visible parts. Research makes a
   visible level. Marketing makes... a bar filling. Weakest of the three, and it's half the
   up-versus-down decision.

3. **Does the showroom do anything in Gate A?** It's the most iconic floor and currently has no
   mechanical job — the product isn't sold there, it's just scored. Either it earns a job or it's
   set dressing on the most prominent floor in the game.

4. **Floor one composition — still yours.** Sketched as showroom/desks/bench, which matches what you
   said. Unratified.

5. **Do you buy floors or unlock them?** "Buy the floor above" implies purchase. The subway implies
   permits and negotiation. Probably both, but they're different verbs and different UI.

6. **What happens to a floor mid-quarter?** If you buy B3 during a quarter, do the people move
   instantly? Does construction take ticks and cost capacity? Construction-as-a-cost is more
   interesting and more annoying.

7. **How tall before it stops being readable?** R3 says a mature building is ~16 levels and the
   renderer should hold 32. Fine for Pixi. A skeleton in HTML boxes will get unwieldy well before
   that, so a skeleton is honest for maybe 8–10 floors — enough for Gate B, not for the real game.

---

## What this costs

The skeleton is HTML and CSS. No renderer, no mockups, no dependencies, no art. It replaces three
sliders with a column of boxes.

It is **explicitly throwaway** and must stay behind the `render/` boundary so it cannot bias the
Gate C renderer choice. The moment it wants a sprite, it stops and Gate C starts.
