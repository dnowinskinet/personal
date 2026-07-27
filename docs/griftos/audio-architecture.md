# GriftOS Audio Architecture

## Goal

Prepare GriftOS for sound without committing the final adaptive music or SFX asset strategy.

The game must remain playable without sound.

## Boundaries

Components emit semantic game events:

```text
hustle.manualActionStarted
hustle.expanded
hustle.automationActivated
hustle.milestoneReached
rugPull.committed
```

Components do not call `playSound()`.

Audio code lives under:

```text
src/app/pages/experimental/grift-os-game/audio/
```

## Files

```text
audio-manifest.ts
audio-engine.ts
audio-engine.spec.ts
audio-director.service.ts
```

## Audio Director

`AudioDirectorService` is Angular-provided and SSR-safe.

Responsibilities:

- load persisted audio settings;
- wait for trusted user interaction;
- create one `AudioContext` only in the browser;
- interpret semantic events;
- apply mute and volume settings;
- run one optional prototype background loop;
- expose debug state;
- degrade if browser audio is unavailable.

Current Web Audio routing:

```text
music source -> per-track gain -> musicGain -> masterGain -> destination
SFX source   -> per-cue gain   -> sfxGain   -> masterGain -> destination
```

`musicGain` is controlled only by the Music slider. `sfxGain` is controlled only by the SFX slider. `masterGain` is controlled by the Master slider and mute.

## Settings

Persisted local settings:

```ts
interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  adaptiveMusic: boolean;
}
```

## Manifest

SFX definitions support:

- category;
- cooldown;
- max instances;
- priority;
- optional future asset paths.

Music tracks support:

- id;
- optional source;
- loop;
- asset-level gain.

The temporary prototype background loop, when present, should live at:

```text
src/assets/audio/grift-os/music/prototype-background.wav
```

and is referenced at runtime as:

```text
assets/audio/grift-os/music/prototype-background.wav
```

The director uses tiny generated debug tones for SFX after gesture unlock. Gameplay remains playable if the prototype music asset is missing or fails to decode.

## Event Arbitration

Pure audio policy handles:

- event-to-intent mapping;
- mute;
- cooldown;
- priority suppression.

High-priority automation and Rug Pull cues can briefly suppress ordinary purchase/manual noise.

`adaptiveMusic` remains a persisted setting for compatibility and future design work. It does not currently gate ordinary prototype background playback.

## Enterprise Intensity

Audio consumes the same `EnterprisePresentation` object used by visuals:

```text
enterpriseIntensity
enterpriseStage
```

Do not create a separate audio-only intensity formula without a documented decision.

## Playtest Debug

The `?playtest=1` menu exposes:

- AudioContext state;
- mute;
- adaptive toggle;
- master/music/SFX volumes;
- test cue;
- current intensity/stage;
- active prototype track id;
- playback state.
