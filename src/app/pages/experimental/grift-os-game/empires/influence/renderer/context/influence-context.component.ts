import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { EmpireRendererRequest } from '../../../../host/empire-renderer-contract';
import { GameAction } from '../../../../presentation/game-action';
import { HustleViewModel } from '../../../../presentation/game-presentation';
import { INFLUENCE_HUSTLE_VISUALS } from '../../visuals/influence-hustle-visuals';

@Component({
  selector: 'app-influence-context',
  standalone: true,
  templateUrl: './influence-context.component.html',
  styleUrl: './influence-context.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class InfluenceContextComponent {
  @Input({ required: true }) row!: HustleViewModel;
  @Input() open = false;
  @Input() pinned = false;
  @Output() readonly request = new EventEmitter<EmpireRendererRequest>();

  @ViewChild('panel') private panel?: ElementRef<HTMLElement>;

  emit(action: GameAction): void {
    this.request.emit({ action });
  }

  focusPanel(): void {
    this.panel?.nativeElement.focus();
  }

  get viewportImage(): string {
    return INFLUENCE_HUSTLE_VISUALS[this.row.id].viewportImage;
  }
}
