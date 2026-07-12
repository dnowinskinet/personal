import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const engineRoot = path.join(
  process.cwd(),
  'src',
  'app',
  'pages',
  'experimental',
  'grift-os-game',
  'game-engine'
);
const forbiddenImports = [
  '@angular/',
  '/content/',
  '/empires/',
  '/audio/',
  '/renderer/',
  '/playtest/',
];
const forbiddenGlobals = /\b(?:document|localStorage|sessionStorage|window)\s*\./;
const violations = [];

for (const entry of await readdir(engineRoot, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name.endsWith('.spec.ts')) {
    continue;
  }

  const filePath = path.join(engineRoot, entry.name);
  const source = await readFile(filePath, 'utf8');
  const importSpecifiers = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]
    .map((match) => match[1]);

  for (const specifier of importSpecifiers) {
    if (forbiddenImports.some((fragment) => `${specifier}/`.includes(fragment))) {
      violations.push(`${entry.name}: forbidden import ${specifier}`);
    }
  }

  if (forbiddenGlobals.test(source)) {
    violations.push(`${entry.name}: browser DOM or storage global access`);
  }
}

if (violations.length > 0) {
  console.error(['GriftOS engine boundary violations:', ...violations.map((item) => `- ${item}`)].join('\n'));
  process.exitCode = 1;
} else {
  console.log('GriftOS engine boundaries pass.');
}
