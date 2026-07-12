import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GRIFT_OS_COPY } from '../../../../content/game-copy';
import { ValuationFlyoutView } from '../../../../host/empire-renderer-contract';
import { VisualCondition } from '../../../../presentation/game-presentation';

export interface InfluenceStageView {
  copy: Pick<typeof GRIFT_OS_COPY, 'eyebrow' | 'title' | 'valuationLabel' | 'netWorthLabel'>;
  valuationLabel: string;
  valuationPerSecondLabel: string;
  valuationFlyouts: readonly ValuationFlyoutView[];
  showNetWorth: boolean;
  netWorthLabel: string;
  wealthAdvantageLabel: string;
  visualCondition: VisualCondition;
}

@Component({
  selector: 'app-influence-stage',
  standalone: true,
  templateUrl: './influence-stage.component.html',
  styleUrl: './influence-stage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: contents',
  },
})
export class InfluenceStageComponent {
  @Input({ required: true }) view!: InfluenceStageView;

  trackValuationFlyout(_index: number, flyout: ValuationFlyoutView): number {
    return flyout.id;
  }
}
