/**
 * Content registries.
 *
 * Data only. Behaviour lives in `sim/`; this layer supplies instances conforming to the
 * simulation's schema. Adding a quarter, part or goal should be a change here and nowhere else —
 * that is the extension test in ARCHITECTURE.md.
 */

export { Q1, Q1_TIGHT, QUARTERS } from './quarters';
