import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EmpireRendererRequest } from '../../../../host/empire-renderer-contract';
import { GameAction } from '../../../../presentation/game-action';
import { HustleViewModel } from '../../../../presentation/game-presentation';

@Component({
  selector: 'app-influence-lane',
  standalone: true,
  templateUrl: './influence-lane.component.html',
  styleUrl: './influence-lane.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class InfluenceLaneComponent {
  @Input({ required: true }) row!: HustleViewModel;
  @Input() selected = false;
  @Output() readonly request = new EventEmitter<EmpireRendererRequest>();

  emit(action: GameAction, sourceEvent?: Event): void {
    this.request.emit({ action, sourceEvent });
  }

  get iconMonogram(): string {
    return this.row.definition.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  }
}
