import { HustleId } from '../../../game-engine/types';

export interface InfluenceHustleVisual {
  viewportImage: string;
}

const assetRoot = '/assets/image/grift-os/influence/hustles';

export const INFLUENCE_HUSTLE_VISUALS: Readonly<Record<HustleId, InfluenceHustleVisual>> = {
  'troll-network': { viewportImage: `${assetRoot}/troll-network/viewport.jpg` },
  'podcast-network': { viewportImage: `${assetRoot}/podcast-network/viewport.jpg` },
  'culture-war-media': { viewportImage: `${assetRoot}/culture-war-media/viewport.jpg` },
  'masterclass-business': { viewportImage: `${assetRoot}/masterclass-business/viewport.jpg` },
  'manifesto-imprint': { viewportImage: `${assetRoot}/manifesto-imprint/viewport.jpg` },
  'founder-retreat-circuit': { viewportImage: `${assetRoot}/founder-retreat-circuit/viewport.jpg` },
  'ai-venture': { viewportImage: `${assetRoot}/ai-venture/viewport.jpg` },
  'venture-portfolio': { viewportImage: `${assetRoot}/venture-portfolio/viewport.jpg` },
  'media-holdings': { viewportImage: `${assetRoot}/media-holdings/viewport.jpg` },
  'sovereign-network': { viewportImage: `${assetRoot}/sovereign-network/viewport.jpg` },
};
