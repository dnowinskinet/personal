# render/

Replaceable renderer adapter.

**May import:** `sim`, `content`.

**I-002 — reads state, never mutates it.** The boundary check fails if anything here imports
`applyCommand`, `advanceTick`, `run`, `reset` or `deserialize`. Rendering is a projection; all
state change goes through commands.

The renderer choice is deliberately deferred to Gate C (D-004). `pixi.js` and `phaser` are **not**
approved dependencies and must not be installed before that bake-off starts. Keeping this layer
thin and adapter-shaped is what keeps the choice reversible — acceptance criterion 7.

Empty until Gate C.
