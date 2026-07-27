/**
 * Content registries.
 *
 * Data only. Behaviour lives in `sim/`; this layer supplies instances conforming to the
 * simulation's schema. Adding a component, defect, supplier or segment should be a change here and
 * nowhere else — that is the extension test in ARCHITECTURE.md.
 */

export { LARK_PACK, LARK_SEGMENTS, LARK_VARIANTS } from './lark';
export { DEFAULT_DECISIONS, DOCTRINES, type Doctrine, type DoctrineName } from './doctrines';
