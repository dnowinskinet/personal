import { build } from 'esbuild';
import path from 'node:path';

const projectRoot = process.cwd();
const simulationPath = path.join(
  projectRoot,
  'src',
  'app',
  'pages',
  'experimental',
  'grift-os-game',
  'game-engine',
  'balance-sim.ts'
).replaceAll('\\', '/');
const profileArgument = process.argv.find((argument) => argument.startsWith('--profile='));
const strategyArgument = process.argv.find((argument) => argument.startsWith('--strategy='));
const rugStrategyArgument = process.argv.find((argument) => argument.startsWith('--rug-strategy='));
const targetArgument = process.argv.find((argument) => argument.startsWith('--target='));
const maxDaysArgument = process.argv.find((argument) => argument.startsWith('--max-days='));
const startingNetWorthArgument = process.argv.find((argument) => argument.startsWith('--starting-net-worth='));
const selectedProfiles = profileArgument
  ? [profileArgument.slice('--profile='.length)]
  : ['one-hour', 'four-hour', 'eight-hour', 'morning-evening'];
const selectedStrategy = strategyArgument?.slice('--strategy='.length) ?? 'natural';
const selectedRugStrategy = rugStrategyArgument?.slice('--rug-strategy='.length) ?? 'immediate';
const includeSensitivity = process.argv.includes('--sensitivity');
const includeCollections = process.argv.includes('--collections');
const selectedTarget = targetArgument ? Number(targetArgument.slice('--target='.length)) : null;
const selectedMaxDays = maxDaysArgument ? Number(maxDaysArgument.slice('--max-days='.length)) : null;
const selectedStartingNetWorth = startingNetWorthArgument
  ? Number(startingNetWorthArgument.slice('--starting-net-worth='.length))
  : null;

const entrySource = `
  import {
    BALANCE_PROFILES,
    runCampaignSimulation,
  } from ${JSON.stringify(simulationPath)};

  const profileIds = ${JSON.stringify(selectedProfiles)};
  const strategyIds = [
    'natural',
    'automation-rush',
    'next-hustle-rush',
    'milestone-rush',
    'rough-roi',
    'expansion-first',
  ];
  const profiles = profileIds.map((profile) => summarize(runCampaignSimulation({
    profile,
    strategy: ${JSON.stringify(selectedStrategy)},
    rugPullStrategy: ${JSON.stringify(selectedRugStrategy)},
    targetNetWorth: ${JSON.stringify(selectedTarget)} ?? undefined,
    startingNetWorth: ${JSON.stringify(selectedStartingNetWorth)} ?? undefined,
    maxWallClockMs: (${JSON.stringify(selectedMaxDays)} ?? (profile === 'active' ? 3 : 21)) * 86_400_000,
  })));
  const sensitivity = ${JSON.stringify(includeSensitivity)}
    ? strategyIds.map((strategy) => summarize(runCampaignSimulation({
        profile: BALANCE_PROFILES['eight-hour'],
        strategy,
        rugPullStrategy: ${JSON.stringify(selectedRugStrategy)},
        maxWallClockMs: 21 * 86_400_000,
        startingNetWorth: ${JSON.stringify(selectedStartingNetWorth)} ?? undefined,
      })))
    : [];

  console.log(JSON.stringify({ profiles, sensitivity }, null, 2));

  function summarize(result) {
    return {
      profile: result.profile.id,
      strategy: result.strategy,
      rugPullStrategy: result.rugPullStrategy,
      reachedTarget: result.reachedTarget,
      simulatedDays: round(result.simulatedMs / 86_400_000, 2),
      collectionWindows: result.collectionWindows,
      rugPulls: result.rugPulls.map((rug) => ({
        index: rug.index,
        day: round(rug.elapsedMs / 86_400_000, 2),
        window: rug.collectionWindow,
        peakValuation: rug.peakValuation,
        netWorthGained: rug.netWorthGained,
        resultingNetWorth: rug.resultingNetWorth,
        recoveryHours: rug.recoveryMs === null ? null : round(rug.recoveryMs / 3_600_000, 2),
        newlyUnlocked: rug.newlyUnlocked,
        founderTakePercent: round(rug.founderTakeRate * 100, 1),
        founderTakeStages: rug.founderTakeStages,
      })),
      finalNetWorth: result.finalState.netWorth,
      finalPeakValuation: result.finalState.peakValuation,
      hustleAcquisitionHours: hoursMap(result.timings.hustleAcquiredAtMs),
      automationHours: hoursMap(result.timings.automationAtMs),
      leverageHours: hoursMap(result.timings.leverageAtMs),
      founderTakePreparationHours: result.timings.founderTakeAtMs.map((elapsedMs) => round(elapsedMs / 3_600_000, 2)),
      milestoneCount: Object.keys(result.timings.milestoneAtMs).length,
      finalUnits: Object.fromEntries(
        Object.entries(result.finalState.hustles).map(([id, hustle]) => [id, hustle.units])
      ),
      productionShare: Object.fromEntries(
        Object.entries(result.productionShareByHustle)
          .filter(([, share]) => share >= 0.001)
          .sort((first, second) => second[1] - first[1])
          .map(([id, share]) => [id, round(share * 100, 1)])
      ),
      purchaseCountByHustle: result.purchaseCountByHustle,
      dominantPurchaseShare: round(result.dominantPurchaseShare * 100, 1),
      collections: ${JSON.stringify(includeCollections)}
        ? result.collections.map((collection) => ({
            window: collection.window,
            hour: round(collection.elapsedMs / 3_600_000, 2),
            collected: collection.valuationCollected,
            valuationAfter: collection.valuationAfter,
            netWorthAfter: collection.netWorthAfter,
            purchases: collection.purchases,
          }))
        : undefined,
    };
  }

  function hoursMap(values) {
    return Object.fromEntries(
      Object.entries(values).map(([id, elapsedMs]) => [id, round(elapsedMs / 3_600_000, 2)])
    );
  }

  function round(value, digits) {
    const scale = 10 ** digits;
    return Math.round(value * scale) / scale;
  }
`;

const result = await build({
  stdin: {
    contents: entrySource,
    loader: 'ts',
    resolveDir: projectRoot,
    sourcefile: 'grift-os-balance-report-entry.ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  write: false,
  logLevel: 'silent',
});

const bundledSource = result.outputFiles[0].text;
const dataUrl = `data:text/javascript;base64,${Buffer.from(bundledSource).toString('base64')}`;
await import(dataUrl);
