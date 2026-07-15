import { mkdir, readdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, 'vendor', 'fontawesome-source');
const appSourceRoot = path.join(projectRoot, 'src');
const outputRoot = path.join(projectRoot, 'src', 'assets', 'fontawesome', 'icons');
const manifestPath = path.join(projectRoot, 'src', 'assets', 'fontawesome', 'icons.manifest.json');

const packageStyles = new Map([
  ['@fortawesome/free-brands-svg-icons', 'brands'],
  ['@fortawesome/free-regular-svg-icons', 'regular'],
  ['@fortawesome/free-solid-svg-icons', 'solid'],
]);

const ignoredDirs = new Set([
  '.angular',
  '.git',
  'dist',
  'node_modules',
  'vendor',
]);

async function collectFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(fullPath, files);
    } else if (/\.(ts|html)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseFontAwesomeImports(source) {
  const imports = [];
  const importPattern = /import\s*\{([^}]+)\}\s*from\s*['"](@fortawesome\/[^'"]+-svg-icons)['"];?/g;
  let match;

  while ((match = importPattern.exec(source)) !== null) {
    const [, specifiers, packageName] = match;
    const style = packageStyles.get(packageName);

    if (!style) {
      continue;
    }

    for (const specifier of specifiers.split(',')) {
      const importedName = specifier.trim().split(/\s+as\s+/)[0]?.trim();
      if (importedName?.startsWith('fa') && importedName.length > 2) {
        imports.push({ importedName, packageName, style });
      }
    }
  }

  return imports;
}

function iconNameFromImport(importedName) {
  const baseName = importedName.slice(2);
  return baseName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function uniqueIcons(imports) {
  const byKey = new Map();

  for (const item of imports) {
    const iconName = iconNameFromImport(item.importedName);
    const key = `${item.style}/${iconName}`;
    byKey.set(key, { ...item, iconName, key });
  }

  return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function candidateSourcePaths(style, iconName) {
  return [
    path.join(sourceRoot, 'svgs', style, `${iconName}.svg`),
    path.join(sourceRoot, 'svgs-full', style, `${iconName}.svg`),
  ];
}

async function main() {
  if (!existsSync(sourceRoot)) {
    throw new Error(`Font Awesome source folder not found: ${sourceRoot}`);
  }

  const files = await collectFiles(appSourceRoot);
  const imports = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    imports.push(...parseFontAwesomeImports(source));
  }

  const icons = uniqueIcons(imports);
  const copied = [];
  const missing = [];

  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  for (const icon of icons) {
    const sourcePath = candidateSourcePaths(icon.style, icon.iconName).find((candidate) => existsSync(candidate));

    if (!sourcePath) {
      missing.push(icon);
      continue;
    }

    const outputDir = path.join(outputRoot, icon.style);
    const outputPath = path.join(outputDir, `${icon.iconName}.svg`);
    await mkdir(outputDir, { recursive: true });
    await copyFile(sourcePath, outputPath);

    copied.push({
      importName: icon.importedName,
      packageName: icon.packageName,
      style: icon.style,
      icon: icon.iconName,
      path: `/assets/fontawesome/icons/${icon.style}/${icon.iconName}.svg`,
    });
  }

  await writeFile(`${manifestPath}`, `${JSON.stringify(copied, null, 2)}\n`, 'utf8');

  console.log(`Scanned ${files.length} source files.`);
  console.log(`Copied ${copied.length} Font Awesome icons to ${path.relative(projectRoot, outputRoot)}.`);

  if (missing.length > 0) {
    console.error('\nMissing icons:');
    for (const icon of missing) {
      console.error(`- ${icon.importedName} -> ${icon.style}/${icon.iconName}.svg (${icon.packageName})`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
