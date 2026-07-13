import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { GameTabId } from '../../../../game-engine/game-events';
import { EmpireRendererRequest } from '../../../../host/empire-renderer-contract';

export interface InfluenceModeView {
  id: GameTabId;
  label: string;
}

@Component({
  selector: 'app-influence-modes',
  standalone: true,
  templateUrl: './influence-modes.component.html',
  styleUrl: './influence-modes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class InfluenceModesComponent {
  @Input({ required: true }) modes!: readonly InfluenceModeView[];
  @Input({ required: true }) selectedModeId!: GameTabId;
  @Output() readonly request = new EventEmitter<EmpireRendererRequest>();

  trackMode(_index: number, mode: InfluenceModeView): GameTabId {
    return mode.id;
  }
}
