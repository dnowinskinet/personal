import { HUSTLE_DEFINITIONS } from '../content/hustle-definitions';
import {
  GRIFT_OS_HUSTLE_TUNING,
  GRIFT_OS_MILESTONE_TUNING,
  GRIFT_OS_PRESTIGE_TUNING,
} from '../content/economy-tuning';
import { runBalanceSimulation } from './balance-sim';
import {
  founderTakeRate,
  startFounderTakePreparation,
} from './founder-take';
import {
  activateHustle,
  advanceGame,
  automationCost,
  buyAutomation,
  buyHustle,
  canBuyAutomation,
  createInitialGameState,
  effectiveCadenceSeconds,
  hustleCostForQuantity,
  hustlePayout,
  maxAffordableQuantity,
  nextHustleCost,
  valuationPerSecond,
} from './economy';
import { collectActiveModifiers, wealthAdvantageMultiplier } from './modifiers';
import { buyLeverage } from './leverage';
import { deriveEnterprisePresentation } from './presentation';
import { commitRugPull, createRugPullPreview, projectedNetWorthGain, RUG_PULL_CONFIG } from './rug-pull';

describe('GriftOS Hustle economy', () => {
  const trollDefinition = HUSTLE_DEFINITIONS[0];
  const podcastDefinition = HUSTLE_DEFINITIONS[1];
  const cultureWarDefinition = HUSTLE_DEFINITIONS[2];
  const sovereignDefinition = HUSTLE_DEFINITIONS[9];

  it('creates the modern starting state', () => {
    const state = createInitialGameState(HUSTLE_DEFINITIONS);

    expect(HUSTLE_DEFINITIONS.length).toBe(10);
    expect(state.valuation).toBe(0);
    expect(state.peakValuation).toBe(0);
    expect(state.netWorth).toBe(0);
    expect(state.hustles['troll-network'].units).toBe(1);
    expect(state.hustles['troll-network'].isAutomated).toBeFalse();

    for (const definition of HUSTLE_DEFINITIONS.slice(1)) {
      expect(state.hustles[definition.id].units).toBe(0);
      expect(state.hustles[definition.id].isAutomated).toBeFalse();
    }
  });

  it('defines the ten-Hustle ladder with durable nouns and unit grammar', () => {
    expect(HUSTLE_DEFINITIONS.map((definition) => definition.id)).toEqual([
      'troll-network',
      'podcast-network',
      'culture-war-media',
      'masterclass-business',
      'manifesto-imprint',
      'founder-retreat-circuit',
      'ai-venture',
      'venture-portfolio',
      'media-holdings',
      'sovereign-network',
    ]);
    expect(trollDefinition.name).toBe('Creator Account');
    expect(trollDefinition.unitPlural).toBe('Accounts');
    expect(trollDefinition.manualActionLabel).toBe('Post an Affiliate Link');
    expect(podcastDefinition.name).toBe('Subscriber Club');
    expect(podcastDefinition.manualActionLabel).toBe('Sell a Subscription');
    expect(cultureWarDefinition.automationName).toBe('Fulfillment Partner');
    expect(sovereignDefinition.unitPlural).toBe('Ad Markets');
    expect(sovereignDefinition.audio?.ambientSignature).toBe('platform-exchange');
    expect(trollDefinition.milestones.map((milestone) => milestone.requiredUnits)).toEqual([
      10,
      25,
      50,
      100,
    ]);
  });

  it('keeps numeric definitions centralized in the tuning table', () => {
    for (const definition of HUSTLE_DEFINITIONS) {
      expect({
        acquisitionCost: definition.acquisitionCost,
        growthRate: definition.growthRate,
        basePayout: definition.basePayout,
        cadenceSeconds: definition.cadenceSeconds,
        automationCost: definition.automationCost,
        initialUnits: definition.initialUnits,
        unlockNetWorth: definition.unlockNetWorth,
      }).toEqual(GRIFT_OS_HUSTLE_TUNING[definition.id]);

      expect(definition.milestones.map((milestone) => ({
        requiredUnits: milestone.requiredUnits,
        kind: milestone.reward.kind,
        value: milestone.reward.value,
      }))).toEqual(GRIFT_OS_MILESTONE_TUNING[definition.id].map((milestone) => ({
        requiredUnits: milestone.requiredUnits,
        kind: milestone.kind,
        value: milestone.value,
      })));
    }
    expect(RUG_PULL_CONFIG).toEqual(GRIFT_OS_PRESTIGE_TUNING);
  });

  it('calculates candidate early expansion costs from the new seed', () => {
    expect(nextHustleCost(trollDefinition, 0)).toBe(0.025);
    expect(nextHustleCost(trollDefinition, 1)).toBeCloseTo(0.0295, 6);
    expect(nextHustleCost(trollDefinition, 2)).toBeCloseTo(0.03481, 6);
  });

  it('calculates geometric cost and buy max without overspending', () => {
    const totalCost = hustleCostForQuantity(trollDefinition, 1, 3);
    const expected = 0.0295 + 0.03481 + 0.0410758;

    expect(totalCost).toBeCloseTo(expected, 5);

    const affordable = maxAffordableQuantity(trollDefinition, 1, 0.2);
    const exactCost = hustleCostForQuantity(trollDefinition, 1, affordable);
    const nextCost = hustleCostForQuantity(trollDefinition, 1, affordable + 1);

    expect(affordable).toBeGreaterThan(0);
    expect(exactCost).toBeLessThanOrEqual(0.2);
    expect(nextCost).toBeGreaterThan(0.2);
  });

  it('buys Hustle units and records reached milestones', () => {
    const state = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: 2_000,
      peakValuation: 2_000,
    };

    const result = buyHustle(state, HUSTLE_DEFINITIONS, 'troll-network', 9);

    expect(result.quantityPurchased).toBe(9);
    expect(result.state.hustles['troll-network'].units).toBe(10);
    expect(result.state.hustles['troll-network'].reachedMilestones).toContain('troll-network-10');
    expect(result.milestonesReached).toEqual([
      { hustleId: 'troll-network', milestoneId: 'troll-network-10' },
    ]);
  });

  it('applies milestone and Net Worth modifiers through the central stack', () => {
    const milestoneState = buyHustle(
      {
        ...createInitialGameState(HUSTLE_DEFINITIONS, 100_000),
        valuation: 2_000,
        peakValuation: 2_000,
      },
      HUSTLE_DEFINITIONS,
      'troll-network',
      9
    ).state;

    const modifiers = collectActiveModifiers(milestoneState, HUSTLE_DEFINITIONS);
    const payout = hustlePayout(milestoneState, HUSTLE_DEFINITIONS, 'troll-network');

    expect(modifiers.map((modifier) => modifier.id)).toContain('troll-network-units-10-output');
    expect(wealthAdvantageMultiplier(100_000)).toBeCloseTo(3.52, 2);
    expect(payout).toBeGreaterThan(trollDefinition.basePayout * 10 * 1.5);
  });

  it('requires manual activation before production begins', () => {
    const initialState = createInitialGameState(HUSTLE_DEFINITIONS);
    const idleResult = advanceGame(initialState, HUSTLE_DEFINITIONS, 2_000);

    expect(idleResult.events.length).toBe(0);
    expect(idleResult.state.valuation).toBe(0);

    const activeState = activateHustle(initialState, 'troll-network');
    const activeResult = advanceGame(activeState, HUSTLE_DEFINITIONS, 2_000);

    expect(activeResult.events).toEqual([
      { hustleId: 'troll-network', payout: 0.0025, cyclesCompleted: 1 },
    ]);
    expect(activeResult.state.valuation).toBe(0.0025);
  });

  it('manual Hustles complete one cycle and become ready again', () => {
    const activeState = activateHustle(
      createInitialGameState(HUSTLE_DEFINITIONS),
      'troll-network'
    );

    const result = advanceGame(activeState, HUSTLE_DEFINITIONS, 20_000);

    expect(result.events.length).toBe(1);
    expect(result.state.valuation).toBe(0.0025);
    expect(result.state.hustles['troll-network'].isActive).toBeFalse();
    expect(result.state.hustles['troll-network'].progressMs).toBe(0);
  });

  it('automation is priced directly and restarts completed cycles', () => {
    const state = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: trollDefinition.automationCost,
      peakValuation: trollDefinition.automationCost,
    };

    expect(automationCost(state, HUSTLE_DEFINITIONS, 'troll-network')).toBe(0.5);
    expect(canBuyAutomation(state, HUSTLE_DEFINITIONS, 'troll-network')).toBeTrue();

    const automated = buyAutomation(state, HUSTLE_DEFINITIONS, 'troll-network').state;
    const result = advanceGame(automated, HUSTLE_DEFINITIONS, 4_500);

    expect(result.events).toEqual([
      { hustleId: 'troll-network', payout: 0.0025, cyclesCompleted: 2 },
    ]);
    expect(result.state.valuation).toBe(0.005);
    expect(result.state.hustles['troll-network'].isAutomated).toBeTrue();
    expect(result.state.hustles['troll-network'].isActive).toBeTrue();
    expect(result.state.hustles['troll-network'].progressMs).toBe(500);
  });

  it('calculates displayed rate from active and automated Hustles only', () => {
    const idle = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: 500,
      peakValuation: 500,
    };

    expect(valuationPerSecond(idle, HUSTLE_DEFINITIONS)).toBe(0);

    const active = activateHustle(idle, 'troll-network');

    expect(valuationPerSecond(active, HUSTLE_DEFINITIONS)).toBeCloseTo(
      trollDefinition.basePayout / trollDefinition.cadenceSeconds,
      6
    );
    expect(effectiveCadenceSeconds(active, HUSTLE_DEFINITIONS, 'troll-network')).toBe(2);
  });

  it('previews and commits the first campaign Rug Pull', () => {
    const state = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: RUG_PULL_CONFIG.unlockValuation,
      peakValuation: RUG_PULL_CONFIG.unlockValuation,
    };

    const preview = createRugPullPreview(state);
    const result = commitRugPull(state, HUSTLE_DEFINITIONS);

    expect(preview.isAvailable).toBeTrue();
    expect(projectedNetWorthGain(50_000_000)).toBe(0);
    expect(projectedNetWorthGain(100_000_000)).toBe(1_000_000);
    expect(projectedNetWorthGain(200_000_000)).toBe(1_681_792);
    expect(result.netWorthGained).toBe(1_000_000);
    expect(result.state.valuation).toBe(0);
    expect(result.state.netWorth).toBe(1_000_000);
    expect(result.state.rugPullCount).toBe(1);
    expect(result.state.hustles['troll-network'].units).toBe(1);
  });

  it('requires timed, output-diverting preparation before Founder Take improves', () => {
    const target = RUG_PULL_CONFIG.unlockValuation;
    const readyState = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: target,
      peakValuation: target,
      hustles: {
        ...createInitialGameState(HUSTLE_DEFINITIONS).hustles,
        'troll-network': {
          ...createInitialGameState(HUSTLE_DEFINITIONS).hustles['troll-network'],
          isActive: true,
          isAutomated: true,
        },
      },
    };
    const preparation = startFounderTakePreparation(readyState);

    expect(preparation.started).toBeTrue();
    expect(preparation.totalCost).toBe(3_000_000);
    expect(founderTakeRate(preparation.state)).toBe(0.1);
    expect(hustlePayout(preparation.state, HUSTLE_DEFINITIONS, 'troll-network')).toBeCloseTo(0.001875, 8);

    const completed = advanceGame(preparation.state, HUSTLE_DEFINITIONS, 2 * 60 * 60 * 1000);

    expect(completed.state.founderTakePreparation.completedStages).toBe(1);
    expect(completed.state.founderTakePreparation.isActive).toBeFalse();
    expect(founderTakeRate(completed.state)).toBeCloseTo(0.15, 8);
    expect(createRugPullPreview(completed.state).projectedNetWorthGain).toBe(1_500_000);
  });

  it('makes Leverage an expensive run-scoped output decision', () => {
    const initial = createInitialGameState(HUSTLE_DEFINITIONS);
    const eligibleState = {
      ...initial,
      valuation: 25_000_000,
      peakValuation: 25_000_000,
      hustles: {
        ...initial.hustles,
        'troll-network': { ...initial.hustles['troll-network'], isAutomated: true },
        'podcast-network': { ...initial.hustles['podcast-network'], units: 1, isAutomated: true },
        'culture-war-media': { ...initial.hustles['culture-war-media'], units: 1, isAutomated: true },
        'masterclass-business': { ...initial.hustles['masterclass-business'], units: 1 },
      },
    };
    const beforePayout = hustlePayout(eligibleState, HUSTLE_DEFINITIONS, 'troll-network');
    const purchased = buyLeverage(eligibleState, 'attention-loop');

    expect(purchased.purchased).toBeTrue();
    expect(purchased.state.valuation).toBe(0);
    expect(hustlePayout(purchased.state, HUSTLE_DEFINITIONS, 'troll-network')).toBeCloseTo(beforePayout * 2, 8);

    const reset = commitRugPull(
      { ...purchased.state, peakValuation: RUG_PULL_CONFIG.unlockValuation },
      HUSTLE_DEFINITIONS
    ).state;
    expect(reset.leveragePurchases).toEqual([]);
  });

  it('applies committed Net Worth to the first fresh-run payout', () => {
    const result = commitRugPull(
      {
        ...createInitialGameState(HUSTLE_DEFINITIONS),
        valuation: RUG_PULL_CONFIG.unlockValuation,
        peakValuation: RUG_PULL_CONFIG.unlockValuation,
      },
      HUSTLE_DEFINITIONS
    );
    const activeState = activateHustle(result.state, 'troll-network');
    const advanced = advanceGame(activeState, HUSTLE_DEFINITIONS, 2_000);
    const expectedPayout = trollDefinition.basePayout *
      wealthAdvantageMultiplier(result.state.netWorth);

    expect(result.state.netWorth).toBe(1_000_000);
    expect(advanced.events.length).toBe(1);
    expect(advanced.events[0].payout).toBeCloseTo(expectedPayout, 6);
    expect(advanced.state.valuation).toBeCloseTo(expectedPayout, 6);
    expect(valuationPerSecond(activeState, HUSTLE_DEFINITIONS)).toBeCloseTo(
      expectedPayout / trollDefinition.cadenceSeconds,
      6
    );
  });

  it('derives enterprise intensity and stage from the shared presentation formula', () => {
    const startingPresentation = deriveEnterprisePresentation(
      createInitialGameState(HUSTLE_DEFINITIONS),
      HUSTLE_DEFINITIONS
    );
    const advancedPresentation = deriveEnterprisePresentation(
      {
        ...createInitialGameState(HUSTLE_DEFINITIONS, 100_000),
        valuation: 2_000_000,
        peakValuation: 2_000_000,
        hustles: {
          ...createInitialGameState(HUSTLE_DEFINITIONS).hustles,
          'troll-network': {
            ...createInitialGameState(HUSTLE_DEFINITIONS).hustles['troll-network'],
            units: 10,
            isAutomated: true,
            reachedMilestones: ['troll-network-10'],
          },
        },
      },
      HUSTLE_DEFINITIONS
    );

    expect(startingPresentation.enterpriseStage).toBe('scrappy');
    expect(advancedPresentation.enterpriseIntensity).toBeGreaterThan(startingPresentation.enterpriseIntensity);
  });

  it('runs the pure balance simulator with strategy timelines', () => {
    const result = runBalanceSimulation({
      strategy: 'automation-rush',
      durationMs: 4 * 60 * 1000,
      stepMs: 500,
      definitions: HUSTLE_DEFINITIONS,
    });

    expect(result.timeline.length).toBeGreaterThan(2);
    expect(result.timeline.some((entry) => entry.action.includes('automate troll-network'))).toBeTrue();
    expect(result.finalState.peakValuation).toBeGreaterThan(0);
  });
});
