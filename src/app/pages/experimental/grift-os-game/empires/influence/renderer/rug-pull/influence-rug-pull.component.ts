import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EmpireRendererRequest } from '../../../../host/empire-renderer-contract';
import { GamePresentationSnapshot } from '../../../../presentation/game-presentation';
import { InfluenceExtractionComponent } from './extraction/influence-extraction.component';

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
  | 'extraction'
  | 'extractionRateLabel'
  | 'extractionNextCostLabel'
  | 'extractionDurationLabel'
  | 'extractionRemainingLabel'
  | 'extractionOutputLabel'
  | 'extractionNextOutputLabel'
  | 'extractionProgressScale'
  | 'resetHustleCount'
  | 'resetAutomationCount'
  | 'resetMilestoneCount'
>;

@Component({
  selector: 'app-influence-rug-pull',
  standalone: true,
  imports: [InfluenceExtractionComponent],
  templateUrl: './influence-rug-pull.component.html',
  styleUrl: './influence-rug-pull.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfluenceRugPullComponent {
  @Input({ required: true }) view!: InfluenceRugPullView;
  @Output() readonly request = new EventEmitter<EmpireRendererRequest>();
}
