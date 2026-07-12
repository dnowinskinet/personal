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

async function scanBoundary(root, forbiddenImports, boundaryName) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name.endsWith('.spec.ts')) {
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

    if (forbiddenGlobals.test(source)) {
      violations.push(`${boundaryName}/${entry.name}: browser DOM or storage global access`);
    }
  }
}

if (violations.length > 0) {
  console.error(['GriftOS architecture boundary violations:', ...violations.map((item) => `- ${item}`)].join('\n'));
  process.exitCode = 1;
} else {
  console.log('GriftOS engine, presentation, and runtime boundaries pass.');
}
