# Obsolescence, Inc. — source root

Ratified by [D-011](../../../../docs/obsolescence/DECISIONS.md). Doctrine lives in
[docs/obsolescence/](../../../../docs/obsolescence/) — read `AGENTS.md` there before working here.

## Layers and dependency direction

Dependencies flow one way. `npm run oi:arch` fails the build if they do not.

```
sim  ←  content  ←  presentation
 ↑         ↑      ←  render
 └── persistence
            ↑
        devtools  (may reach everything)
```

| Directory | Owns | May import |
|---|---|---|
| `sim/` | Deterministic simulation kernel | nothing internal |
| `content/` | Validated data registries — products, components, incidents, segments | `sim` |
| `persistence/` | IndexedDB saves, versioned migrations | `sim` |
| `presentation/` | Angular-facing view models | `sim`, `content` |
| `render/` | Replaceable renderer adapter | `sim`, `content` |
| `devtools/` | Scenario loader, seed control, pause/step/speed, state jump | everything |
| `tests/` | Headless Node tests | everything |

Import through the `@oi/*` path aliases rather than long relative paths. The boundary check
resolves both, so switching styles is not a way around a rule.

## Commands

```bash
npm run oi:test
```

That runs everything. The individual pieces:

| Command | What it does |
|---|---|
| `oi:arch` | AST-based boundary check over this tree |
| `oi:arch:test` | Regression suite for the boundary check itself |
| `oi:pure` | Compiles `sim/` with no DOM library and no Node types |
| `oi:sim` | Purity gate, then the headless kernel tests under `node --test` |

Browser and Node globals are **not** checked by `oi:arch`. `oi:pure` makes them compile errors, and
does it with real scope analysis — so a parameter named `document` or `process` is correctly
allowed, which matters in a game about office equipment. See
[INVARIANTS.md](../../../../docs/obsolescence/INVARIANTS.md) for what each command enforces and
where the limits are.

## Status

Phase 3 substrate only. The kernel is deliberately a substrate, not a game — product lineups,
floors, bays, cohorts and incidents arrive with Gate A and Gate B. Nothing here is wired to a route
yet, so the game adds zero weight to the site bundle.
