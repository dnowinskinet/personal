/** Public API of the facility substrate. Import from `@oi/sim` rather than reaching in here. */

export * from './grid';
export * from './rooms';
export * from './staff';
export * from './jobs';
export * from './needs';
export * from './explain';
export {
  DEFAULT_TRAVEL_COSTS,
  buildTopology,
  estimateTravel,
  findPath,
  invalidate,
  isReachableLevel,
  isStale,
  type Path,
  type PathFailure,
  type Topology,
  type TravelCosts,
} from './topology';
export {
  applyConstruction,
  createFacility,
  tickFacility,
  timeShares,
  type FacilityConfig,
  type FacilityOutput,
  type FacilityState,
  type TimeShares,
} from './facility';
