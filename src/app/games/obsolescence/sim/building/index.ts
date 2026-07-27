/** Public API of the building domain. Import from `@oi/sim` rather than reaching in here. */

export * from './types';
export {
  buyFloor,
  deriveAllocation,
  floorViews,
  idleStaff,
  isOwned,
  placeStaff,
  purchaseBlocker,
  staffOn,
  startBuilding,
  totalStaffPlaced,
} from './building';
export {
  bookQuarter,
  floorsOwned,
  spend,
  startCampaign,
  type CampaignStart,
  type CampaignState,
  type QuarterRecord,
} from './campaign';
