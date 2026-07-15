import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EmpireRendererRequest } from '../../../../../host/empire-renderer-contract';
import { GamePresentationSnapshot } from '../../../../../presentation/game-presentation';

export type InfluenceExtractionView = Pick<
  GamePresentationSnapshot,
  | 'extraction'
  | 'extractionRateLabel'
  | 'extractionNextCostLabel'
  | 'extractionDurationLabel'
  | 'extractionRemainingLabel'
  | 'extractionOutputLabel'
  | 'extractionNextOutputLabel'
  | 'extractionProgressScale'
>;

@Component({
  selector: 'app-influence-extraction',
  standalone: true,
  templateUrl: './influence-extraction.component.html',
  styleUrl: './influence-extraction.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfluenceExtractionComponent {
  @Input({ required: true }) view!: InfluenceExtractionView;
  @Output() readonly request = new EventEmitter<EmpireRendererRequest>();
}
