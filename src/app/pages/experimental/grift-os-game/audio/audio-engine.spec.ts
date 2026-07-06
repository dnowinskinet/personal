import { GameEvent } from '../game-engine/game-events';
import { EnterprisePresentation } from '../game-engine/presentation';
import {
  audioBusGainsForSettings,
  createDefaultAudioSettings,
  createInitialAudioPolicyState,
  gameEventToAudioIntent,
  reduceAudioEvent,
} from './audio-engine';
import { MUSIC_MANIFEST } from './audio-manifest';

describe('GriftOS audio engine policy', () => {
  const presentation: EnterprisePresentation = {
    enterpriseIntensity: 0.6,
    enterpriseStage: 'institutional',
    activeRatio: 0.5,
    automationRatio: 0.4,
    valuationProgress: 0.7,
    leverageProgress: 0.2,
    metaProgress: 0.1,
    valuationPerSecond: 100,
  };

  it('maps semantic game events to audio intents without presentation-specific events', () => {
    const settings = createDefaultAudioSettings();
    const manualEvent: GameEvent = { type: 'hustle.manualActionStarted', hustleId: 'troll-network' };
    const automationEvent: GameEvent = {
      type: 'hustle.automationActivated',
      hustleId: 'troll-network',
      automationName: 'Bots',
    };
    const rugEvent: GameEvent = {
      type: 'rugPull.committed',
      rugPullState: 'committed',
      netWorthGain: 100_000,
    };

    expect(gameEventToAudioIntent(manualEvent, presentation, settings)?.id).toBe('manual-click');
    expect(gameEventToAudioIntent(automationEvent, presentation, settings)?.id).toBe('automation-online');
    expect(gameEventToAudioIntent(rugEvent, presentation, settings)?.id).toBe('rug-pull');
  });

  it('respects mute settings', () => {
    const settings = {
      ...createDefaultAudioSettings(),
      isMuted: true,
    };
    const event: GameEvent = { type: 'purchase.completed', target: 'hustle', hustleId: 'troll-network' };

    expect(gameEventToAudioIntent(event, presentation, settings)).toBeNull();
  });

  it('throttles repeated low-level cues by manifest cooldown', () => {
    const settings = createDefaultAudioSettings();
    const event: GameEvent = { type: 'hustle.manualActionStarted', hustleId: 'troll-network' };
    const first = reduceAudioEvent(createInitialAudioPolicyState(), event, presentation, settings, 1_000);
    const second = reduceAudioEvent(first.state, event, presentation, settings, 1_020);

    expect(first.intent?.id).toBe('manual-click');
    expect(second.intent).toBeNull();
    expect(second.suppressedReason).toBe('cooldown');
  });

  it('lets high-priority cues suppress ordinary noise briefly', () => {
    const settings = createDefaultAudioSettings();
    const automationEvent: GameEvent = {
      type: 'hustle.automationActivated',
      hustleId: 'troll-network',
      automationName: 'Bots',
    };
    const purchaseEvent: GameEvent = { type: 'purchase.completed', target: 'hustle', hustleId: 'troll-network' };
    const automation = reduceAudioEvent(createInitialAudioPolicyState(), automationEvent, presentation, settings, 1_000);
    const purchase = reduceAudioEvent(automation.state, purchaseEvent, presentation, settings, 1_100);

    expect(automation.intent?.priority).toBe(5);
    expect(purchase.intent).toBeNull();
    expect(purchase.suppressedReason).toBe('priority-window');
  });

  it('calculates user-level bus gains without double-applying volume controls', () => {
    const settings = createDefaultAudioSettings();

    expect(audioBusGainsForSettings(settings)).toEqual({
      masterGain: 0.7,
      musicGain: 0.45,
      sfxGain: 0.7,
    });
  });

  it('keeps ordinary music volume independent of the Adaptive checkbox', () => {
    const settings = {
      ...createDefaultAudioSettings(),
      adaptiveMusic: false,
    };

    expect(audioBusGainsForSettings(settings).musicGain).toBe(0.45);
  });

  it('applies mute at the master bus only', () => {
    const gains = audioBusGainsForSettings({
      ...createDefaultAudioSettings(),
      isMuted: true,
    });

    expect(gains).toEqual({
      masterGain: 0,
      musicGain: 0.45,
      sfxGain: 0.7,
    });
  });

  it('uses the Angular assets path for the prototype background track', () => {
    expect(MUSIC_MANIFEST[0].src).toBe('assets/audio/grift-os/music/prototype-background.opus');
  });
});
