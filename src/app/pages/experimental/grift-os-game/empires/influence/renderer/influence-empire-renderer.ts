import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { GRIFT_OS_COPY } from '../../../content/game-copy';
import {
  EmpireActionDispatcher,
  EmpireRendererRequest,
  EmpireRendererHostView,
} from '../../../host/empire-renderer-contract';
import { GameAction } from '../../../presentation/game-action';
import {
  InfluenceStageComponent,
  InfluenceStageView,
} from './stage/influence-stage.component';
import { InfluenceLedgerComponent } from './ledger/influence-ledger.component';
import { InfluenceContextComponent } from './context/influence-context.component';
import { InfluenceModesComponent } from './modes/influence-modes.component';
import { InfluenceLeverageComponent } from './leverage/influence-leverage.component';
import { InfluenceRugPullComponent, InfluenceRugPullView } from './rug-pull/influence-rug-pull.component';

export interface InfluenceEmpireRendererView extends EmpireRendererHostView {
  copy: typeof GRIFT_OS_COPY;
}

@Component({
  selector: 'app-influence-empire-renderer',
  standalone: true,
  imports: [InfluenceStageComponent, InfluenceModesComponent, InfluenceLedgerComponent, InfluenceContextComponent, InfluenceLeverageComponent, InfluenceRugPullComponent],
  templateUrl: './influence-empire-renderer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'grift-influence-renderer',
    style: 'display: contents',
  },
})
export class InfluenceEmpireRendererComponent {
  @Input({ required: true }) view!: InfluenceEmpireRendererView;
  @Input({ required: true }) dispatch!: EmpireActionDispatcher;

  @ViewChild(InfluenceContextComponent) private selectedContext?: InfluenceContextComponent;
  @ViewChild('hustlesSurface') private hustlesSurface?: ElementRef<HTMLElement>;

  get copy(): typeof GRIFT_OS_COPY { return this.view.copy; }
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

  get rugPullView(): InfluenceRugPullView {
    const presentation = this.view.presentation;
    return {
      valuationLabel: presentation.valuationLabel,
      peakValuationLabel: presentation.peakValuationLabel,
      leveragePurchaseCount: presentation.leveragePurchaseCount,
      rugPullPreview: presentation.rugPullPreview,
      rugPullNetWorthGainLabel: presentation.rugPullNetWorthGainLabel,
      rugPullResultingNetWorthLabel: presentation.rugPullResultingNetWorthLabel,
      rugPullTargetLabel: presentation.rugPullTargetLabel,
      rugPullWealthAdvantageLabel: presentation.rugPullWealthAdvantageLabel,
      rugPullRecoveryMultiplierLabel: presentation.rugPullRecoveryMultiplierLabel,
      founderTake: presentation.founderTake,
      founderTakeRateLabel: presentation.founderTakeRateLabel,
      founderTakeNextCostLabel: presentation.founderTakeNextCostLabel,
      founderTakeDurationLabel: presentation.founderTakeDurationLabel,
      founderTakeRemainingLabel: presentation.founderTakeRemainingLabel,
      founderTakeOutputLabel: presentation.founderTakeOutputLabel,
      founderTakeNextOutputLabel: presentation.founderTakeNextOutputLabel,
      founderTakeProgressScale: presentation.founderTakeProgressScale,
      resetHustleCount: presentation.resetHustleCount,
      resetAutomationCount: presentation.resetAutomationCount,
      resetMilestoneCount: presentation.resetMilestoneCount,
    };
  }

  dispatchGameAction(action: GameAction, sourceEvent?: Event): void {
    this.dispatchRendererRequest({ action, sourceEvent });
  }

  dispatchRendererRequest(request: EmpireRendererRequest): void {
    this.dispatch(request);

    if (request.action.type === 'context.open') {
      window.setTimeout(() => this.selectedContext?.focusPanel(), 0);
      window.setTimeout(() => this.selectedContext?.focusPanel(), 80);
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

}
