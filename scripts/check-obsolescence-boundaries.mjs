/**
 * Obsolescence, Inc. architecture boundary check.
 *
 * Executable enforcement for docs/obsolescence/INVARIANTS.md. Run via `npm run oi:arch`, and as
 * part of `npm run oi:test`.
 *
 * ## Why this parses a real AST
 *
 * The first version of this script scanned source text with regular expressions. Adversarial
 * testing found nine ways through it and five ways to make it fire on valid code — a hand-rolled
 * comment stripper mishandled regex literals and apostrophes, `import()` with a backtick specifier
 * was invisible, and a `../../obsolescence/content/x` walk-out defeated every layer rule at once.
 *
 * TypeScript is already a devDependency, so this now parses each file with `ts.createSourceFile`
 * and inspects nodes. That removes tokenizing bugs as a category rather than patching them
 * individually.
 *
 * ## Division of labour with the compiler
 *
 * Browser and Node globals (`document`, `window`, `process`, `fetch`, …) are **not** checked here.
 * `tsconfig.sim.json` compiles `sim/` with `lib: ["ES2022"]` and `types: []`, which makes every one
 * of them a compile error — and does so with real scope analysis, so a domain parameter named
 * `document` or `process` is correctly allowed. A text scan cannot tell those apart, and this game
 * is about office equipment: `document`, `location` and `process` are all plausible domain nouns.
 * The right tool for scope is the compiler.
 *
 * What stays here is what the compiler cannot express: layer direction, import allowlists,
 * determinism sources, renderer read-only, and GriftOS isolation.
 *
 * ## Known limits
 *
 * String-literal checks cannot see through concatenation (`'grift' + '-os'`) or template
 * interpolation. Type-aware questions ("does this function mutate?") are not answerable from the
 * syntax tree alone. Both are review-and-test territory, and this script does not claim otherwise.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const FEATURE_ROOT = path.resolve('src', 'app', 'games', 'obsolescence');

/** Layers in dependency order. Each may import only from itself and the layers it names. */
const LAYERS = {
  sim: [],
  content: ['sim'],
  persistence: ['sim'],
  presentation: ['sim', 'content'],
  render: ['sim', 'content'],
  devtools: ['sim', 'content', 'persistence', 'presentation', 'render'],
  tests: ['sim', 'content', 'persistence', 'presentation', 'render', 'devtools'],
};

const LAYER_NAMES = Object.keys(LAYERS);

/**
 * Bare package specifiers `sim/` may import.
 *
 * Deliberately empty. An allowlist is used rather than a denylist because a denylist has to
 * enumerate every renderer and framework that will ever exist — the previous version listed
 * `pixi.js` and was defeated by `@pixi/app`. "Nothing external" is both stricter and shorter.
 */
const SIM_ALLOWED_BARE_IMPORTS = new Set();

/**
 * Exports that advance, create, or replace state. The renderer may not reach any of them (I-002).
 *
 * This list is the whole of I-002's enforcement, so **every new state-advancing or state-creating
 * simulation export must be added here in the same change that introduces it.** The facility
 * subsystem shipped without that step and the omission went unnoticed for four commits: the
 * checker reported I-002 as `ENFORCED` while `tickFacility` and `applyConstruction` — by then the
 * simulation's primary mutators — were reachable from `render/`. A list that silently falls behind
 * the code claims enforcement it is not performing, which is worse than a gap that is known.
 */
const STATE_MUTATING_EXPORTS = new Set([
  'applyCommand',
  'advanceTick',
  'run',
  'reset',
  'deserialize',
  'createInitialState',
  'verifyReplay',
  // Facility subsystem. Not re-exported from `sim/index`, but the check resolves any specifier
  // landing in `sim/`, so importing them from `sim/facility/facility` is caught the same way.
  'createFacility',
  'tickFacility',
  'applyConstruction',
]);

/** Nondeterminism sources forbidden in `sim/` (I-006), as object/member pairs. */
const NONDETERMINISM = [
  { object: 'Math', member: 'random' },
  { object: 'Date', member: 'now' },
  { object: 'performance', member: 'now' },
  { object: 'crypto', member: 'randomUUID' },
  { object: 'crypto', member: 'getRandomValues' },
  { object: 'process', member: 'hrtime' },
];

/** Objects whose destructuring in `sim/` is suspicious, e.g. `const { random } = Math`. */
const NONDETERMINISM_OBJECTS = new Map([
  ['Math', new Set(['random'])],
  ['Date', new Set(['now'])],
  ['performance', new Set(['now'])],
  ['crypto', new Set(['randomUUID', 'getRandomValues'])],
  ['process', new Set(['hrtime'])],
]);

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.mjs', '.cjs'];
const GRIFTOS_PATTERN = /grift[-_]?os/i;

const violations = [];
let scannedFiles = 0;
const perLayerCounts = new Map();

await main();

async function main() {
  if (!(await exists(FEATURE_ROOT))) {
    // Fail closed. A missing feature root used to print the same green line as a real pass.
    fail(`feature root not found at ${path.relative(process.cwd(), FEATURE_ROOT)}`);
    report();
    return;
  }

  const files = await collectSourceFiles(FEATURE_ROOT);

  for (const file of files) {
    const relative = toPosix(path.relative(FEATURE_ROOT, file));
    const layer = relative.split('/')[0];

    if (!LAYER_NAMES.includes(layer)) {
      // Unclassified directories were previously never scanned at all, which made them a free
      // bypass for every rule in this file.
      fail(`${relative}: sits outside every known layer (${LAYER_NAMES.join(', ')}) and is unregulated`);
      continue;
    }

    scannedFiles += 1;
    perLayerCounts.set(layer, (perLayerCounts.get(layer) ?? 0) + 1);
    await checkFile(file, relative, layer);
  }

  if ((perLayerCounts.get('sim') ?? 0) === 0) {
    fail('no source files found in sim/ — the check would otherwise pass vacuously');
  }

  report();
}

async function checkFile(absolutePath, relative, layer) {
  const source = await readFile(absolutePath, 'utf8');
  const tree = ts.createSourceFile(absolutePath, source, ts.ScriptTarget.ES2022, true);
  const facts = analyse(tree);
  const fromDir = path.dirname(absolutePath);

  for (const reference of facts.moduleReferences) {
    const target = resolveTarget(fromDir, reference.specifier);
    checkLayerDependency(relative, layer, reference, target);
    if (layer === 'sim') {
      checkSimImport(relative, reference, target);
    }
    if (GRIFTOS_PATTERN.test(reference.specifier)) {
      fail(`${relative}: imports GriftOS — "${reference.specifier}"`);
    }
  }

  if (layer === 'sim') {
    checkDeterminism(relative, facts);
  }

  if (layer === 'render') {
    checkRendererReadOnly(relative, fromDir, facts);
  }

  if (layer === 'content') {
    checkNoLaundering(relative, fromDir, facts);
  }

  for (const literal of facts.stringLiterals) {
    if (GRIFTOS_PATTERN.test(literal)) {
      fail(`${relative}: references a GriftOS identifier or save key — "${literal}"`);
    }
  }
}

/** I-003 — dependency direction is one-way. */
function checkLayerDependency(relative, layer, reference, target) {
  if (target.layer === null || target.layer === layer) {
    return;
  }
  if (!LAYERS[layer].includes(target.layer)) {
    const allowed = LAYERS[layer].join(', ') || 'nothing internal';
    fail(
      `${relative}: ${layer}/ may not import ${target.layer}/ (allowed: ${allowed}) — via "${reference.specifier}"`
    );
  }
}

/**
 * I-001 — `sim/` imports only relative paths that resolve inside `sim/`.
 *
 * Expressed as an allowlist so no renderer, framework, or Node builtin needs enumerating.
 */
function checkSimImport(relative, reference, target) {
  const { specifier } = reference;

  if (!specifier.startsWith('.')) {
    if (specifier.startsWith('@oi/')) {
      return; // Layer rules above already handle internal aliases.
    }
    if (!SIM_ALLOWED_BARE_IMPORTS.has(specifier)) {
      fail(
        `${relative}: sim/ may not import the external package "${specifier}" — sim/ is pure TypeScript with no runtime dependencies`
      );
    }
    return;
  }

  if (target.outsideFeature) {
    fail(`${relative}: sim/ reaches outside the feature root — "${specifier}"`);
  }
}

/** I-006 — no ambient randomness or wall-clock time inside `sim/`. */
function checkDeterminism(relative, facts) {
  for (const access of facts.propertyAccesses) {
    for (const source of NONDETERMINISM) {
      if (access.object === source.object && access.member === source.member) {
        fail(
          `${relative}: sim/ uses ${source.object}.${source.member} — randomness comes from the seeded generator and time from the tick counter`
        );
      }
    }
  }

  if (facts.constructsDate) {
    fail(`${relative}: sim/ constructs a Date — the simulation's only notion of time is the tick counter`);
  }

  for (const destructured of facts.destructurings) {
    const members = NONDETERMINISM_OBJECTS.get(destructured.object);
    if (members === undefined) {
      continue;
    }
    for (const name of destructured.names) {
      if (members.has(name)) {
        fail(
          `${relative}: sim/ destructures ${destructured.object}.${name} — aliasing a nondeterminism source is still using it`
        );
      }
    }
  }

  if (facts.referencesGlobalThis) {
    fail(`${relative}: sim/ references globalThis — the simulation has no ambient environment`);
  }
}

/**
 * I-002 — the renderer reads state and never drives it.
 *
 * Only imports that actually resolve to `sim/` are considered, so a local helper coincidentally
 * named `reset` is not misattributed. Namespace and dynamic forms are covered because the AST
 * reports them the same way as named imports.
 */
function checkRendererReadOnly(relative, fromDir, facts) {
  for (const reference of facts.moduleReferences) {
    if (resolveTarget(fromDir, reference.specifier).layer !== 'sim') {
      continue;
    }

    for (const name of reference.names) {
      if (STATE_MUTATING_EXPORTS.has(name.imported) && !name.isTypeOnly) {
        fail(
          `${relative}: render/ imports "${name.imported}" from sim — the renderer must only read state`
        );
      }
    }

    if (reference.namespace !== null) {
      for (const access of facts.propertyAccesses) {
        if (access.object === reference.namespace && STATE_MUTATING_EXPORTS.has(access.member)) {
          fail(
            `${relative}: render/ calls ${reference.namespace}.${access.member} from a namespace import of sim — the renderer must only read state`
          );
        }
      }
    }
  }
}

/**
 * Closes the laundering route: `content/` re-exporting sim's mutating functions would let the
 * renderer import them from an allowed layer and defeat I-002 entirely.
 */
function checkNoLaundering(relative, fromDir, facts) {
  for (const reference of facts.moduleReferences) {
    if (reference.kind !== 'export' || resolveTarget(fromDir, reference.specifier).layer !== 'sim') {
      continue;
    }
    for (const name of reference.names) {
      if (STATE_MUTATING_EXPORTS.has(name.imported) && !name.isTypeOnly) {
        fail(
          `${relative}: content/ re-exports "${name.imported}" from sim — that would let render/ reach a state-mutating function through an allowed layer`
        );
      }
    }
  }
}

/**
 * Maps a specifier to the layer it targets.
 *
 * Relative specifiers are resolved to an absolute path and tested for containment in the feature
 * root. The previous string-based version treated `../../obsolescence/content/x` as external
 * because the feature-root-relative form began with `..`, even though it resolves straight back
 * into the tree — which silently disabled every layer rule.
 */
function resolveTarget(fromDir, specifier) {
  if (specifier.startsWith('@oi/')) {
    const segment = specifier.slice('@oi/'.length).split('/')[0];
    return { layer: LAYER_NAMES.includes(segment) ? segment : null, outsideFeature: false };
  }

  if (!specifier.startsWith('.')) {
    return { layer: null, outsideFeature: false };
  }

  const absolute = path.resolve(fromDir, specifier);
  const relative = path.relative(FEATURE_ROOT, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return { layer: null, outsideFeature: true };
  }

  const segment = toPosix(relative).split('/')[0];
  return { layer: LAYER_NAMES.includes(segment) ? segment : null, outsideFeature: false };
}

/** Walks the AST once and collects everything the checks need. */
function analyse(tree) {
  const moduleReferences = [];
  const propertyAccesses = [];
  const destructurings = [];
  const stringLiterals = [];
  let constructsDate = false;
  let referencesGlobalThis = false;

  const literalText = (node) =>
    node !== undefined &&
    (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
      ? node.text
      : null;

  const visit = (node) => {
    // import ... from '...' / export ... from '...'
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      const specifier = literalText(node.moduleSpecifier);
      if (specifier !== null) {
        moduleReferences.push({
          specifier,
          kind: ts.isImportDeclaration(node) ? 'import' : 'export',
          names: collectBindingNames(node),
          namespace: collectNamespaceName(node),
        });
      }
    }

    // import('...') and require('...')
    if (ts.isCallExpression(node)) {
      const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire = ts.isIdentifier(node.expression) && node.expression.text === 'require';
      if (isDynamicImport || isRequire) {
        const specifier = literalText(node.arguments[0]);
        if (specifier !== null) {
          moduleReferences.push({
            specifier,
            kind: isDynamicImport ? 'dynamic' : 'require',
            names: collectDynamicBindingNames(node),
            namespace: null,
          });
        }
      }
    }

    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
      propertyAccesses.push({ object: node.expression.text, member: node.name.text });
    }

    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Date') {
      constructsDate = true;
    }

    if (ts.isIdentifier(node) && node.text === 'globalThis') {
      referencesGlobalThis = true;
    }

    // const { random } = Math
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer !== undefined &&
      ts.isIdentifier(node.initializer) &&
      node.name !== undefined &&
      ts.isObjectBindingPattern(node.name)
    ) {
      destructurings.push({
        object: node.initializer.text,
        names: node.name.elements.map((element) =>
          element.propertyName !== undefined && ts.isIdentifier(element.propertyName)
            ? element.propertyName.text
            : ts.isIdentifier(element.name)
              ? element.name.text
              : ''
        ),
      });
    }

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      stringLiterals.push(node.text);
    }

    ts.forEachChild(node, visit);
  };

  ts.forEachChild(tree, visit);

  return {
    moduleReferences,
    propertyAccesses,
    destructurings,
    stringLiterals,
    constructsDate,
    referencesGlobalThis,
  };
}

/** Named bindings from a static import or export clause, preserving type-only status. */
function collectBindingNames(node) {
  const names = [];
  const clause = ts.isImportDeclaration(node) ? node.importClause : node.exportClause;
  if (clause === undefined) {
    return names;
  }

  const clauseIsTypeOnly = Boolean(node.isTypeOnly || clause.isTypeOnly);

  if (ts.isImportDeclaration(node)) {
    if (clause.name !== undefined) {
      names.push({ imported: clause.name.text, isTypeOnly: clauseIsTypeOnly });
    }
    if (clause.namedBindings !== undefined && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        names.push({
          imported: (element.propertyName ?? element.name).text,
          isTypeOnly: clauseIsTypeOnly || Boolean(element.isTypeOnly),
        });
      }
    }
    return names;
  }

  if (ts.isNamedExports(clause)) {
    for (const element of clause.elements) {
      names.push({
        imported: (element.propertyName ?? element.name).text,
        isTypeOnly: clauseIsTypeOnly || Boolean(element.isTypeOnly),
      });
    }
  }
  return names;
}

/** `import * as ns from '...'` — the local alias, so `ns.applyCommand(...)` can be detected. */
function collectNamespaceName(node) {
  if (!ts.isImportDeclaration(node) || node.importClause === undefined) {
    return null;
  }
  const bindings = node.importClause.namedBindings;
  return bindings !== undefined && ts.isNamespaceImport(bindings) ? bindings.name.text : null;
}

/** `const { applyCommand } = await import('...')` — names destructured off a dynamic import. */
function collectDynamicBindingNames(call) {
  let current = call.parent;
  while (current !== undefined && (ts.isAwaitExpression(current) || ts.isParenthesizedExpression(current))) {
    current = current.parent;
  }
  if (
    current === undefined ||
    !ts.isVariableDeclaration(current) ||
    !ts.isObjectBindingPattern(current.name)
  ) {
    return [];
  }
  return current.name.elements.map((element) => ({
    imported:
      element.propertyName !== undefined && ts.isIdentifier(element.propertyName)
        ? element.propertyName.text
        : ts.isIdentifier(element.name)
          ? element.name.text
          : '',
    isTypeOnly: false,
  }));
}

async function collectSourceFiles(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(full)));
      continue;
    }
    if (entry.name.endsWith('.d.ts')) {
      continue;
    }
    if (SOURCE_EXTENSIONS.some((extension) => entry.name.endsWith(extension))) {
      files.push(full);
    }
  }
  return files.sort();
}

function fail(message) {
  violations.push(message);
}

function report() {
  if (violations.length > 0) {
    console.error(
      ['Obsolescence architecture boundary violations:', ...violations.map((item) => `- ${item}`)].join('\n')
    );
    process.exitCode = 1;
    return;
  }

  const summary = LAYER_NAMES.filter((name) => perLayerCounts.has(name))
    .map((name) => `${name} ${perLayerCounts.get(name)}`)
    .join(', ');
  console.log(
    `Obsolescence boundaries pass across ${scannedFiles} files (${summary}): layer direction, sim import allowlist, determinism, renderer read-only, GriftOS isolation.`
  );
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}
