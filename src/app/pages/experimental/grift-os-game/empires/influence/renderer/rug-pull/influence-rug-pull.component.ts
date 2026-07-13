import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EmpireRendererRequest } from '../../../../host/empire-renderer-contract';
import { GamePresentationSnapshot } from '../../../../presentation/game-presentation';
import { InfluenceFounderTakeComponent } from './founder-take/influence-founder-take.component';

export type InfluenceRugPullView = Pick<
  GamePresentationSnapshot,
  | 'valuationLabel'
  | 'peakValuationLabel'
  | 'leveragePurchaseCount'
  | 'rugPullPreview'
  | 'rugPullNetWorthGainLabel'
  | 'rugPullResultingNetWorthLabel'
  | 'rugPullTargetLabel'
  | 'rugPullWealthAdvantageLabel'
  | 'rugPullRecoveryMultiplierLabel'
  | 'founderTake'
  | 'founderTakeRateLabel'
  | 'founderTakeNextCostLabel'
  | 'founderTakeDurationLabel'
  | 'founderTakeRemainingLabel'
  | 'founderTakeOutputLabel'
  | 'founderTakeNextOutputLabel'
  | 'founderTakeProgressScale'
  | 'resetHustleCount'
  | 'resetAutomationCount'
  | 'resetMilestoneCount'
>;

@Component({
  selector: 'app-influence-rug-pull',
  standalone: true,
  imports: [InfluenceFounderTakeComponent],
  templateUrl: './influence-rug-pull.component.html',
  styleUrl: './influence-rug-pull.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfluenceRugPullComponent {
  @Input({ required: true }) view!: InfluenceRugPullView;
  @Output() readonly request = new EventEmitter<EmpireRendererRequest>();
}
