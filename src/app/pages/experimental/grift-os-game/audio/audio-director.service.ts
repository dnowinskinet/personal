import { isPlatformBrowser } from '@angular/common';
import {
  Inject,
  Injectable,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';

import { GameEvent } from '../game-engine/game-events';
import { EnterprisePresentation } from '../game-engine/presentation';

import {
  audioBusGainsForSettings,
  AudioIntent,
  AudioPolicyState,
  AudioSettings,
  createDefaultAudioSettings,
  createInitialAudioPolicyState,
  reduceAudioEvent,
} from './audio-engine';

import { MUSIC_MANIFEST } from './audio-manifest';

const AUDIO_SETTINGS_STORAGE_KEY = 'grift-os-audio-settings-v1';

type MusicTrackDefinition = (typeof MUSIC_MANIFEST)[number];

type MusicPlaybackState = 'idle' | 'loading' | 'playing' | 'error';

interface BrowserWindowWithAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export interface AudioDirectorDebugState {
  isBrowser: boolean;
  unlocked: boolean;
  audioContextState: string;
  lastIntentId: string;

  enterpriseIntensity: number;
  enterpriseStage: string;

  activeMusicTrackId: string;
  musicPlaybackState: MusicPlaybackState;
  musicPlaybackError: string;
}

@Injectable({
  providedIn: 'root',
})
export class AudioDirectorService implements OnDestroy {
  readonly settings = signal<AudioSettings>(createDefaultAudioSettings());

  readonly debugState = signal<AudioDirectorDebugState>({
    isBrowser: false,
    unlocked: false,
    audioContextState: 'unavailable',
    lastIntentId: 'none',

    enterpriseIntensity: 0,
    enterpriseStage: 'unknown',

    activeMusicTrackId: 'none',
    musicPlaybackState: 'idle',
    musicPlaybackError: '',
  });

  private readonly isBrowser: boolean;

  /*
   * Shared Web Audio graph
   *
   * music source
   *   -> per-track gain
   *   -> musicGain
   *   -> masterGain
   *   -> destination
   *
   * SFX source
   *   -> per-cue gain
   *   -> sfxGain
   *   -> masterGain
   *   -> destination
   */
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  /*
   * Current music playback.
   *
   * This is intentionally one active track for now.
   * It is not a stem system, suite system, or adaptive layer model.
   */
  private activeMusicSource: AudioBufferSourceNode | null = null;
  private activeMusicTrackGain: GainNode | null = null;
  private activeMusicTrackId: string | null = null;

  /*
   * Decoded audio cache.
   *
   * Useful immediately for the prototype music loop and reusable later
   * for short asset-backed SFX.
   */
  private readonly audioBufferCache = new Map<string, AudioBuffer>();

  /*
   * Prevent overlapping async start requests from creating duplicate
   * copies of the same background loop.
   */
  private musicStartPromise: Promise<void> | null = null;

  private musicPlaybackState: MusicPlaybackState = 'idle';
  private musicPlaybackError = '';

  private policyState: AudioPolicyState = createInitialAudioPolicyState();
  private presentation: EnterprisePresentation | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    this.settings.set(this.loadSettings());
    this.refreshDebugState();
  }

  ngOnDestroy(): void {
    this.stopActiveMusic();

    this.audioBufferCache.clear();

    this.musicGain?.disconnect();
    this.sfxGain?.disconnect();
    this.masterGain?.disconnect();

    const context = this.audioContext;

    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    if (context && context.state !== 'closed') {
      void context.close().catch(() => {
        // Audio teardown is non-critical.
      });
    }
  }

  /**
   * Call from a trusted user interaction.
   *
   * This creates/resumes the AudioContext and then attempts to start
   * the configured prototype background track.
   *
   * Muting does not prevent music from starting. Mute is handled at
   * the master bus so playback can continue silently and resume from
   * the current position when unmuted.
   */
  unlockFromTrustedInteraction(): void {
    void this.ensureAudioContextRunning().then((context) => {
      if (!context) {
        return;
      }

      this.ensureBackgroundMusicStarted();
      this.refreshDebugState();
    });
  }

  updatePresentation(presentation: EnterprisePresentation): void {
    this.presentation = presentation;
    this.refreshDebugState();
  }

  updateSettings(settings: AudioSettings): void {
    const normalized: AudioSettings = {
      masterVolume: clamp01(settings.masterVolume),
      musicVolume: clamp01(settings.musicVolume),
      sfxVolume: clamp01(settings.sfxVolume),
      isMuted: settings.isMuted,
      adaptiveMusic: settings.adaptiveMusic,
    };

    this.settings.set(normalized);
    this.persistSettings(normalized);

    this.applyGainSettings();

    /*
     * If audio has already been unlocked but no music is running yet,
     * a settings interaction can safely ensure the configured loop
     * has started.
     *
     * adaptiveMusic intentionally does not gate basic music playback.
     */
    if (this.audioContext?.state === 'running') {
      this.ensureBackgroundMusicStarted();
    }

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

  /**
   * Development-only semantic cue test.
   *
   * Waits for the AudioContext to be running before attempting playback,
   * which avoids losing the first test cue while the context is resuming.
   */
  testCue(id = 'manual-click'): void {
    void this.ensureAudioContextRunning().then((context) => {
      if (!context) {
        return;
      }

      this.ensureBackgroundMusicStarted();

      this.playIntent({
        id,
        category: 'ui',
        priority: 1,
        gain: 0.5,
      });

      this.refreshDebugState(id);
    });
  }

  /**
   * Creates the browser AudioContext and shared gain graph lazily.
   *
   * SSR/prerender remains safe because this method exits before touching
   * window or browser audio APIs outside the browser.
   */
  private getAudioContext(): AudioContext | null {
    if (!this.isBrowser) {
      return null;
    }

    if (this.audioContext) {
      return this.audioContext;
    }

    const AudioContextCtor =
      window.AudioContext ??
      (window as BrowserWindowWithAudio).webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    const context = new AudioContextCtor();

    const masterGain = context.createGain();
    const musicGain = context.createGain();
    const sfxGain = context.createGain();

    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(context.destination);

    this.audioContext = context;
    this.masterGain = masterGain;
    this.musicGain = musicGain;
    this.sfxGain = sfxGain;

    this.applyGainSettings();

    return context;
  }

  /**
   * Resumes the AudioContext from a trusted interaction.
   */
  private async ensureAudioContextRunning(): Promise<AudioContext | null> {
    const context = this.getAudioContext();

    if (!context) {
      this.refreshDebugState();
      return null;
    }

    if (context.state === 'suspended') {
      try {
        await context.resume();
      } catch {
        this.refreshDebugState();
        return null;
      }
    }

    this.refreshDebugState();

    return context.state === 'running' ? context : null;
  }

  /**
   * Current development SFX implementation.
   *
   * Important gain-staging rule:
   *
   * - local GainNode = cue-specific amplitude only
   * - sfxGain = user SFX volume
   * - masterGain = user master volume and mute
   *
   * masterVolume and sfxVolume must not be multiplied into the local
   * cue gain because they are already applied downstream.
   */
  private playIntent(intent: AudioIntent): void {
    if (!this.isBrowser || this.settings().isMuted) {
      return;
    }

    const context = this.getAudioContext();

    if (!context || !this.sfxGain || context.state !== 'running') {
      return;
    }

    const oscillator = context.createOscillator();
    const cueGain = context.createGain();

    oscillator.type = intent.priority >= 5 ? 'triangle' : 'sine';
    oscillator.frequency.value = this.frequencyForIntent(intent);

    cueGain.gain.value = Math.min(
      0.15,
      Math.max(0, intent.gain) * 0.16
    );

    oscillator.connect(cueGain);
    cueGain.connect(this.sfxGain);

    oscillator.onended = () => {
      oscillator.disconnect();
      cueGain.disconnect();
    };

    oscillator.start();

    oscillator.stop(
      context.currentTime + (intent.priority >= 5 ? 0.18 : 0.08)
    );
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

  /**
   * Starts the first configured manifest track that has a src.
   *
   * This is intentionally simple. There is no adaptive selection,
   * stage selection, suite selection, or stem logic yet.
   */
  private ensureBackgroundMusicStarted(): void {
    if (!this.isBrowser) {
      return;
    }

    const track = MUSIC_MANIFEST.find(
      (candidate) => Boolean(candidate.src)
    );

    if (!track?.src) {
      this.musicPlaybackState = 'idle';
      this.musicPlaybackError = '';
      this.refreshDebugState();
      return;
    }

    /*
     * Already playing the configured track.
     */
    if (
      this.activeMusicTrackId === track.id &&
      this.activeMusicSource
    ) {
      return;
    }

    /*
     * A load/start operation is already in flight.
     */
    if (this.musicStartPromise) {
      return;
    }

    this.musicPlaybackState = 'loading';
    this.musicPlaybackError = '';
    this.refreshDebugState();

    const startPromise = this.startMusicTrack(track)
      .then(() => {
        if (this.activeMusicTrackId === track.id) {
          this.musicPlaybackState = 'playing';
          this.musicPlaybackError = '';
        }
      })
      .catch((error: unknown) => {
        this.musicPlaybackState = 'error';
        this.musicPlaybackError = errorMessage(error);

        console.warn(
          `[GriftOS audio] Failed to start music track "${track.id}".`,
          error
        );
      })
      .finally(() => {
        if (this.musicStartPromise === startPromise) {
          this.musicStartPromise = null;
        }

        this.refreshDebugState();
      });

    this.musicStartPromise = startPromise;
  }

  /**
   * Loads and starts one music track.
   *
   * The source is routed:
   *
   * AudioBufferSourceNode
   *   -> per-track GainNode
   *   -> musicGain
   *   -> masterGain
   *   -> destination
   */
  private async startMusicTrack(
    track: MusicTrackDefinition
  ): Promise<void> {
    if (!track.src) {
      return;
    }

    const context = this.getAudioContext();

    if (
      !context ||
      !this.musicGain ||
      context.state !== 'running'
    ) {
      return;
    }

    const buffer = await this.loadAudioBuffer(context, track.src);

    /*
     * Re-check state after async fetch/decode.
     */
    if (
      context !== this.audioContext ||
      context.state !== 'running' ||
      !this.musicGain
    ) {
      return;
    }

    /*
     * Another request may have completed while this asset was loading.
     */
    if (
      this.activeMusicTrackId === track.id &&
      this.activeMusicSource
    ) {
      return;
    }

    this.stopActiveMusic();

    const source = context.createBufferSource();
    const trackGain = context.createGain();

    source.buffer = buffer;
    source.loop = track.loop;

    /*
     * Asset-level mix gain only.
     * User music volume belongs to musicGain.
     */
    trackGain.gain.value = Math.max(0, track.gain);

    source.connect(trackGain);
    trackGain.connect(this.musicGain);

    source.onended = () => {
      /*
       * Only clear runtime state if this exact source is still the
       * active source. This prevents an old onended callback from
       * clearing a newer track.
       */
      if (this.activeMusicSource !== source) {
        return;
      }

      source.disconnect();
      trackGain.disconnect();

      this.activeMusicSource = null;
      this.activeMusicTrackGain = null;
      this.activeMusicTrackId = null;

      this.musicPlaybackState = 'idle';
      this.refreshDebugState();
    };

    /*
     * Set runtime ownership before starting so duplicate start requests
     * can see that this track is active.
     */
    this.activeMusicSource = source;
    this.activeMusicTrackGain = trackGain;
    this.activeMusicTrackId = track.id;

    try {
      source.start();
    } catch (error) {
      source.onended = null;
      source.disconnect();
      trackGain.disconnect();

      this.activeMusicSource = null;
      this.activeMusicTrackGain = null;
      this.activeMusicTrackId = null;

      throw error;
    }

    this.musicPlaybackState = 'playing';
    this.musicPlaybackError = '';
    this.refreshDebugState();
  }

  /**
   * Fetches, decodes, and caches an audio asset.
   */
  private async loadAudioBuffer(
    context: AudioContext,
    src: string
  ): Promise<AudioBuffer> {
    const cached = this.audioBufferCache.get(src);

    if (cached) {
      return cached;
    }

    const response = await fetch(src);

    if (!response.ok) {
      throw new Error(
        `Failed to load audio asset "${src}" ` +
          `(${response.status} ${response.statusText}).`
      );
    }

    const encodedAudio = await response.arrayBuffer();
    const decodedAudio = await context.decodeAudioData(encodedAudio);

    this.audioBufferCache.set(src, decodedAudio);

    return decodedAudio;
  }

  /**
   * Stops and disconnects the currently active music source.
   */
  private stopActiveMusic(): void {
    const source = this.activeMusicSource;
    const trackGain = this.activeMusicTrackGain;

    /*
     * Clear ownership first so an onended callback cannot accidentally
     * clear a later replacement source.
     */
    this.activeMusicSource = null;
    this.activeMusicTrackGain = null;
    this.activeMusicTrackId = null;

    if (source) {
      source.onended = null;

      try {
        source.stop();
      } catch {
        // Source may already have ended or never successfully started.
      }

      source.disconnect();
    }

    trackGain?.disconnect();

    this.musicPlaybackState = 'idle';
  }

  /**
   * Applies user-level volume controls exactly once.
   *
   * - masterGain = master volume + mute
   * - musicGain = music slider
   * - sfxGain = SFX slider
   */
  private applyGainSettings(): void {
    if (!this.masterGain || !this.musicGain || !this.sfxGain) {
      return;
    }

    const gains = audioBusGainsForSettings(this.settings());

    this.masterGain.gain.value = gains.masterGain;
    this.musicGain.gain.value = gains.musicGain;
    this.sfxGain.gain.value = gains.sfxGain;
  }

  private refreshDebugState(
    lastIntentId = this.debugState().lastIntentId
  ): void {
    const presentation = this.presentation;

    this.debugState.set({
      isBrowser: this.isBrowser,

      unlocked: this.audioContext?.state === 'running',

      audioContextState:
        this.audioContext?.state ??
        (this.isBrowser ? 'locked' : 'unavailable'),

      lastIntentId,

      enterpriseIntensity:
        presentation?.enterpriseIntensity ?? 0,

      enterpriseStage:
        presentation?.enterpriseStage ?? 'unknown',

      activeMusicTrackId:
        this.activeMusicTrackId ?? 'none',

      musicPlaybackState:
        this.musicStartPromise && this.musicPlaybackState !== 'playing'
          ? 'loading'
          : this.musicPlaybackState,

      musicPlaybackError: this.musicPlaybackError,
    });
  }

  private loadSettings(): AudioSettings {
    if (!this.isBrowser) {
      return createDefaultAudioSettings();
    }

    try {
      const rawSettings = window.localStorage.getItem(
        AUDIO_SETTINGS_STORAGE_KEY
      );

      if (!rawSettings) {
        return createDefaultAudioSettings();
      }

      return {
        ...createDefaultAudioSettings(),
        ...(JSON.parse(rawSettings) as Partial<AudioSettings>),
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
      window.localStorage.setItem(
        AUDIO_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch {
      /*
       * Audio settings are non-critical.
       * Gameplay remains independent of storage availability.
       */
    }
  }
}

function clamp01(value: number): number {
  return Math.max(
    0,
    Math.min(1, Number.isFinite(value) ? value : 0)
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
