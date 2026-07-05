import { EnterpriseStage } from '../game-engine/presentation';

export type SfxCategory = 'ui' | 'reward' | 'automation' | 'prestige';

export interface SfxDefinition {
  id: string;
  src?: string;
  category: SfxCategory;
  variations?: readonly string[];
  cooldownMs?: number;
  maxInstances?: number;
  priority?: number;
}

export interface MusicLayerDefinition {
  id: string;
  src?: string;
  loop: boolean;
  baseGain: number;
  unlockStage?: EnterpriseStage;
}

export const SFX_MANIFEST: readonly SfxDefinition[] = [
  {
    id: 'manual-click',
    category: 'ui',
    cooldownMs: 90,
    maxInstances: 2,
    priority: 1,
  },
  {
    id: 'purchase',
    category: 'reward',
    cooldownMs: 160,
    maxInstances: 2,
    priority: 2,
  },
  {
    id: 'milestone',
    category: 'reward',
    cooldownMs: 400,
    maxInstances: 1,
    priority: 4,
  },
  {
    id: 'automation-online',
    category: 'automation',
    cooldownMs: 600,
    maxInstances: 1,
    priority: 5,
  },
  {
    id: 'rug-pull',
    category: 'prestige',
    cooldownMs: 1500,
    maxInstances: 1,
    priority: 10,
  },
];

export const MUSIC_LAYER_MANIFEST: readonly MusicLayerDefinition[] = [
  {
    id: 'base',
    loop: true,
    baseGain: 0.4,
  },
  {
    id: 'intensity',
    loop: true,
    baseGain: 0.25,
    unlockStage: 'traction',
  },
];
