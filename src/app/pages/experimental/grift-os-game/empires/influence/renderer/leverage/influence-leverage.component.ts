import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EmpireRendererRequest } from '../../../../host/empire-renderer-contract';
import { LeverageDealView } from '../../../../presentation/game-presentation';

@Component({
  selector: 'app-influence-leverage',
  standalone: true,
  templateUrl: './influence-leverage.component.html',
  styleUrl: './influence-leverage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfluenceLeverageComponent {
  @Input({ required: true }) deals!: readonly LeverageDealView[];
  @Input({ required: true }) purchaseCount!: number;
  @Output() readonly request = new EventEmitter<EmpireRendererRequest>();
}
