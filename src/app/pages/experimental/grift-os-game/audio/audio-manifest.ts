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

export interface MusicTrackDefinition {
  id: string;
  src?: string;
  loop: boolean;
  gain: number;
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

export const MUSIC_MANIFEST: readonly MusicTrackDefinition[] = [
  {
    id: 'prototype-background',
    src: 'assets/audio/grift-os/music/prototype-background.opus',
    loop: true,
    gain: 0.7,
  },
];
