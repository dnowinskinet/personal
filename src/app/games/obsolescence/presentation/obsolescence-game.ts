/**
 * Gate A — the lineup decision prototype.
 *
 * Angular HTML and colored blocks. **If this looks good, effort went to the wrong place.** The gate
 * question is whether composing a lineup under a capacity ceiling is interesting, and art would
 * only confound the answer. The renderer decision is deliberately deferred to Gate C.
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LARK_PACK } from '../content/lark';
import { DEFAULT_DECISIONS, DOCTRINES } from '../content/doctrines';
import { SCENARIOS } from '../content/scenarios';
import {
  resolveQuarter,
  type BatteryArchitecture,
  type ClaimPosture,
  type ComponentTier,
  type ConnectorStance,
  type OfferDecisions,
  type QuarterDecisions,
  type SupplierChoice,
} from '../sim/index';
import {
  capacityBars,
  coveragePercent,
  dimensionBars,
  segmentBriefs,
  segmentRows,
  variantsInSlotOrder,
} from './quarter-view-model';

@Component({
  selector: 'obsolescence-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './obsolescence-game.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObsolescenceGameComponent {
  readonly pack = LARK_PACK;
  readonly doctrines = DOCTRINES;
  readonly variants = variantsInSlotOrder(LARK_PACK);
  readonly briefs = segmentBriefs(LARK_PACK.segments);

  readonly scenarios = SCENARIOS;

  readonly decisions = signal<QuarterDecisions>(DEFAULT_DECISIONS);
  readonly seed = signal(4242);
  readonly locked = signal(false);
  /** Set when a pre-registered scenario is loaded, so its cause can be revealed after answering. */
  readonly activeScenario = signal<string | null>(null);
  readonly causeRevealed = signal(false);

  readonly scenarioDetail = computed(() =>
    this.scenarios.find((entry) => entry.id === this.activeScenario()) ?? null
  );

  readonly capacity = computed(() => capacityBars(this.pack, this.decisions()));
  readonly coverage = computed(() => coveragePercent(this.pack, this.decisions()));
  readonly overCommitted = computed(() => this.capacity().some((bar) => bar.over));

  readonly outcome = computed(() =>
    this.locked() ? resolveQuarter(this.pack, this.decisions(), this.seed()) : null
  );
  readonly dimensions = computed(() => {
    const result = this.outcome();
    return result === null ? [] : dimensionBars(result);
  });
  readonly segments = computed(() => {
    const result = this.outcome();
    return result === null ? [] : segmentRows(this.pack, result);
  });

  readonly batteryOptions: readonly BatteryArchitecture[] = ['modular', 'sealed'];
  readonly connectorOptions: readonly ConnectorStance[] = ['universal', 'proprietary'];
  readonly supplierOptions: readonly SupplierChoice[] = ['incumbent', 'aggressive'];
  readonly tierOptions: readonly ComponentTier[] = ['basic', 'standard', 'premium'];
  readonly claimOptions: readonly ClaimPosture[] = ['conservative', 'confident', 'aggressive'];

  offerFor(variantId: string): OfferDecisions | undefined {
    return this.decisions().offers[variantId];
  }

  setBattery(value: BatteryArchitecture): void {
    this.update((current) => ({ ...current, platform: { ...current.platform, battery: value } }));
  }

  setConnector(value: ConnectorStance): void {
    this.update((current) => ({ ...current, platform: { ...current.platform, connector: value } }));
  }

  setSupplier(value: SupplierChoice): void {
    this.update((current) => ({ ...current, platform: { ...current.platform, supplier: value } }));
  }

  setReserve(value: number): void {
    this.update((current) => ({ ...current, reserveSplit: value / 100 }));
  }

  setInvestigation(value: number): void {
    this.update((current) => ({ ...current, batteryInvestigation: value }));
  }

  toggleOffer(variantId: string, mandatory: boolean): void {
    if (mandatory) {
      return;
    }
    this.updateOffer(variantId, (offer) => ({ ...offer, included: !offer.included }));
  }

  setPrice(variantId: string, value: number): void {
    this.updateOffer(variantId, (offer) => ({ ...offer, price: value }));
  }

  setTier(variantId: string, value: ComponentTier): void {
    this.updateOffer(variantId, (offer) => ({ ...offer, tier: value }));
  }

  setSupportYears(variantId: string, value: number): void {
    this.updateOffer(variantId, (offer) => ({ ...offer, supportYears: value }));
  }

  setClaim(variantId: string, value: ClaimPosture): void {
    this.updateOffer(variantId, (offer) => ({ ...offer, claim: value }));
  }

  applyDoctrine(index: number): void {
    const doctrine = this.doctrines[index];
    if (doctrine !== undefined) {
      this.decisions.set(doctrine.decisions);
      this.locked.set(false);
    }
  }

  /**
   * Loads a pre-registered scenario and resolves it immediately.
   *
   * The expected cause stays hidden until the tester asks for it — Gate A condition 3 is only
   * honest if the answer is committed to before the reveal.
   */
  loadScenario(id: string): void {
    const entry = this.scenarios.find((candidate) => candidate.id === id);
    if (entry === undefined) {
      return;
    }
    this.decisions.set(entry.decisions);
    this.seed.set(entry.seed);
    this.activeScenario.set(entry.id);
    this.causeRevealed.set(false);
    this.locked.set(true);
  }

  revealCause(): void {
    this.causeRevealed.set(true);
  }

  lock(): void {
    this.locked.set(true);
  }

  reset(): void {
    this.decisions.set(DEFAULT_DECISIONS);
    this.locked.set(false);
  }

  nextSeed(): void {
    this.seed.update((current) => current + 1);
    this.locked.set(false);
  }

  /** Number input helper — templates hand back strings. */
  asNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private update(change: (current: QuarterDecisions) => QuarterDecisions): void {
    this.decisions.update(change);
    this.locked.set(false);
    // Editing anything means you are no longer running the pre-registered scenario.
    this.activeScenario.set(null);
    this.causeRevealed.set(false);
  }

  private updateOffer(variantId: string, change: (offer: OfferDecisions) => OfferDecisions): void {
    this.update((current) => {
      const existing = current.offers[variantId];
      if (existing === undefined) {
        return current;
      }
      return { ...current, offers: { ...current.offers, [variantId]: change(existing) } };
    });
  }
}
