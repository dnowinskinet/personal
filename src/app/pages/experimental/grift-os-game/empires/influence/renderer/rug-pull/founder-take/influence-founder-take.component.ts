import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EmpireRendererRequest } from '../../../../../host/empire-renderer-contract';
import { GamePresentationSnapshot } from '../../../../../presentation/game-presentation';

export type InfluenceFounderTakeView = Pick<
  GamePresentationSnapshot,
  | 'founderTake'
  | 'founderTakeRateLabel'
  | 'founderTakeNextCostLabel'
  | 'founderTakeDurationLabel'
  | 'founderTakeRemainingLabel'
  | 'founderTakeOutputLabel'
  | 'founderTakeNextOutputLabel'
  | 'founderTakeProgressScale'
>;

@Component({
  selector: 'app-influence-founder-take',
  standalone: true,
  templateUrl: './influence-founder-take.component.html',
  styleUrl: './influence-founder-take.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfluenceFounderTakeComponent {
  @Input({ required: true }) view!: InfluenceFounderTakeView;
  @Output() readonly request = new EventEmitter<EmpireRendererRequest>();
}
