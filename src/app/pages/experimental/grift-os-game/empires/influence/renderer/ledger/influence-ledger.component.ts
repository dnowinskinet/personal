import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HustleId } from '../../../../game-engine/types';
import { EmpireRendererRequest } from '../../../../host/empire-renderer-contract';
import { HustleHorizonView, HustleViewModel } from '../../../../presentation/game-presentation';
import { InfluenceLaneComponent } from './influence-lane.component';

@Component({
  selector: 'app-influence-ledger',
  standalone: true,
  imports: [InfluenceLaneComponent],
  templateUrl: './influence-ledger.component.html',
  styleUrl: './influence-ledger.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfluenceLedgerComponent {
  @Input({ required: true }) rows!: readonly HustleViewModel[];
  @Input({ required: true }) countLabel!: string;
  @Input({ required: true }) selectedHustleId!: HustleId;
  @Input() horizon: HustleHorizonView | null = null;
  @Output() readonly request = new EventEmitter<EmpireRendererRequest>();

  trackRow(_index: number, row: HustleViewModel): HustleId { return row.id; }
  forward(request: EmpireRendererRequest): void { this.request.emit(request); }
}
