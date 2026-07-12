import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { GRIFT_OS_COPY } from '../../../content/game-copy';
import { GameTabId } from '../../../game-engine/game-events';
import { HustleId } from '../../../game-engine/types';
import {
  EmpireActionDispatcher,
  EmpireRendererRequest,
  EmpireRendererHostView,
} from '../../../host/empire-renderer-contract';
import { GameAction } from '../../../presentation/game-action';
import {
  HustleViewModel,
} from '../../../presentation/game-presentation';
import {
  InfluenceStageComponent,
  InfluenceStageView,
} from './stage/influence-stage.component';
import { InfluenceLedgerComponent } from './ledger/influence-ledger.component';

export interface InfluenceEmpireRendererView extends EmpireRendererHostView {
  copy: typeof GRIFT_OS_COPY;
}

@Component({
  selector: 'app-influence-empire-renderer',
  standalone: true,
  imports: [InfluenceStageComponent, InfluenceLedgerComponent],
  templateUrl: '../../../grift-os-game.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'grift-influence-renderer',
    style: 'display: contents',
  },
})
export class InfluenceEmpireRendererComponent {
  @Input({ required: true }) view!: InfluenceEmpireRendererView;
  @Input({ required: true }) dispatch!: EmpireActionDispatcher;

  @ViewChild('selectedContextPanel') private selectedContextPanel?: ElementRef<HTMLElement>;
  @ViewChild('hustlesSurface') private hustlesSurface?: ElementRef<HTMLElement>;

  get copy(): typeof GRIFT_OS_COPY { return this.view.copy; }
  get presentation() { return this.view.presentation.enterprise; }
  get visualCondition() { return this.view.presentation.visualCondition; }
  get valuationFlyouts() { return this.view.valuationFlyouts; }
  get valuationLabel() { return this.view.presentation.valuationLabel; }
  get valuationPerSecondLabel() { return this.view.presentation.valuationPerSecondLabel; }
  get showNetWorth() { return this.view.presentation.showNetWorth; }
  get netWorthLabel() { return this.view.presentation.netWorthLabel; }
  get wealthAdvantageLabel() { return this.view.presentation.wealthAdvantageLabel; }
  get offlineReturn() { return this.view.offlineReturn; }
  get showModeTabs() { return this.view.presentation.showModeTabs; }
  get availableTabs() { return this.view.presentation.availableTabs; }
  get selectedVisibleTab() { return this.view.presentation.selectedVisibleTab; }
  get selectedContextOpen() { return this.view.selectedContextOpen; }
  get showPinnedSelectedContext() { return this.view.presentation.showPinnedSelectedContext; }
  get rugPullResolution() { return this.view.rugPullResolution; }
  get visibleHustleCountLabel() { return this.view.presentation.visibleHustleCountLabel; }
  get visibleHustleRows() { return this.view.presentation.visibleHustleRows; }
  get selectedHustleId() { return this.view.selectedHustleId; }
  get showNextHustleHorizon() { return this.view.presentation.showNextHustleHorizon; }
  get nextHustleHorizon() { return this.view.presentation.nextHustleHorizon; }
  get showSelectedContextSurface() { return this.view.presentation.showSelectedContextSurface; }
  get selectedHustle() { return this.view.presentation.selectedHustle; }
  get leverageDeals() { return this.view.presentation.leverageDeals; }
  get leveragePurchaseCount() { return this.view.presentation.leveragePurchaseCount; }
  get rugPullPreview() { return this.view.presentation.rugPullPreview; }
  get rugPullNetWorthGainLabel() { return this.view.presentation.rugPullNetWorthGainLabel; }
  get rugPullResultingNetWorthLabel() { return this.view.presentation.rugPullResultingNetWorthLabel; }
  get rugPullTargetLabel() { return this.view.presentation.rugPullTargetLabel; }
  get rugPullWealthAdvantageLabel() { return this.view.presentation.rugPullWealthAdvantageLabel; }
  get rugPullRecoveryMultiplierLabel() { return this.view.presentation.rugPullRecoveryMultiplierLabel; }
  get peakValuationLabel() { return this.view.presentation.peakValuationLabel; }
  get founderTake() { return this.view.presentation.founderTake; }
  get founderTakeRateLabel() { return this.view.presentation.founderTakeRateLabel; }
  get founderTakeNextCostLabel() { return this.view.presentation.founderTakeNextCostLabel; }
  get founderTakeDurationLabel() { return this.view.presentation.founderTakeDurationLabel; }
  get founderTakeRemainingLabel() { return this.view.presentation.founderTakeRemainingLabel; }
  get founderTakeOutputLabel() { return this.view.presentation.founderTakeOutputLabel; }
  get founderTakeNextOutputLabel() { return this.view.presentation.founderTakeNextOutputLabel; }
  get founderTakeProgressScale() { return this.view.presentation.founderTakeProgressScale; }
  get resetHustleCount() { return this.view.presentation.resetHustleCount; }
  get resetAutomationCount() { return this.view.presentation.resetAutomationCount; }
  get resetMilestoneCount() { return this.view.presentation.resetMilestoneCount; }

  get stageView(): InfluenceStageView {
    return {
      copy: this.copy,
      valuationLabel: this.valuationLabel,
      valuationPerSecondLabel: this.valuationPerSecondLabel,
      valuationFlyouts: this.valuationFlyouts,
      showNetWorth: this.showNetWorth,
      netWorthLabel: this.netWorthLabel,
      wealthAdvantageLabel: this.wealthAdvantageLabel,
      visualCondition: this.visualCondition,
    };
  }

  dispatchGameAction(action: GameAction, sourceEvent?: Event): void {
    this.dispatchRendererRequest({ action, sourceEvent });
  }

  dispatchRendererRequest(request: EmpireRendererRequest): void {
    this.dispatch(request);

    if (request.action.type === 'context.open') {
      window.setTimeout(() => this.selectedContextPanel?.nativeElement.focus(), 0);
      window.setTimeout(() => this.selectedContextPanel?.nativeElement.focus(), 80);
    } else if (request.action.type === 'rugPull.commit') {
      window.setTimeout(() => this.hustlesSurface?.nativeElement.focus(), 0);
    }
  }

  dismissOfflineReturn(): void {
    this.dispatch({ action: { type: 'offline.dismiss' } });
  }

  dismissRugPullResolution(): void {
    this.dispatch({ action: { type: 'rugPull.resolution.dismiss' } });
  }

  trackTab(_index: number, tab: { id: GameTabId; label: string }): GameTabId {
    return tab.id;
  }

  trackHustle(_index: number, row: HustleViewModel): HustleId {
    return row.id;
  }
}
