/**
 * Regression suite for the Obsolescence boundary checker.
 *
 * Every case here is a bug that adversarial testing actually found in the first, regex-based
 * version of the checker: nine violations it let through and five pieces of valid code it wrongly
 * rejected. A checker with no tests of its own is an assertion, not an enforcement mechanism.
 *
 * Each case builds a throwaway copy of the feature tree in a temp directory, writes the probe
 * files into it, and runs the real checker with that directory as cwd.
 *
 * Run with: npm run oi:arch:test
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, describe, it } from 'node:test';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECKER = path.join(REPO, 'scripts', 'check-obsolescence-boundaries.mjs');
const FEATURE_RELATIVE = path.join('src', 'app', 'games', 'obsolescence');

let workspace;

before(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), 'oi-boundary-'));
});

after(async () => {
  if (workspace !== undefined) {
    await rm(workspace, { recursive: true, force: true });
  }
});

/**
 * Writes `files` into a fresh copy of the feature tree and runs the checker over it.
 * Returns the exit status and combined output.
 */
async function runChecker(caseName, files) {
  const root = path.join(workspace, caseName.replace(/[^a-z0-9]+/gi, '-'));
  const featureRoot = path.join(root, FEATURE_RELATIVE);

  await rm(root, { recursive: true, force: true });
  await mkdir(path.dirname(featureRoot), { recursive: true });
  await cp(path.join(REPO, FEATURE_RELATIVE), featureRoot, { recursive: true });

  for (const [relative, contents] of Object.entries(files)) {
    const target = path.join(featureRoot, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents, 'utf8');
  }

  const result = spawnSync(process.execPath, [CHECKER], { cwd: root, encoding: 'utf8' });
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

/** Asserts the checker rejects the probe, and that it says why in recognisable terms. */
async function expectViolation(name, files, expectedPhrase) {
  const { code, output } = await runChecker(name, files);
  assert.equal(code, 1, `expected a violation for "${name}" but the checker passed:\n${output}`);
  assert.match(output, expectedPhrase, `violation message did not mention the expected cause:\n${output}`);
}

/** Asserts the checker accepts legitimate code. */
async function expectClean(name, files) {
  const { code, output } = await runChecker(name, files);
  assert.equal(code, 0, `expected "${name}" to pass but the checker flagged it:\n${output}`);
}

describe('baseline', () => {
  it('passes on the unmodified feature tree', async () => {
    await expectClean('baseline', {});
  });

  it('fails closed when sim/ is empty rather than passing vacuously', async () => {
    const root = path.join(workspace, 'empty-sim');
    await rm(root, { recursive: true, force: true });
    await mkdir(path.join(root, FEATURE_RELATIVE, 'content'), { recursive: true });
    await writeFile(path.join(root, FEATURE_RELATIVE, 'content', 'a.ts'), 'export const a = 1;\n', 'utf8');

    const result = spawnSync(process.execPath, [CHECKER], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(`${result.stdout}${result.stderr}`, /no source files found in sim/);
  });
});

describe('I-001 — sim import allowlist closes the denylist gap', () => {
  it('rejects a scoped renderer package the old denylist missed', async () => {
    await expectViolation(
      'pixi-scoped',
      { 'sim/probe.ts': `import { Application } from '@pixi/app';\nexport const a = Application;\n` },
      /may not import the external package "@pixi\/app"/
    );
  });

  it('rejects an arbitrary package never named in any denylist', async () => {
    await expectViolation(
      'three',
      { 'sim/probe.ts': `import { Scene } from 'three';\nexport const s = Scene;\n` },
      /may not import the external package "three"/
    );
  });

  it('rejects Angular and a Node subpath form', async () => {
    await expectViolation(
      'angular',
      { 'sim/probe.ts': `import { Injectable } from '@angular/core';\nexport const i = Injectable;\n` },
      /may not import the external package "@angular\/core"/
    );
    await expectViolation(
      'fs-subpath',
      { 'sim/probe.ts': `import { readFile } from 'fs/promises';\nexport const r = readFile;\n` },
      /may not import the external package "fs\/promises"/
    );
  });

  it('rejects a backtick specifier in a dynamic import', async () => {
    await expectViolation(
      'backtick-import',
      { 'sim/probe.ts': 'export async function load() {\n  return await import(`node:fs/promises`);\n}\n' },
      /may not import the external package "node:fs\/promises"/
    );
  });

  it('rejects a backtick specifier in require', async () => {
    await expectViolation(
      'backtick-require',
      { 'sim/probe.ts': 'export function load() {\n  return require(`node:fs`);\n}\n' },
      /may not import the external package "node:fs"/
    );
  });
});

describe('I-003 — layer direction survives path trickery', () => {
  it('rejects the walk-out-and-back-in escape that defeated the string-based resolver', async () => {
    await expectViolation(
      'escape-sim-content',
      {
        'content/registry.ts': 'export const findProduct = () => null;\n',
        'sim/probe.ts': `import { findProduct } from '../../obsolescence/content/registry';\nexport const f = findProduct;\n`,
      },
      /sim\/ may not import content\//
    );
  });

  it('rejects the same escape between other layer pairs', async () => {
    await expectViolation(
      'escape-render-persistence',
      {
        'persistence/save.ts': 'export const SAVE_SLOT_KEY = "oi:slot";\n',
        'render/probe.ts': `import { SAVE_SLOT_KEY } from '../../obsolescence/persistence/save';\nexport const k = SAVE_SLOT_KEY;\n`,
      },
      /render\/ may not import persistence\//
    );
  });

  it('rejects the direct and aliased forms too', async () => {
    await expectViolation(
      'direct-sim-content',
      {
        'content/registry.ts': 'export const findProduct = () => null;\n',
        'sim/probe.ts': `import { findProduct } from '../content/registry';\nexport const f = findProduct;\n`,
      },
      /sim\/ may not import content\//
    );
    await expectViolation(
      'alias-sim-content',
      {
        'content/registry.ts': 'export const findProduct = () => null;\n',
        'sim/probe.ts': `import { findProduct } from '@oi/content/registry';\nexport const f = findProduct;\n`,
      },
      /sim\/ may not import content\//
    );
  });

  it('allows legal directions', async () => {
    await expectClean('legal-content-sim', {
      'content/registry.ts': `import { TICK_HZ } from '../sim/clock';\nexport const hz = TICK_HZ;\n`,
    });
    await expectClean('legal-devtools-persistence', {
      'persistence/save.ts': 'export const SAVE_SLOT_KEY = "oi:slot";\n',
      'devtools/probe.ts': `import { SAVE_SLOT_KEY } from '../persistence/save';\nexport const k = SAVE_SLOT_KEY;\n`,
    });
  });
});

describe('I-002 — renderer read-only covers indirect forms', () => {
  it('rejects a direct named import of a mutating export', async () => {
    await expectViolation(
      'render-named',
      { 'render/probe.ts': `import { applyCommand } from '../sim/index';\nexport const a = applyCommand;\n` },
      /render\/ imports "applyCommand" from sim/
    );
  });

  it('rejects a namespace import used to reach a mutating export', async () => {
    await expectViolation(
      'render-namespace',
      {
        'render/probe.ts':
          `import * as sim from '../sim/index';\nexport const go = (s, c) => sim.applyCommand(s, c);\n`,
      },
      /calls sim\.applyCommand from a namespace import/
    );
  });

  it('rejects a destructured dynamic import', async () => {
    await expectViolation(
      'render-dynamic',
      {
        'render/probe.ts':
          `export async function go(s, c) {\n  const { applyCommand } = await import('../sim/index');\n  return applyCommand(s, c);\n}\n`,
      },
      /render\/ imports "applyCommand" from sim/
    );
  });

  it('rejects the walk-out escape used to reach a mutating export', async () => {
    await expectViolation(
      'render-escape',
      {
        'render/probe.ts':
          `import { applyCommand } from '../../obsolescence/sim/index';\nexport const a = applyCommand;\n`,
      },
      /render\/ imports "applyCommand" from sim/
    );
  });

  it('rejects laundering a mutating export through content/', async () => {
    await expectViolation(
      'content-laundering',
      { 'content/bridge.ts': `export { applyCommand } from '../sim/index';\n` },
      /content\/ re-exports "applyCommand" from sim/
    );
  });

  it('allows the renderer to read', async () => {
    await expectClean('render-read', {
      'render/probe.ts':
        `import { findEntity, orderedEntities, type SimState } from '../sim/index';\n` +
        `export const read = (s: SimState) => orderedEntities(s).length + (findEntity(s, 'a') ? 1 : 0);\n`,
    });
  });
});

/**
 * The facility subsystem's mutators were absent from the checker's list for four commits while
 * I-002 was still advertised as `ENFORCED`. These cases exist so that regression cannot recur
 * silently, and so that the deeper specifier (`sim/facility/facility`, which `sim/index` does not
 * re-export) is proven to resolve to the `sim` layer like any other.
 */
describe('I-002 — renderer read-only covers the facility mutators', () => {
  it('rejects a named import of tickFacility from its own module', async () => {
    await expectViolation(
      'render-tick-facility',
      {
        'render/probe.ts':
          `import { tickFacility } from '../sim/facility/facility';\nexport const a = tickFacility;\n`,
      },
      /render\/ imports "tickFacility" from sim/
    );
  });

  it('rejects a named import of applyConstruction', async () => {
    await expectViolation(
      'render-apply-construction',
      {
        'render/probe.ts':
          `import { applyConstruction } from '../sim/facility/facility';\nexport const a = applyConstruction;\n`,
      },
      /render\/ imports "applyConstruction" from sim/
    );
  });

  it('rejects a named import of createFacility', async () => {
    await expectViolation(
      'render-create-facility',
      {
        'render/probe.ts':
          `import { createFacility } from '../sim/facility/facility';\nexport const a = createFacility;\n`,
      },
      /render\/ imports "createFacility" from sim/
    );
  });

  it('rejects a namespace import used to advance the facility', async () => {
    await expectViolation(
      'render-facility-namespace',
      {
        'render/probe.ts':
          `import * as facility from '../sim/facility/facility';\n` +
          `export const go = (s) => facility.tickFacility(s);\n`,
      },
      /calls facility\.tickFacility from a namespace import/
    );
  });

  it('rejects the walk-out escape used to reach a facility mutator', async () => {
    await expectViolation(
      'render-facility-escape',
      {
        'render/probe.ts':
          `import { applyConstruction } from '../../obsolescence/sim/facility/facility';\n` +
          `export const a = applyConstruction;\n`,
      },
      /render\/ imports "applyConstruction" from sim/
    );
  });

  it('rejects laundering a facility mutator through content/', async () => {
    await expectViolation(
      'content-facility-laundering',
      { 'content/bridge.ts': `export { tickFacility } from '../sim/facility/facility';\n` },
      /content\/ re-exports "tickFacility" from sim/
    );
  });

  it('allows the renderer to read facility state', async () => {
    await expectClean('render-facility-read', {
      'render/probe.ts':
        `import { timeShares, type FacilityState } from '../sim/facility/facility';\n` +
        `export const read = (s: FacilityState) => timeShares(s);\n`,
    });
  });
});

describe('I-006 — determinism sources including aliased forms', () => {
  it('rejects direct nondeterminism', async () => {
    await expectViolation(
      'math-random',
      { 'sim/probe.ts': 'export const r = () => Math.random();\n' },
      /uses Math\.random/
    );
    await expectViolation(
      'date-now',
      { 'sim/probe.ts': 'export const t = () => Date.now();\n' },
      /uses Date\.now/
    );
    await expectViolation(
      'new-date',
      { 'sim/probe.ts': 'export const d = () => new Date();\n' },
      /constructs a Date/
    );
  });

  it('rejects destructured nondeterminism', async () => {
    await expectViolation(
      'destructured-random',
      { 'sim/probe.ts': 'const { random } = Math;\nexport const r = () => random();\n' },
      /destructures Math\.random/
    );
  });

  it('rejects globalThis', async () => {
    await expectViolation(
      'global-this',
      { 'sim/probe.ts': 'export const g = () => globalThis;\n' },
      /references globalThis/
    );
  });

  it('allows legitimate Math usage', async () => {
    await expectClean('math-ok', {
      'sim/probe.ts': 'export const a = Math.floor(1.5) + Math.imul(2, 3) + Math.ceil(0.2);\n',
    });
  });
});

describe('I-011 — GriftOS isolation', () => {
  it('rejects an import of GriftOS', async () => {
    await expectViolation(
      'griftos-import',
      {
        'presentation/probe.ts':
          `import { thing } from '../../../pages/experimental/grift-os-game/runtime/x';\nexport const t = thing;\n`,
      },
      /imports GriftOS/
    );
  });

  it('rejects a GriftOS save key, including as a template literal', async () => {
    await expectViolation(
      'griftos-key',
      { 'persistence/probe.ts': `export const KEY = 'grift-os-run-v2';\n` },
      /references a GriftOS identifier or save key/
    );
    await expectViolation(
      'griftos-key-template',
      { 'persistence/probe.ts': 'export const KEY = `grift-os:save`;\n' },
      /references a GriftOS identifier or save key/
    );
  });

  it('allows an Obsolescence-prefixed key', async () => {
    await expectClean('oi-key', { 'persistence/probe.ts': `export const KEY = 'oi:run-v1';\n` });
  });
});

describe('unregulated surfaces', () => {
  it('rejects a file in a directory outside every known layer', async () => {
    await expectViolation(
      'unclassified',
      { 'core/env.ts': 'export const nowMs = () => 1;\n' },
      /sits outside every known layer/
    );
  });

  it('scans non-.ts source extensions', async () => {
    await expectViolation(
      'mjs-extension',
      { 'sim/shim.mjs': 'export const rand = () => Math.random();\n' },
      /uses Math\.random/
    );
  });
});

describe('over-firing controls — valid code must pass', () => {
  it('allows domain nouns that collide with browser and Node globals', async () => {
    // These are the false positives that made the regex version unusable for this game
    // specifically: it is about office equipment, paperwork and business processes.
    await expectClean('domain-nouns', {
      'sim/floorplan.ts':
        'export interface FloorLocation { floor: number; bay: number; }\n' +
        'export function formatLocation(location: FloorLocation): string {\n' +
        '  return `${location.floor}/${location.bay}`;\n' +
        '}\n' +
        'export interface PaperDocument { pages: number; }\n' +
        'export function pageCount(document: PaperDocument): number {\n' +
        '  return document.pages;\n' +
        '}\n' +
        'export interface BusinessProcess { steps: number[]; }\n' +
        'export function totalSteps(process: BusinessProcess): number {\n' +
        '  return process.steps.length;\n' +
        '}\n',
    });
  });

  it('does not misattribute a same-named import from another module', async () => {
    await expectClean('reset-from-camera', {
      'render/camera.ts': 'export const reset = () => 0;\nexport const pan = () => 1;\n',
      'render/probe.ts':
        `import { type SimState } from '../sim/index';\n` +
        `import { reset, pan } from './camera';\n` +
        `export const use = (s: SimState) => reset() + pan() + (s ? 0 : 1);\n`,
    });
  });

  it('does not read apostrophes in comments as string literals', async () => {
    await expectClean('apostrophes', {
      'persistence/save-keys.ts':
        '/**\n' +
        " * Don't ever read or write the other game's keys from here, and don't let\n" +
        ' * anything in this file reference them.\n' +
        ' */\n' +
        `export const KEY = 'oi:save';\n`,
    });
  });

  it('is not confused by regex literals containing quotes and slashes', async () => {
    await expectClean('regex-literal', {
      'sim/parse.ts':
        "const NAME_RE = /^[A-Za-z' -]+$/;\n" +
        'const PATH_RE = /a\\/\\/b/;\n' +
        'export const ok = (s: string) => NAME_RE.test(s) && PATH_RE.test(s);\n',
    });
  });

  it('does not fire on prose mentioning forbidden constructs', async () => {
    await expectClean('prose', {
      'sim/notes.ts':
        '// Historically this pulled operators from rxjs; do not reintroduce.\n' +
        '/** Never call Math.random here — use randomAt(seed, cursor). */\n' +
        'export const note = 1;\n',
    });
  });
});
