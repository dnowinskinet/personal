import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { GameEvent } from '../game-engine/game-events';
import { EnterprisePresentation } from '../game-engine/presentation';
import {
  AudioIntent,
  AudioPolicyState,
  AudioSettings,
  createDefaultAudioSettings,
  createInitialAudioPolicyState,
  musicLayerGainForIntensity,
  reduceAudioEvent,
} from './audio-engine';

const AUDIO_SETTINGS_STORAGE_KEY = 'grift-os-audio-settings-v1';

interface BrowserWindowWithAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export interface AudioDirectorDebugState {
  isBrowser: boolean;
  unlocked: boolean;
  audioContextState: string;
  lastIntentId: string;
  currentMusicSuite: string;
  baseLayerGain: number;
  intensityLayerGain: number;
}

@Injectable({
  providedIn: 'root',
})
export class AudioDirectorService {
  readonly settings = signal<AudioSettings>(createDefaultAudioSettings());
  readonly debugState = signal<AudioDirectorDebugState>({
    isBrowser: false,
    unlocked: false,
    audioContextState: 'unavailable',
    lastIntentId: 'none',
    currentMusicSuite: 'placeholder',
    baseLayerGain: 0,
    intensityLayerGain: 0,
  });

  private readonly isBrowser: boolean;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private policyState: AudioPolicyState = createInitialAudioPolicyState();
  private presentation: EnterprisePresentation | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.settings.set(this.loadSettings());
    this.refreshDebugState();
  }

  unlockFromTrustedInteraction(): void {
    if (!this.isBrowser || this.settings().isMuted) {
      return;
    }

    const context = this.getAudioContext();

    if (!context) {
      return;
    }

    if (context.state === 'suspended') {
      void context.resume().then(() => this.refreshDebugState());
    } else {
      this.refreshDebugState();
    }
  }

  updatePresentation(presentation: EnterprisePresentation): void {
    this.presentation = presentation;
    this.refreshDebugState();
  }

  updateSettings(settings: AudioSettings): void {
    const normalized = {
      masterVolume: clamp01(settings.masterVolume),
      musicVolume: clamp01(settings.musicVolume),
      sfxVolume: clamp01(settings.sfxVolume),
      isMuted: settings.isMuted,
      adaptiveMusic: settings.adaptiveMusic,
    };

    this.settings.set(normalized);
    this.persistSettings(normalized);
    this.applyGainSettings();
    this.refreshDebugState();
  }

  handleGameEvent(event: GameEvent, nowMs = Date.now()): void {
    if (!this.presentation) {
      return;
    }

    const result = reduceAudioEvent(
      this.policyState,
      event,
      this.presentation,
      this.settings(),
      nowMs
    );
    this.policyState = result.state;

    if (result.intent) {
      this.playIntent(result.intent);
      this.refreshDebugState(result.intent.id);
    }
  }

  testCue(id = 'manual-click'): void {
    this.unlockFromTrustedInteraction();
    this.playIntent({
      id,
      category: 'ui',
      priority: 1,
      gain: 0.5,
    });
    this.refreshDebugState(id);
  }

  private getAudioContext(): AudioContext | null {
    if (!this.isBrowser) {
      return null;
    }

    if (this.audioContext) {
      return this.audioContext;
    }

    const AudioContextCtor = window.AudioContext ?? (window as BrowserWindowWithAudio).webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    this.audioContext = new AudioContextCtor();
    this.masterGain = this.audioContext.createGain();
    this.sfxGain = this.audioContext.createGain();
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
    this.applyGainSettings();

    return this.audioContext;
  }

  private playIntent(intent: AudioIntent): void {
    if (!this.isBrowser || this.settings().isMuted) {
      return;
    }

    const context = this.getAudioContext();

    if (!context || !this.sfxGain || context.state !== 'running') {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = intent.priority >= 5 ? 'triangle' : 'sine';
    oscillator.frequency.value = this.frequencyForIntent(intent);
    gain.gain.value = Math.min(0.15, intent.gain * this.settings().sfxVolume * this.settings().masterVolume * 0.16);
    oscillator.connect(gain);
    gain.connect(this.sfxGain);
    oscillator.start();
    oscillator.stop(context.currentTime + (intent.priority >= 5 ? 0.18 : 0.08));
  }

  private frequencyForIntent(intent: AudioIntent): number {
    switch (intent.id) {
      case 'automation-online':
        return 330;
      case 'milestone':
        return 440;
      case 'rug-pull':
        return 165;
      case 'purchase':
        return 262;
      default:
        return 220;
    }
  }

  private applyGainSettings(): void {
    if (!this.masterGain || !this.sfxGain) {
      return;
    }

    const settings = this.settings();
    this.masterGain.gain.value = settings.isMuted ? 0 : settings.masterVolume;
    this.sfxGain.gain.value = settings.sfxVolume;
  }

  private refreshDebugState(lastIntentId = this.debugState().lastIntentId): void {
    const presentation = this.presentation;
    const settings = this.settings();

    this.debugState.set({
      isBrowser: this.isBrowser,
      unlocked: this.audioContext?.state === 'running',
      audioContextState: this.audioContext?.state ?? (this.isBrowser ? 'locked' : 'unavailable'),
      lastIntentId,
      currentMusicSuite: 'placeholder',
      baseLayerGain: presentation
        ? musicLayerGainForIntensity('base', presentation.enterpriseIntensity, settings)
        : 0,
      intensityLayerGain: presentation
        ? musicLayerGainForIntensity('intensity', presentation.enterpriseIntensity, settings)
        : 0,
    });
  }

  private loadSettings(): AudioSettings {
    if (!this.isBrowser) {
      return createDefaultAudioSettings();
    }

    try {
      const rawSettings = window.localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);

      if (!rawSettings) {
        return createDefaultAudioSettings();
      }

      return {
        ...createDefaultAudioSettings(),
        ...JSON.parse(rawSettings) as Partial<AudioSettings>,
      };
    } catch {
      return createDefaultAudioSettings();
    }
  }

  private persistSettings(settings: AudioSettings): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      window.localStorage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Audio settings are non-critical; keep gameplay independent of storage availability.
    }
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
