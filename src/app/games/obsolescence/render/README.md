# render/

Replaceable renderer adapter.

**May import:** `sim`, `content`.

**I-002 — reads state, never mutates it.** The boundary check fails if anything here imports a
state-mutating simulation export, in named, namespace, dynamic-import or walk-out form. The
authoritative list is `STATE_MUTATING_EXPORTS` in `scripts/check-obsolescence-boundaries.mjs`;
it currently covers `applyCommand`, `advanceTick`, `run`, `reset`, `deserialize`,
`createInitialState`, `verifyReplay`, and the facility mutators `createFacility`, `tickFacility`
and `applyConstruction`. Do not restate that list anywhere else — **read it from the script**, which
is the copy the check actually enforces. D-034 requires every new state-advancing export to join it
in the same change that introduces it. Rendering is a projection; all state change goes through the
simulation.

The renderer choice is deferred to Gate C (D-004). Per **D-033**, Phaser 4 is the provisional pick
and PixiJS 8.x the named fallback — reversing R8's original ordering. `phaser@4.2.1` is
conditionally pre-approved at that exact version but is **not installed**, and must not be installed
before Gate C actually opens. Gate C opens only after Gates A and B pass; Gate B has not been
briefed. Keeping this layer thin and adapter-shaped is what keeps the choice reversible —
acceptance criterion 7.

See [gates/C-renderer-foundation.brief.md](../../../../../docs/obsolescence/gates/C-renderer-foundation.brief.md)
for what this layer is eventually required to prove.

Empty until Gate C.
