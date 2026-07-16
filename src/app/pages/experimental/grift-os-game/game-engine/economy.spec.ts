import { HUSTLE_DEFINITIONS } from '../content/hustle-definitions';
import { RUG_PULL_CONFIG } from '../content/rug-pull-preview';
import {
  GRIFT_OS_HUSTLE_TUNING,
  GRIFT_OS_MILESTONE_TUNING,
  GRIFT_OS_PRESTIGE_TUNING,
} from '../content/economy-tuning';
import { runBalanceSimulation, runCampaignSimulation } from './balance-sim';
import {
  extractionRate,
  startExtractionPreparation,
} from './extraction';
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
import {
  collectActiveModifiers,
  resolveModifierContext,
  wealthAdvantageMultiplier,
  wealthAdvantageMultiplierForHustle,
} from './modifiers';
import { buyLeverage } from './leverage';
import { deriveEnterprisePresentation } from './presentation';
import { campaignComplete, newlyUnlockedMechanics } from './progression';
import { commitRugPull, createRugPullPreview, projectedNetWorthGain } from './rug-pull';
import { GriftOsGameState } from './types';

describe('GriftOS Hustle economy', () => {
  const trollDefinition = HUSTLE_DEFINITIONS[0];
  const podcastDefinition = HUSTLE_DEFINITIONS[1];
  const cultureWarDefinition = HUSTLE_DEFINITIONS[2];
  const finalDefinition = HUSTLE_DEFINITIONS[11];

  it('creates the modern starting state', () => {
    const state = createInitialGameState(HUSTLE_DEFINITIONS);

    expect(HUSTLE_DEFINITIONS.length).toBe(12);
    expect(state.valuation).toBe(0);
    expect(state.peakValuation).toBe(0);
    expect(state.netWorth).toBe(0);
    expect(state.peakNetWorth).toBe(0);
    expect(state.hustles['online-rage-farm'].scaleCount).toBe(1);
    expect(state.hustles['online-rage-farm'].isAutomated).toBeFalse();

    for (const definition of HUSTLE_DEFINITIONS.slice(1)) {
      expect(state.hustles[definition.id].scaleCount).toBe(0);
      expect(state.hustles[definition.id].isAutomated).toBeFalse();
    }
  });

  it('defines the twelve-Hustle ladder with durable nouns and transaction grammar', () => {
    expect(HUSTLE_DEFINITIONS.map((definition) => definition.id)).toEqual([
      'online-rage-farm',
      'paid-friend-club',
      'autograph-factory',
      'paid-shoutout-studio',
      'outrage-podcast',
      'get-rich-books',
      'paid-endorsement-racket',
      'vip-experience-tour',
      'success-university',
      'mlm-ambassador-program',
      'debt-club',
      'subscriber-towns',
    ]);
    expect(HUSTLE_DEFINITIONS.map((definition) => ({
      name: definition.name,
      unitPlural: definition.unitPlural,
      manualActionLabel: definition.manualActionLabel,
      automationName: definition.automationName,
      automationActivityLabel: definition.automationActivityLabel,
    }))).toEqual([
      { name: 'Online Rage Farm', unitPlural: 'Followers', manualActionLabel: 'Post a Product Link', automationName: 'Auto-Poster', automationActivityLabel: 'posting links' },
      { name: 'Paid Friend Club', unitPlural: 'Members', manualActionLabel: 'Charge a Fee', automationName: 'Auto-Renewal', automationActivityLabel: 'renewing memberships' },
      { name: 'Autograph Factory', unitPlural: 'Editions', manualActionLabel: 'Sign Memorabilia', automationName: 'Autopen', automationActivityLabel: 'signing memorabilia' },
      { name: 'Paid Shoutout Studio', unitPlural: 'Booking Slots', manualActionLabel: 'Record a Shoutout', automationName: 'AI Double', automationActivityLabel: 'generating shoutouts' },
      { name: 'Outrage Podcast', unitPlural: 'Episodes', manualActionLabel: 'Sell a Sponsor Spot', automationName: 'Ad Sales Team', automationActivityLabel: 'booking sponsors' },
      { name: 'Get-Rich Books', unitPlural: 'Titles', manualActionLabel: 'Publish the Method', automationName: 'Ghostwriter', automationActivityLabel: 'publishing under your name' },
      { name: 'Paid Endorsement Racket', unitPlural: 'Brand Deals', manualActionLabel: 'Endorse a Product', automationName: 'AI Spokesperson', automationActivityLabel: 'endorsing products' },
      { name: 'VIP Experience Tour', unitPlural: 'Venues', manualActionLabel: 'Sell VIP Tickets', automationName: 'Hologram Headliner', automationActivityLabel: 'headlining without you' },
      { name: 'Success University', unitPlural: 'Campuses', manualActionLabel: 'Enroll a Student', automationName: 'Admissions Office', automationActivityLabel: 'enrolling students' },
      { name: 'MLM Ambassador Program', unitPlural: 'Branches', manualActionLabel: 'Charge a Sign-Up Fee', automationName: 'Recruiting Team', automationActivityLabel: 'recruiting ambassadors' },
      { name: 'Debt Club', unitPlural: 'Loan Books', manualActionLabel: 'Collect Fees', automationName: 'Collections Team', automationActivityLabel: 'collecting fees' },
      { name: 'Subscriber Towns', unitPlural: 'Towns', manualActionLabel: 'Charge HOA Dues', automationName: 'HOA Office', automationActivityLabel: 'collecting HOA dues' },
    ]);
    expect(finalDefinition.audio?.ambientSignature).toBe('platform-exchange');
    expect(trollDefinition.scaleDisplayMultiplier).toBe(1_000);
    expect(trollDefinition.milestones.map((milestone) => milestone.requiredScaleCount)).toEqual([
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
        initialScaleCount: definition.initialScaleCount,
        unlockNetWorth: definition.unlockNetWorth,
      }).toEqual(GRIFT_OS_HUSTLE_TUNING[definition.id]);

      expect(definition.milestones.map((milestone) => ({
        requiredScaleCount: milestone.requiredScaleCount,
        kind: milestone.reward.kind,
        value: milestone.reward.value,
      }))).toEqual(GRIFT_OS_MILESTONE_TUNING[definition.id].map((milestone) => ({
        requiredScaleCount: milestone.requiredScaleCount,
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

  it('buys Hustle scaleCount and records reached milestones', () => {
    const state = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: 2_000,
      peakValuation: 2_000,
    };

    const result = buyHustle(state, HUSTLE_DEFINITIONS, 'online-rage-farm', 9);

    expect(result.quantityPurchased).toBe(9);
    expect(result.state.hustles['online-rage-farm'].scaleCount).toBe(10);
    expect(result.state.hustles['online-rage-farm'].reachedMilestones).toContain('online-rage-farm-10');
    expect(result.milestonesReached).toEqual([
      { hustleId: 'online-rage-farm', milestoneId: 'online-rage-farm-10' },
    ]);
  });

  it('allows any Hustle to be established once its valuation cost is affordable', () => {
    const state = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: 2_000_000,
      peakValuation: 2_000_000,
    };

    const result = buyHustle(state, HUSTLE_DEFINITIONS, 'get-rich-books', 1);

    expect(result.quantityPurchased).toBe(1);
    expect(result.state.hustles['get-rich-books'].scaleCount).toBe(1);
    expect(result.state.netWorth).toBe(0);
  });

  it('keeps Hustles out of Rug Pull unlock forecasts', () => {
    const unlocks = newlyUnlockedMechanics(0, 1_000_000_000_000, HUSTLE_DEFINITIONS);

    for (const definition of HUSTLE_DEFINITIONS) {
      expect(unlocks.some((unlock) => unlock.id === definition.id)).toBeFalse();
    }
  });

  it('applies milestone and Net Worth modifiers through the central stack', () => {
    const milestoneState = buyHustle(
      {
        ...createInitialGameState(HUSTLE_DEFINITIONS, 100_000),
        valuation: 2_000,
        peakValuation: 2_000,
      },
      HUSTLE_DEFINITIONS,
      'online-rage-farm',
      9
    ).state;

    const modifiers = collectActiveModifiers(milestoneState, HUSTLE_DEFINITIONS);
    const payout = hustlePayout(milestoneState, HUSTLE_DEFINITIONS, 'online-rage-farm');

    expect(modifiers.map((modifier) => modifier.id)).toContain('online-rage-farm-scale-10-output');
    expect(wealthAdvantageMultiplier(100_000, HUSTLE_DEFINITIONS)).toBeCloseTo(3.0, 2);
    expect(payout).toBeGreaterThan(trollDefinition.basePayout * 10 * 1.5);
  });

  it('keeps pass-scoped modifier results identical to direct calculations', () => {
    const initial = createInitialGameState(HUSTLE_DEFINITIONS, 1_000_000_000_000);
    const state: GriftOsGameState = {
      ...initial,
      valuation: 5_000_000_000_000,
      peakValuation: 5_000_000_000_000,
      leveragePurchases: [...initial.leveragePurchases, 'attention-loop'],
      extractionPreparation: {
        completedStages: 0,
        isActive: true,
        progressMs: 1_000,
      },
      hustles: {
        ...initial.hustles,
        'online-rage-farm': {
          ...initial.hustles['online-rage-farm'],
          scaleCount: 10,
          isActive: true,
          isAutomated: true,
          reachedMilestones: ['online-rage-farm-10'],
        },
      },
    };
    const modifierContext = resolveModifierContext(state, HUSTLE_DEFINITIONS);

    for (const definition of HUSTLE_DEFINITIONS) {
      expect(hustlePayout(state, HUSTLE_DEFINITIONS, definition.id, modifierContext))
        .toBe(hustlePayout(state, HUSTLE_DEFINITIONS, definition.id));
      expect(effectiveCadenceSeconds(state, HUSTLE_DEFINITIONS, definition.id, modifierContext))
        .toBe(effectiveCadenceSeconds(state, HUSTLE_DEFINITIONS, definition.id));
      expect(nextHustleCost(
        definition,
        state.hustles[definition.id].scaleCount,
        state,
        HUSTLE_DEFINITIONS,
        modifierContext
      )).toBe(nextHustleCost(
        definition,
        state.hustles[definition.id].scaleCount,
        state,
        HUSTLE_DEFINITIONS
      ));
      expect(automationCost(state, HUSTLE_DEFINITIONS, definition.id, modifierContext))
        .toBe(automationCost(state, HUSTLE_DEFINITIONS, definition.id));
    }
  });

  it('uses fresh modifiers immediately after a level crosses a milestone', () => {
    const initial = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: 2_000,
      peakValuation: 2_000,
    };
    const beforeContext = resolveModifierContext(initial, HUSTLE_DEFINITIONS);
    const beforePayout = hustlePayout(
      initial,
      HUSTLE_DEFINITIONS,
      'online-rage-farm',
      beforeContext
    );
    const leveled = buyHustle(
      initial,
      HUSTLE_DEFINITIONS,
      'online-rage-farm',
      9
    ).state;
    const afterContext = resolveModifierContext(leveled, HUSTLE_DEFINITIONS);
    const afterPayout = hustlePayout(
      leveled,
      HUSTLE_DEFINITIONS,
      'online-rage-farm',
      afterContext
    );

    expect(leveled.hustles['online-rage-farm'].scaleCount).toBe(10);
    expect(afterPayout).toBe(hustlePayout(
      leveled,
      HUSTLE_DEFINITIONS,
      'online-rage-farm'
    ));
    expect(afterPayout).toBeGreaterThan(beforePayout * 10);
  });

  it('makes $1T Net Worth a decisive post-victory advantage without changing the frontier rule', () => {
    expect(wealthAdvantageMultiplier(1_000_000_000_000, HUSTLE_DEFINITIONS))
      .toBeCloseTo(253.38, 2);
    expect(wealthAdvantageMultiplierForHustle(
      1_000_000_000_000,
      finalDefinition,
      HUSTLE_DEFINITIONS
    ))
      .toBeCloseTo(64.1, 2);
  });

  it('requires manual activation before production begins', () => {
    const initialState = createInitialGameState(HUSTLE_DEFINITIONS);
    const idleResult = advanceGame(initialState, HUSTLE_DEFINITIONS, 2_000);

    expect(idleResult.events.length).toBe(0);
    expect(idleResult.state.valuation).toBe(0);

    const activeState = activateHustle(initialState, 'online-rage-farm');
    const activeResult = advanceGame(activeState, HUSTLE_DEFINITIONS, 2_000);

    expect(activeResult.events).toEqual([
      { hustleId: 'online-rage-farm', payout: 0.0025, cyclesCompleted: 1 },
    ]);
    expect(activeResult.state.valuation).toBe(0.0025);
  });

  it('manual Hustles complete one cycle and become ready again', () => {
    const activeState = activateHustle(
      createInitialGameState(HUSTLE_DEFINITIONS),
      'online-rage-farm'
    );

    const result = advanceGame(activeState, HUSTLE_DEFINITIONS, 20_000);

    expect(result.events.length).toBe(1);
    expect(result.state.valuation).toBe(0.0025);
    expect(result.state.hustles['online-rage-farm'].isActive).toBeFalse();
    expect(result.state.hustles['online-rage-farm'].progressMs).toBe(0);
  });

  it('automation is priced directly and restarts completed cycles', () => {
    const state = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: trollDefinition.automationCost,
      peakValuation: trollDefinition.automationCost,
    };

    expect(automationCost(state, HUSTLE_DEFINITIONS, 'online-rage-farm')).toBe(0.5);
    expect(canBuyAutomation(state, HUSTLE_DEFINITIONS, 'online-rage-farm')).toBeTrue();

    const automated = buyAutomation(state, HUSTLE_DEFINITIONS, 'online-rage-farm').state;
    const result = advanceGame(automated, HUSTLE_DEFINITIONS, 4_500);

    expect(result.events).toEqual([
      { hustleId: 'online-rage-farm', payout: 0.0025, cyclesCompleted: 2 },
    ]);
    expect(result.state.valuation).toBe(0.005);
    expect(result.state.hustles['online-rage-farm'].isAutomated).toBeTrue();
    expect(result.state.hustles['online-rage-farm'].isActive).toBeTrue();
    expect(result.state.hustles['online-rage-farm'].progressMs).toBe(500);
  });

  it('calculates displayed rate from active and automated Hustles only', () => {
    const idle = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: 500,
      peakValuation: 500,
    };

    expect(valuationPerSecond(idle, HUSTLE_DEFINITIONS)).toBe(0);

    const active = activateHustle(idle, 'online-rage-farm');

    expect(valuationPerSecond(active, HUSTLE_DEFINITIONS)).toBeCloseTo(
      trollDefinition.basePayout / trollDefinition.cadenceSeconds,
      6
    );
    expect(effectiveCadenceSeconds(active, HUSTLE_DEFINITIONS, 'online-rage-farm')).toBe(2);
  });

  it('previews and commits the first campaign Rug Pull', () => {
    const state = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: RUG_PULL_CONFIG.unlockValuation,
      peakValuation: RUG_PULL_CONFIG.unlockValuation,
    };

    const preview = createRugPullPreview(state, HUSTLE_DEFINITIONS);
    const result = commitRugPull(state, HUSTLE_DEFINITIONS);

    expect(preview.isAvailable).toBeTrue();
    expect(projectedNetWorthGain(50_000_000, 0, 0.1, HUSTLE_DEFINITIONS)).toBe(0);
    expect(projectedNetWorthGain(100_000_000, 0, 0.1, HUSTLE_DEFINITIONS)).toBe(1_000_000);
    expect(projectedNetWorthGain(200_000_000, 0, 0.1, HUSTLE_DEFINITIONS)).toBe(1_681_792);
    expect(result.netWorthGained).toBe(1_000_000);
    expect(result.state.valuation).toBe(0);
    expect(result.state.netWorth).toBe(1_000_000);
    expect(result.state.rugPullCount).toBe(1);
    expect(result.state.hustles['online-rage-farm'].scaleCount).toBe(1);
  });

  it('requires timed, output-diverting preparation before extraction improves', () => {
    const target = RUG_PULL_CONFIG.unlockValuation;
    const readyState = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: target,
      peakValuation: target,
      hustles: {
        ...createInitialGameState(HUSTLE_DEFINITIONS).hustles,
        'online-rage-farm': {
          ...createInitialGameState(HUSTLE_DEFINITIONS).hustles['online-rage-farm'],
          isActive: true,
          isAutomated: true,
        },
      },
    };
    const preparation = startExtractionPreparation(readyState, HUSTLE_DEFINITIONS);

    expect(preparation.started).toBeTrue();
    expect(preparation.totalCost).toBe(3_000_000);
    expect(extractionRate(preparation.state, HUSTLE_DEFINITIONS)).toBe(0.1);
    expect(hustlePayout(preparation.state, HUSTLE_DEFINITIONS, 'online-rage-farm')).toBeCloseTo(0.001875, 8);

    const completed = advanceGame(preparation.state, HUSTLE_DEFINITIONS, 2 * 60 * 60 * 1000);

    expect(completed.state.extractionPreparation.completedStages).toBe(1);
    expect(completed.state.extractionPreparation.isActive).toBeFalse();
    expect(extractionRate(completed.state, HUSTLE_DEFINITIONS)).toBeCloseTo(0.15, 8);
    expect(createRugPullPreview(completed.state, HUSTLE_DEFINITIONS).projectedNetWorthGain)
      .toBe(1_500_000);
  });

  it('spends current Net Worth on temporary Leverage without lowering the high-water mark', () => {
    const initial = createInitialGameState(HUSTLE_DEFINITIONS, 1_000_000);
    const eligibleState = {
      ...initial,
      valuation: 25_000_000,
      peakValuation: 25_000_000,
      hustles: {
        ...initial.hustles,
        'online-rage-farm': { ...initial.hustles['online-rage-farm'], isAutomated: true },
        'paid-friend-club': { ...initial.hustles['paid-friend-club'], scaleCount: 1, isAutomated: true },
        'autograph-factory': { ...initial.hustles['autograph-factory'], scaleCount: 1, isAutomated: true },
        'paid-shoutout-studio': { ...initial.hustles['paid-shoutout-studio'], scaleCount: 1 },
      },
    };
    const beforePayout = hustlePayout(eligibleState, HUSTLE_DEFINITIONS, 'online-rage-farm');
    const purchased = buyLeverage(eligibleState, 'attention-loop', HUSTLE_DEFINITIONS);

    expect(purchased.purchased).toBeTrue();
    expect(purchased.state.valuation).toBe(25_000_000);
    expect(purchased.state.netWorth).toBe(750_000);
    expect(purchased.state.peakNetWorth).toBe(1_000_000);
    expect(createRugPullPreview(purchased.state, HUSTLE_DEFINITIONS).requiredPeakValuation)
      .toBe(3_000_000_000);
    expect(hustlePayout(purchased.state, HUSTLE_DEFINITIONS, 'online-rage-farm'))
      .toBeGreaterThan(beforePayout);

    const reset = commitRugPull(
      { ...purchased.state, peakValuation: 3_000_000_000 },
      HUSTLE_DEFINITIONS
    ).state;
    expect(reset.leveragePurchases).toEqual([]);
    expect(reset.netWorth).toBe(30_750_000);
    expect(reset.peakNetWorth).toBe(30_750_000);
  });

  it('uses current Net Worth for the campaign objective rather than the high-water mark', () => {
    expect(campaignComplete(750_000_000_000, HUSTLE_DEFINITIONS)).toBeFalse();
    expect(campaignComplete(1_000_000_000_000, HUSTLE_DEFINITIONS)).toBeTrue();
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
    const activeState = activateHustle(result.state, 'online-rage-farm');
    const advanced = advanceGame(activeState, HUSTLE_DEFINITIONS, 2_000);
    const expectedPayout = trollDefinition.basePayout *
      wealthAdvantageMultiplier(result.state.netWorth, HUSTLE_DEFINITIONS);

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
          'online-rage-farm': {
            ...createInitialGameState(HUSTLE_DEFINITIONS).hustles['online-rage-farm'],
            scaleCount: 10,
            isAutomated: true,
            reachedMilestones: ['online-rage-farm-10'],
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
      mechanics: HUSTLE_DEFINITIONS,
    });

    expect(result.timeline.length).toBeGreaterThan(2);
    expect(result.timeline.some((entry) => entry.action.includes('automate online-rage-farm'))).toBeTrue();
    expect(result.finalState.peakValuation).toBeGreaterThan(0);
  });

  it('acquires and automates the final Hustle before the intermittent campaign victory Rug', () => {
    const result = runCampaignSimulation({
      profile: 'morning-evening',
      strategy: 'natural',
      rugPullStrategy: 'prepared',
      maxWallClockMs: 10 * 24 * 60 * 60 * 1000,
      mechanics: HUSTLE_DEFINITIONS,
    });
    const finalRugAt = result.rugPulls.at(-1)?.elapsedMs ?? 0;

    expect(result.reachedTarget).toBeTrue();
    expect(result.timings.hustleAcquiredAtMs['subscriber-towns']).toBeLessThan(finalRugAt);
    expect(result.timings.automationAtMs['subscriber-towns']).toBeLessThan(finalRugAt);
    expect(result.timings.leverageAtMs).toEqual({});
  });
});
