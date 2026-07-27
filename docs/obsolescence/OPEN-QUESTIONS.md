# Obsolescence, Inc. — Open Questions

Questions that are genuinely undecided, with what each one blocks. When one is answered, move it to
[DECISIONS.md](DECISIONS.md) as a numbered entry and delete it here. **IDs are never reused.**

**Resolved so far:** Q-001 and Q-003 → D-011 (repo shape and folder location). Q-002 → D-012
(approved dependencies).

---

## Blocked on an external artifact

### Q-004 — The mockups

**Blocks:** Gate C. Nothing before Gate C depends on them.

R8 and R9 both treat the mockups as composition canon. They are in neither the claude.ai Project nor
the repo. Daniel is retrieving them.

When they arrive, they belong in `docs/obsolescence/research/mockups/` with a note per file
recording viewport size, device target, and intended interaction — R9 asks for exactly that
metadata.

---

## To be resolved by work, not by decision

### Q-005 — How much do R1–R9 actually contradict each other?

**Blocks:** the effort estimate for the research synthesis phase, and every design decision that
inherits from it.

Nine independently written reports will disagree. Known tensions already visible without a full
reconciliation pass:

- **Campaign length.** R6 argues for 18 quarters across 6 chapters. R9 argues for 15 quarters across
  5 chapters and treats 18 as an unproven hypothesis with "very high" cost if wrong. R9 is later but
  self-declared partial, and it was written *without R6 attached*. Unresolved.
- **Foreground generations.** R1 says the last two generations stay foregrounded. R6 says three
  (current, previous, burden). R9 sides with current + previous by default, surfacing the burden
  family only when decision-relevant. Close to reconcilable, but the exact cap drives UI and save
  design.
- **R9's status generally.** Its gate ladder is the backbone of the plan, but every cross-report
  claim in it is unverified because it worked from a summary brief rather than the reports.

This is the R9 rerun, done in-house. An agent that can read all nine reports directly can do the
reconciliation itself; a Deep Research rerun is not needed.

### Q-006 — Does the R9 gate ladder survive rescoping for N=1?

**Blocks:** planning past Gate C.

D-003 replaces the tester-panel pass conditions, but the *ladder* — A through I — has not been
re-derived under the new validation model. Some gates may merge or disappear once "5 of 7 testers"
is replaced by headless sweeps and agent legibility probes.

Do not plan past Gate C in detail until Gates A and B have actually run.

### Q-007 — What does the Obsolescence save-key namespace look like?

**Blocks:** Gate B.

I-011 forbids sharing storage keys with GriftOS, and I-008 requires a schema version and a
content-pack version in every save. The concrete key prefix and record layout have not been
designed. Needs deciding when the persistence layer is built, not before.
