import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const featureRoot = path.join(
  process.cwd(),
  'src',
  'app',
  'pages',
  'experimental',
  'grift-os-game'
);
const forbiddenGlobals = /\b(?:document|localStorage|sessionStorage|window)\s*\./;
const violations = [];

await scanBoundary(
  path.join(featureRoot, 'game-engine'),
  ['@angular/', '/content/', '/empires/', '/audio/', '/renderer/', '/playtest/'],
  'engine'
);
await scanBoundary(
  path.join(featureRoot, 'presentation'),
  ['@angular/', '/audio/', '/renderer/', '/playtest/', '../grift-os-game'],
  'presentation'
);
await scanBoundary(
  path.join(featureRoot, 'runtime'),
  ['@angular/', '/content/', '/empires/', '/audio/', '/presentation/', '/renderer/', '/playtest/', '../grift-os-game'],
  'runtime'
);
await scanBoundary(
  path.join(featureRoot, 'empires', 'influence', 'renderer'),
  ['/game-engine/economy', '/game-engine/leverage', '/game-engine/modifiers', '/runtime/', '/audio/', '/playtest/', '../grift-os-game'],
  'influence-renderer',
  false
);

await checkStyleBoundaries();
await checkHostRendererBoundary();

async function scanBoundary(root, forbiddenImports, boundaryName, forbidBrowserGlobals = true) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      await scanBoundary(path.join(root, entry.name), forbiddenImports, boundaryName, forbidBrowserGlobals);
      continue;
    }

    if (!entry.name.endsWith('.ts') || entry.name.endsWith('.spec.ts')) {
      continue;
    }

    const filePath = path.join(root, entry.name);
    const source = await readFile(filePath, 'utf8');
    const importSpecifiers = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]
      .map((match) => match[1]);

    for (const specifier of importSpecifiers) {
      if (forbiddenImports.some((fragment) => `${specifier}/`.includes(fragment))) {
        violations.push(`${boundaryName}/${entry.name}: forbidden import ${specifier}`);
      }
    }

    if (forbidBrowserGlobals && forbiddenGlobals.test(source)) {
      violations.push(`${boundaryName}/${entry.name}: browser DOM or storage global access`);
    }
  }
}

async function checkStyleBoundaries() {
  const styleFiles = [
    {
      name: 'global GriftOS bridge',
      path: path.join(process.cwd(), 'src', 'styles', '_grift-os.scss'),
      importantBaseline: 1,
      global: true,
    },
    {
      name: 'shared host styles',
      path: path.join(featureRoot, 'grift-os-game.scss'),
      importantBaseline: 1,
    },
    {
      name: 'Influence renderer styles',
      path: path.join(featureRoot, 'empires', 'influence', 'renderer', 'influence-empire-renderer.scss'),
      importantBaseline: 11,
      rootScoped: true,
    },
    {
      name: 'Influence Stage component styles',
      path: path.join(featureRoot, 'empires', 'influence', 'renderer', 'stage', 'influence-stage.component.scss'),
      importantBaseline: 0,
    },
    {
      name: 'Influence Context component styles',
      path: path.join(featureRoot, 'empires', 'influence', 'renderer', 'context', 'influence-context.component.scss'),
      importantBaseline: 0,
    },
    {
      name: 'Influence Ledger component styles',
      path: path.join(featureRoot, 'empires', 'influence', 'renderer', 'ledger', 'influence-ledger.component.scss'),
      importantBaseline: 0,
    },
    {
      name: 'Influence Lane component styles',
      path: path.join(featureRoot, 'empires', 'influence', 'renderer', 'ledger', 'influence-lane.component.scss'),
      importantBaseline: 0,
    },
    {
      name: 'Influence Modes component styles',
      path: path.join(featureRoot, 'empires', 'influence', 'renderer', 'modes', 'influence-modes.component.scss'),
      importantBaseline: 0,
    },
    {
      name: 'Influence Leverage component styles',
      path: path.join(featureRoot, 'empires', 'influence', 'renderer', 'leverage', 'influence-leverage.component.scss'),
      importantBaseline: 0,
    },
    {
      name: 'Influence Rug Pull component styles',
      path: path.join(featureRoot, 'empires', 'influence', 'renderer', 'rug-pull', 'influence-rug-pull.component.scss'),
      importantBaseline: 0,
    },
    {
      name: 'Influence Founder Take component styles',
      path: path.join(featureRoot, 'empires', 'influence', 'renderer', 'rug-pull', 'founder-take', 'influence-founder-take.component.scss'),
      importantBaseline: 0,
    },
  ];

  for (const styleFile of styleFiles) {
    const source = await readFile(styleFile.path, 'utf8');
    if (source.includes('::ng-deep')) {
      violations.push(`${styleFile.name}: ::ng-deep is prohibited`);
    }
    if (/\/\*\s*Phase\s+\d/i.test(source)) {
      violations.push(`${styleFile.name}: append-only phase sections are prohibited`);
    }

    const importantCount = (source.match(/!important/g) ?? []).length;
    if (importantCount > styleFile.importantBaseline) {
      violations.push(
        `${styleFile.name}: added !important (${importantCount}; baseline ${styleFile.importantBaseline})`
      );
    }

    if (styleFile.global) {
      const griftClasses = [...source.matchAll(/\.([a-zA-Z_][\w-]*grift[\w-]*)/g)]
        .map((match) => match[1]);
      const unexpectedClasses = griftClasses.filter(
        (className) => !['grift-os-app', 'grift-context-overlay-open'].includes(className)
      );
      if (unexpectedClasses.length > 0 || source.includes('@keyframes')) {
        violations.push(`${styleFile.name}: empire presentation leaked into global styles`);
      }
    }

    if (styleFile.rootScoped &&
        (!source.includes('.grift-influence-renderer {') || source.includes(':host-context'))) {
      violations.push(`${styleFile.name}: renderer styles must remain explicitly root-scoped`);
    }

    if (styleFile.name === 'Influence Circulating Institution styles' && source.includes('.grift-stage')) {
      violations.push(`${styleFile.name}: Stage rules must remain owned by the Stage component`);
    }
  }
}

async function checkHostRendererBoundary() {
  const hostSource = await readFile(path.join(featureRoot, 'grift-os-game.ts'), 'utf8');
  if (/from\s+['"][^'"]*\/empires\/[^'"]*\/renderer\//.test(hostSource)) {
    violations.push('shared host: direct empire renderer import');
  }
}

if (violations.length > 0) {
  console.error(['GriftOS architecture boundary violations:', ...violations.map((item) => `- ${item}`)].join('\n'));
  process.exitCode = 1;
} else {
  console.log('GriftOS engine, presentation, runtime, host/renderer, and style boundaries pass.');
}
