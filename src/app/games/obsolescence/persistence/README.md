# persistence/

IndexedDB saves via `idb`, versioned migrations, export/import.

**May import:** `sim` only.

Rules that already apply (see [INVARIANTS.md](../../../../../docs/obsolescence/INVARIANTS.md)):

- I-007 — saves reference stable entity IDs, never positional indices.
- I-008 — every save carries a schema version and a content-pack version, and every migration ships
  with a fixture.
- I-009 — saves are local-only. No accounts, no cloud sync.
- I-011 — no storage key may collide with GriftOS. `oi:` prefix; the boundary check fails on any
  GriftOS identifier appearing in a string literal.

Empty until Gate B. `idb` and `fake-indexeddb` are approved (D-012) but not yet installed — they
arrive with the code that uses them.
