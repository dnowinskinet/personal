/** Public API of the lineup domain. Import from `@oi/sim` rather than reaching in here. */

export * from './types';
export {
  buildLineup,
  buildOffer,
  claimReachBonus,
  supplierCostMultiplier,
  tierCostMultiplier,
  tierEngineeringMultiplier,
} from './offers';
export { computeCapacity, launchInventory, serviceReserve, testCoverage } from './capacity';
export { attachRate, resolveSegment } from './demand';
export { resolveQuarter } from './resolve';
