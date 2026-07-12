import { INFLUENCE_CONTENT_PACK } from '../empires/influence/content/influence-content';
import { INFLUENCE_MECHANICS_PACK } from '../empires/influence/mechanics/influence-mechanics';
import { LeverageDefinition, ModifierDefinition } from '../game-engine/types';

// Compatibility export preserves current engine/component imports until Phase C.
export const LEVERAGE_DEFINITIONS: readonly LeverageDefinition[] =
  INFLUENCE_MECHANICS_PACK.leverage.map((mechanics) => {
    const content = INFLUENCE_CONTENT_PACK.leverage[mechanics.id];

    return {
      ...mechanics,
      name: content.name,
      description: content.description,
      modifiers: mechanics.modifiers.map((modifier): ModifierDefinition => ({
        ...modifier,
        label: requiredModifierLabel(content.modifierLabels, modifier.id),
        source: 'leverage',
      })),
    };
  });

function requiredModifierLabel(labels: Readonly<Record<string, string>>, modifierId: string): string {
  const label = labels[modifierId];

  if (!label) {
    throw new Error(`Missing Influence Leverage modifier content: ${modifierId}`);
  }

  return label;
}
