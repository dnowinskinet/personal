import { HustleId } from '../../../game-engine/types';

export interface InfluenceHustleVisual {
  viewportImage: string;
}

const assetRoot = '/assets/image/grift-os/influence/hustles';

export const INFLUENCE_HUSTLE_VISUALS: Readonly<Record<HustleId, InfluenceHustleVisual>> = {
  'online-rage-farm': { viewportImage: `${assetRoot}/troll-network/viewport.jpg` },
  'paid-friend-club': { viewportImage: `${assetRoot}/paid-friend-club/viewport.jpg` },
  'autograph-factory': { viewportImage: `${assetRoot}/autograph-factory/viewport.jpg` },
  'paid-shoutout-studio': { viewportImage: `${assetRoot}/paid-shoutout-studio/viewport.jpg` },
  'outrage-podcast': { viewportImage: `${assetRoot}/masterclass-business/viewport.jpg` },
  'get-rich-books': { viewportImage: `${assetRoot}/get-rich-books/viewport.jpg` },
  'paid-endorsement-racket': { viewportImage: `${assetRoot}/paid-endorsement-racket/viewport.jpg` },
  'vip-experience-tour': { viewportImage: `${assetRoot}/manifesto-imprint/viewport.jpg` },
  'success-university': { viewportImage: `${assetRoot}/founder-retreat-circuit/viewport.jpg` },
  'mlm-ambassador-program': { viewportImage: `${assetRoot}/ai-venture/viewport.jpg` },
  'debt-club': { viewportImage: `${assetRoot}/media-holdings/viewport.jpg` },
  'subscriber-towns': { viewportImage: `${assetRoot}/sovereign-network/viewport.jpg` },
};
