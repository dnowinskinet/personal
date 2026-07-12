import { GRIFT_OS_COPY } from '../../content/game-copy';
import { GRIFT_OS_HUSTLE_TUNING, GRIFT_OS_MILESTONE_TUNING } from '../../content/economy-tuning';
import { HUSTLE_DEFINITIONS } from '../../content/hustle-definitions';
import { LEVERAGE_DEFINITIONS } from '../../content/leverage-definitions';
import { INFLUENCE_CONTENT_PACK } from './content/influence-content';
import { INFLUENCE_MECHANICS_PACK } from './mechanics/influence-mechanics';

describe('Influence empire packs', () => {
  it('keeps mechanical and content catalogs complete across the compatibility assembly', () => {
    expect(INFLUENCE_MECHANICS_PACK.id).toBe('influence');
    expect(INFLUENCE_CONTENT_PACK.id).toBe('influence');
    expect(Object.keys(INFLUENCE_MECHANICS_PACK.hustles)).toEqual(
      INFLUENCE_MECHANICS_PACK.hustleOrder
    );
    expect(Object.keys(INFLUENCE_CONTENT_PACK.hustles)).toEqual(
      INFLUENCE_MECHANICS_PACK.hustleOrder
    );
    expect(HUSTLE_DEFINITIONS.map((definition) => definition.id)).toEqual(
      INFLUENCE_MECHANICS_PACK.hustleOrder
    );
    expect(GRIFT_OS_COPY).toBe(INFLUENCE_CONTENT_PACK.game);
  });

  it('provides content for every mechanical milestone without changing compatibility tuning', () => {
    for (const hustleId of INFLUENCE_MECHANICS_PACK.hustleOrder) {
      const mechanicalMilestones = INFLUENCE_MECHANICS_PACK.milestones[hustleId];

      expect(GRIFT_OS_HUSTLE_TUNING[hustleId]).toBe(INFLUENCE_MECHANICS_PACK.hustles[hustleId]);
      expect(GRIFT_OS_MILESTONE_TUNING[hustleId].length).toBe(mechanicalMilestones.length);

      for (const milestone of mechanicalMilestones) {
        expect(INFLUENCE_CONTENT_PACK.milestones[milestone.id]).toBeDefined();
      }
    }
  });

  it('provides copy for every Leverage deal and mechanical modifier', () => {
    expect(LEVERAGE_DEFINITIONS.map((definition) => definition.id)).toEqual(
      INFLUENCE_MECHANICS_PACK.leverage.map((definition) => definition.id)
    );

    for (const deal of INFLUENCE_MECHANICS_PACK.leverage) {
      const content = INFLUENCE_CONTENT_PACK.leverage[deal.id];

      expect(content).toBeDefined();
      for (const modifier of deal.modifiers) {
        expect(content.modifierLabels[modifier.id]).toBeTruthy();
      }
    }
  });
});
