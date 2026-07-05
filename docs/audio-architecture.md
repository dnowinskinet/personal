# GriftOS Audio Architecture

## Goal

Prepare GriftOS for adaptive sound without committing final music or SFX assets.

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
- expose debug state;
- degrade if browser audio is unavailable.

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

Music layers support:

- id;
- optional source;
- loop;
- base gain;
- unlock stage.

Current assets are intentionally absent. The director uses tiny generated debug tones after gesture unlock.

## Event Arbitration

Pure audio policy handles:

- event-to-intent mapping;
- mute;
- cooldown;
- priority suppression;
- adaptive layer gain.

High-priority automation and Rug Pull cues can briefly suppress ordinary purchase/manual noise.

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
- placeholder layer gains.
