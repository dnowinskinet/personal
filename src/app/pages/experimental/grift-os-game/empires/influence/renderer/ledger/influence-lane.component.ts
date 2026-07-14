import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { EmpireRendererRequest } from '../../../../host/empire-renderer-contract';
import { GameAction } from '../../../../presentation/game-action';
import { HustleViewModel } from '../../../../presentation/game-presentation';
import { INFLUENCE_HUSTLE_VISUALS } from '../../visuals/influence-hustle-visuals';

@Component({
  selector: 'app-influence-lane',
  standalone: true,
  templateUrl: './influence-lane.component.html',
  styleUrl: './influence-lane.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class InfluenceLaneComponent implements OnChanges {
  @Input({ required: true }) row!: HustleViewModel;
  @Input() selected = false;
  @Output() readonly request = new EventEmitter<EmpireRendererRequest>();
  visualProgressDuration = '1ms';
  visualProgressDelay = '0ms';

  ngOnChanges(changes: SimpleChanges): void {
    const previous = changes['row']?.previousValue as HustleViewModel | undefined;
    const cadenceChanged = previous?.progressAnimationDuration !== this.row.progressAnimationDuration;
    const cycleStarted = this.row.isActive && !previous?.isActive;

    if (!previous || cadenceChanged || cycleStarted) {
      this.visualProgressDuration = this.row.progressAnimationDuration;
      this.visualProgressDelay = this.row.progressAnimationDelay;
    }
  }

  emit(action: GameAction, sourceEvent?: Event): void {
    this.request.emit({ action, sourceEvent });
  }

  get viewportImage(): string {
    return INFLUENCE_HUSTLE_VISUALS[this.row.id].viewportImage;
  }
}
