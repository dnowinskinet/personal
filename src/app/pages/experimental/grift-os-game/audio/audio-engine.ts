import { GameEvent } from '../game-engine/game-events';
import { EnterprisePresentation } from '../game-engine/presentation';
import { SFX_MANIFEST, SfxDefinition } from './audio-manifest';

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  adaptiveMusic: boolean;
}

export interface AudioIntent {
  id: string;
  category: SfxDefinition['category'];
  priority: number;
  gain: number;
}

export interface AudioPolicyState {
  lastPlayedAt: Record<string, number>;
  suppressedUntilMs: number;
}

export interface AudioPolicyResult {
  state: AudioPolicyState;
  intent: AudioIntent | null;
  suppressedReason?: 'muted' | 'cooldown' | 'priority-window' | 'unmapped';
}

export interface AudioBusGains {
  masterGain: number;
  musicGain: number;
  sfxGain: number;
}

export function createDefaultAudioSettings(): AudioSettings {
  return {
    masterVolume: 0.7,
    musicVolume: 0.45,
    sfxVolume: 0.7,
    isMuted: false,
    adaptiveMusic: true,
  };
}

export function createInitialAudioPolicyState(): AudioPolicyState {
  return {
    lastPlayedAt: {},
    suppressedUntilMs: 0,
  };
}

export function audioBusGainsForSettings(settings: AudioSettings): AudioBusGains {
  return {
    masterGain: settings.isMuted ? 0 : clamp01(settings.masterVolume),
    musicGain: clamp01(settings.musicVolume),
    sfxGain: clamp01(settings.sfxVolume),
  };
}

export function gameEventToAudioIntent(
  event: GameEvent,
  presentation: EnterprisePresentation,
  settings: AudioSettings
): AudioIntent | null {
  if (settings.isMuted || settings.masterVolume <= 0 || settings.sfxVolume <= 0) {
    return null;
  }

  const intensityGain = 0.55 + presentation.enterpriseIntensity * 0.45;

  switch (event.type) {
    case 'hustle.manualActionStarted':
      return createIntent('manual-click', intensityGain * 0.45);
    case 'purchase.completed':
    case 'hustle.expanded':
    case 'hustle.acquired':
      return createIntent('purchase', intensityGain * 0.65);
    case 'hustle.milestoneReached':
      return createIntent('milestone', intensityGain * 0.85);
    case 'hustle.automationActivated':
      return createIntent('automation-online', intensityGain);
    case 'rugPull.committed':
    case 'rugPull.completed':
      return createIntent('rug-pull', 1);
    default:
      return null;
  }
}

export function reduceAudioEvent(
  policyState: AudioPolicyState,
  event: GameEvent,
  presentation: EnterprisePresentation,
  settings: AudioSettings,
  nowMs: number
): AudioPolicyResult {
  const intent = gameEventToAudioIntent(event, presentation, settings);

  if (!intent) {
    return {
      state: policyState,
      intent: null,
      suppressedReason: settings.isMuted ? 'muted' : 'unmapped',
    };
  }

  const definition = SFX_MANIFEST.find((candidate) => candidate.id === intent.id);
  const cooldownMs = definition?.cooldownMs ?? 0;
  const lastPlayedAt = policyState.lastPlayedAt[intent.id] ?? Number.NEGATIVE_INFINITY;

  if (nowMs - lastPlayedAt < cooldownMs) {
    return {
      state: policyState,
      intent: null,
      suppressedReason: 'cooldown',
    };
  }

  if (nowMs < policyState.suppressedUntilMs && intent.priority < 4) {
    return {
      state: policyState,
      intent: null,
      suppressedReason: 'priority-window',
    };
  }

  return {
    state: {
      lastPlayedAt: {
        ...policyState.lastPlayedAt,
        [intent.id]: nowMs,
      },
      suppressedUntilMs: intent.priority >= 5 ? nowMs + 250 : policyState.suppressedUntilMs,
    },
    intent,
  };
}

function createIntent(id: string, gain: number): AudioIntent | null {
  const definition = SFX_MANIFEST.find((candidate) => candidate.id === id);

  if (!definition) {
    return null;
  }

  return {
    id,
    category: definition.category,
    priority: definition.priority ?? 1,
    gain,
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
