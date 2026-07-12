import { TestBed } from '@angular/core/testing';
import { GRIFT_OS_COPY } from '../../../../content/game-copy';
import {
  InfluenceStageComponent,
  InfluenceStageView,
} from './influence-stage.component';

describe('InfluenceStageComponent', () => {
  it('renders presentation-only Stage data without owning gameplay actions', () => {
    const fixture = TestBed.createComponent(InfluenceStageComponent);
    const view: InfluenceStageView = {
      copy: GRIFT_OS_COPY,
      valuationLabel: '$12.3M',
      valuationPerSecondLabel: '$45K/sec',
      valuationFlyouts: [],
      showNetWorth: true,
      netWorthLabel: '$2M',
      wealthAdvantageLabel: '2x Wealth Advantage',
      visualCondition: 'structural',
    };

    fixture.componentInstance.view = view;
    fixture.detectChanges();

    const stage = fixture.nativeElement.querySelector('.grift-stage') as HTMLElement;
    expect(stage.getAttribute('data-visual-condition')).toBe('structural');
    expect(stage.querySelector('h1')?.textContent).toContain('GriftOS');
    expect(stage.querySelector('.grift-stage__chamber')).not.toBeNull();
    expect(stage.querySelector('.grift-stage__frame')).not.toBeNull();
    expect(stage.querySelector('[aria-label="Current valuation"]')?.textContent).toContain('$12.3M');
    expect(stage.querySelector('.grift-capital-panel')?.textContent).toContain('$2M');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('keeps a real-data Capital Panel in the Stage before Net Worth is established', () => {
    const fixture = TestBed.createComponent(InfluenceStageComponent);
    fixture.componentInstance.view = {
      copy: GRIFT_OS_COPY,
      valuationLabel: '$800K',
      valuationPerSecondLabel: '$2K/sec',
      valuationFlyouts: [],
      showNetWorth: false,
      netWorthLabel: '$0',
      wealthAdvantageLabel: 'No Wealth Advantage',
      visualCondition: 'manual',
    };

    fixture.detectChanges();

    const capitalPanel = fixture.nativeElement.querySelector('.grift-capital-panel') as HTMLElement;
    expect(capitalPanel.textContent).toContain('$0');
    expect(capitalPanel.classList).not.toContain('grift-capital-panel--established');
  });
});
