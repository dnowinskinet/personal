import { HUSTLE_DEFINITIONS } from '../content/hustle-definitions';
import { LEVERAGE_DEFINITIONS } from '../content/leverage-definitions';
import { INFLUENCE_ENGINE_MECHANICS } from '../empires/influence/mechanics/influence-mechanics';
import { createInitialGameState } from '../game-engine/economy';
import { GamePresentationFacade } from './game-presentation';

describe('GamePresentationFacade', () => {
  const facade = new GamePresentationFacade(
    HUSTLE_DEFINITIONS,
    LEVERAGE_DEFINITIONS,
    INFLUENCE_ENGINE_MECHANICS,
    [
      { id: 'hustles', label: 'Hustles' },
      { id: 'leverage', label: 'Leverage' },
      { id: 'rugPull', label: 'Rug Pull' },
    ]
  );

  it('returns a rule-complete fresh-run presentation without exposing unavailable modes', () => {
    const snapshot = facade.derive({
      state: createInitialGameState(INFLUENCE_ENGINE_MECHANICS),
      selectedHustleId: 'troll-network',
      selectedTab: 'rugPull',
      selectedContextOpen: false,
    });

    expect(snapshot.valuationLabel).toBe('$0');
    expect(snapshot.availableTabs.map((tab) => tab.id)).toEqual(['hustles']);
    expect(snapshot.selectedVisibleTab).toBe('hustles');
    expect(snapshot.selectedHustle.id).toBe('troll-network');
    expect(snapshot.selectedHustle.canManualAction).toBeTrue();
    expect(snapshot.selectedHustle.canBuyOne).toBeFalse();
    expect(snapshot.rugPullPreview.isAvailable).toBeFalse();
  });

  it('derives affordability, progress, context, and action labels from state and catalogs', () => {
    const initial = createInitialGameState(INFLUENCE_ENGINE_MECHANICS);
    const state = {
      ...initial,
      valuation: 100,
      peakValuation: 100,
      hustles: {
        ...initial.hustles,
        'troll-network': {
          ...initial.hustles['troll-network'],
          isActive: true,
          progressMs: 1_000,
        },
        'podcast-network': {
          ...initial.hustles['podcast-network'],
          units: 1,
        },
      },
    };
    const snapshot = facade.derive({
      state,
      selectedHustleId: 'podcast-network',
      selectedTab: 'hustles',
      selectedContextOpen: true,
    });

    expect(snapshot.ownedHustleCount).toBe(2);
    expect(snapshot.showSelectedContextSurface).toBeTrue();
    expect(snapshot.selectedHustle.id).toBe('podcast-network');
    expect(snapshot.hustleRows[0].progressPercent).toBe(50);
    expect(snapshot.hustleRows[0].progressAnimationDuration).toBe('2000ms');
    expect(snapshot.hustleRows[0].progressAnimationDelay).toBe('-1000ms');
    expect(snapshot.hustleRows[0].canBuyOne).toBeTrue();
    expect(snapshot.hustleRows[0].expansionButtonLabel).toContain('Add Follower');
  });

  it('memoizes an unchanged presentation input without mutating game state', () => {
    const state = createInitialGameState(INFLUENCE_ENGINE_MECHANICS);
    const input = {
      state,
      selectedHustleId: 'troll-network' as const,
      selectedTab: 'hustles' as const,
      selectedContextOpen: false,
    };

    expect(facade.derive(input)).toBe(facade.derive(input));
    expect(state.valuation).toBe(0);
  });
});
