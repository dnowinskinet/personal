import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { GriftOsGameComponent } from './grift-os-game';
import { createInitialGameState } from './game-engine/economy';
import { PLAYTEST_STORAGE_KEY } from './playtest/playtest-session';

describe('GriftOsGameComponent', () => {
  let fixture: ComponentFixture<GriftOsGameComponent> | null = null;

  afterEach(() => {
    fixture?.destroy();
    fixture = null;
    window.localStorage.removeItem(PLAYTEST_STORAGE_KEY);
    window.localStorage.removeItem('grift-os-meta-v1');
    window.localStorage.removeItem('grift-os-audio-settings-v1');
  });

  it('creates the normal route with progressive navigation and no playtest controls', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    const text = fixture.nativeElement.textContent;

    expect(component).toBeTruthy();
    expect(component.isPlaytestMode).toBeFalse();
    expect(component.state.valuation).toBe(0);
    expect(component.definitions.length).toBe(10);
    expect(component.state.hustles['troll-network'].units).toBe(1);
    expect(text).toContain('Hustles');
    expect(text).toContain('Valuation');
    expect(text).not.toContain('Leverage');
    expect(text).not.toContain('Rug Pull');
    expect(text).not.toContain('Net Worth');
    expect(text).not.toContain('Enterprise Stage');
    expect(text).not.toContain('intensity');
    expect(text).not.toContain('Paper Valuation');
    expect(text).not.toContain('Generator');
    expect(fixture.nativeElement.querySelector('[data-testid="grift-playtest-controls"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="grift-reset-run"]')).not.toBeNull();
  });

  it('shows compact playtest controls only through the playtest query parameter', async () => {
    fixture = await createFixture({ playtest: '1' });
    const component = fixture.componentInstance;

    expect(component.isPlaytestMode).toBeTrue();
    expect(component.playtestSession).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="grift-playtest-controls"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('TEST');
  });

  it('provides run shortcuts for fast local progression QA', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(fixture.nativeElement.textContent).toContain('Jump: Two Hustles');

    const twoHustlesButton = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((button): button is HTMLButtonElement =>
        button.textContent?.includes('Jump: Two Hustles') ?? false
      );

    twoHustlesButton?.click();
    fixture.detectChanges();

    expect(component.state.hustles['troll-network'].units).toBe(2);
    expect(component.state.hustles['podcast-network'].units).toBe(1);
    expect(component.ownedHustleCount).toBe(2);
    expect(component.showPinnedSelectedContext).toBeTrue();
    expect(component.selectedHustleId).toBe('podcast-network');
    expect(fixture.nativeElement.textContent).toContain('Podcast Network');
    expect(fixture.nativeElement.textContent).toContain('Culture-War Media');
  });

  it('starts fresh with only the first owned Hustle and no next-enterprise horizon', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    const text = fixture.nativeElement.textContent;

    expect(component.selectedHustle.definition.name).toBe('Troll Network');
    expect(component.showNextHustleHorizon).toBeFalse();
    expect(component.showPinnedSelectedContext).toBeFalse();
    expect(text).toContain('Troll Network');
    expect(text).toContain('Your Hustles');
    expect(text).not.toContain('Active ledger');
    expect(text).not.toContain('Next enterprise');
    expect(text).not.toContain('Podcast Network');
    expect(text).not.toContain('Culture-War Media');
    expect(text).not.toContain('Sovereign Network');
    expect(text).not.toContain('Selected Hustle');
    expect(text).not.toContain('10 visible');
    expect(text).not.toContain('x1.00 output');
    expect(text).not.toContain('Troll People OnlineTroll People Online');
    expect(fixture.nativeElement.querySelectorAll('.grift-hustle-icon').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.grift-hustle-icon')?.textContent.trim()).toBe('');
  });

  it('reveals the next-enterprise horizon after the first expansion', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    component.state = {
      ...component.state,
      valuation: 100,
      peakValuation: 100,
    };
    detectStateChange(fixture);

    const addForumButton = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((button): button is HTMLButtonElement =>
        button.textContent?.includes('Add Forum') ?? false
      );

    addForumButton?.click();
    fixture.detectChanges();

    expect(component.state.hustles['troll-network'].units).toBe(2);
    expect(component.showNextHustleHorizon).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Next enterprise');
    expect(fixture.nativeElement.textContent).toContain('Podcast Network');
    expect(fixture.nativeElement.textContent).not.toContain('Culture-War Media');
  });

  it('keeps one next-enterprise horizon after later Hustles are owned', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    const initialState = component.state;

    component.state = {
      ...initialState,
      hustles: {
        ...initialState.hustles,
        'podcast-network': {
          ...initialState.hustles['podcast-network'],
          units: 1,
        },
      },
    };
    component.selectedHustleId = 'podcast-network';
    detectStateChange(fixture);

    expect(component.showNextHustleHorizon).toBeTrue();
    expect(component.selectedHustle.definition.name).toBe('Podcast Network');
    expect(fixture.nativeElement.textContent).toContain('Selected Hustle');
    expect(fixture.nativeElement.textContent).toContain('Next enterprise');
    expect(fixture.nativeElement.textContent).toContain('Culture-War Media');
    expect(fixture.nativeElement.textContent).not.toContain('Masterclass Business');
    expect(fixture.nativeElement.textContent).not.toContain('Valuation pressure');
    expect(fixture.nativeElement.textContent).not.toContain('Automation spread');
    expect(fixture.nativeElement.textContent).not.toContain('Milestone density');
    expect(fixture.nativeElement.querySelectorAll('.grift-hustle-icon').length).toBe(2);
  });

  it('opens the selected-Hustle context intentionally without pinning one-Hustle wide state', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(component.selectedContextOpen).toBeFalse();
    expect(component.showPinnedSelectedContext).toBeFalse();
    expect(fixture.nativeElement.querySelector('.grift-inspector-panel')).toBeNull();

    const rowSelectButton = fixture.nativeElement.querySelector('.grift-hustle-select') as HTMLButtonElement;
    rowSelectButton.click();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.grift-inspector-panel') as HTMLElement;
    expect(component.selectedContextOpen).toBeTrue();
    expect(component.showPinnedSelectedContext).toBeFalse();
    expect(panel).not.toBeNull();
    expect(panel.classList).toContain('grift-inspector-panel--overlay-only');

    const closeButton = fixture.nativeElement.querySelector('.grift-context-close') as HTMLButtonElement;
    closeButton.click();
    fixture.detectChanges();

    expect(component.selectedContextOpen).toBeFalse();
  });

  it('updates the open selected-Hustle context when another row is selected', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    const initialState = component.state;

    component.state = {
      ...initialState,
      hustles: {
        ...initialState.hustles,
        'podcast-network': {
          ...initialState.hustles['podcast-network'],
          units: 1,
        },
      },
    };
    detectStateChange(fixture);

    const rowSelectButtons = fixture.nativeElement.querySelectorAll('.grift-hustle-select') as NodeListOf<HTMLButtonElement>;
    expect(rowSelectButtons.length).toBe(2);

    rowSelectButtons[0].click();
    fixture.detectChanges();

    expect(component.selectedContextOpen).toBeTrue();
    expect(component.selectedHustle.definition.name).toBe('Troll Network');
    expect(fixture.nativeElement.textContent).not.toContain('x1.00 output');

    rowSelectButtons[1].click();
    fixture.detectChanges();

    expect(component.selectedContextOpen).toBeTrue();
    expect(component.selectedHustle.definition.name).toBe('Podcast Network');
    expect(fixture.nativeElement.querySelector('.grift-inspector-panel')?.textContent).toContain('Podcast Network');
  });

  it('closes the selected-Hustle context with Escape', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    const rowSelectButton = fixture.nativeElement.querySelector('.grift-hustle-select') as HTMLButtonElement;

    rowSelectButton.click();
    fixture.detectChanges();
    await settleFocus();

    expect(component.selectedContextOpen).toBeTrue();
    expect(document.activeElement?.classList).toContain('grift-inspector-panel');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    await settleFocus();

    expect(component.selectedContextOpen).toBeFalse();
    expect(document.activeElement).toBe(rowSelectButton);
  });

  it('starts manual production from the explicit action and keeps the icon as a secondary trigger', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    const iconButtons = fixture.nativeElement.querySelectorAll('.grift-icon-button');

    expect(iconButtons.length).toBe(1);
    expect(iconButtons[0].classList).toContain('grift-icon-owned');

    const manualButton = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((button): button is HTMLButtonElement =>
        button.textContent?.includes('Troll People Online ·') ?? false
      );

    manualButton?.click();
    fixture.detectChanges();

    expect(component.state.hustles['troll-network'].isActive).toBeTrue();
    expect(component.selectedHustle.definition.name).toBe('Troll Network');
    expect(fixture.nativeElement.textContent).toContain('Troll People Online...');
    expect(fixture.nativeElement.textContent).not.toContain('Running');

    component.state = {
      ...component.state,
      hustles: {
        ...component.state.hustles,
        'troll-network': {
          ...component.state.hustles['troll-network'],
          isActive: false,
        },
      },
    };
    detectStateChange(fixture);

    iconButtons[0].click();
    fixture.detectChanges();

    expect(component.state.hustles['troll-network'].isActive).toBeTrue();
    expect(component.selectedHustle.definition.name).toBe('Troll Network');
  });

  it('keeps payout feedback silent until a stable local feedback surface is designed', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    component['addPayoutFeedback'](
      { hustleId: 'troll-network', payout: 4, cyclesCompleted: 1 },
      performance.now()
    );
    detectStateChange(fixture);

    expect(fixture.nativeElement.querySelector('.grift-toast')).toBeNull();
    expect(fixture.nativeElement.querySelector('.grift-local-feedback')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('+$4 Troll Network');
  });

  it('suppresses baseline modifier fields independently', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    const initialState = component.state;

    component.state = {
      ...initialState,
      hustles: {
        ...initialState.hustles,
        'troll-network': {
          ...initialState.hustles['troll-network'],
          units: 10,
          reachedMilestones: ['troll-network-10'],
        },
      },
    };
    detectStateChange(fixture);

    expect(component.selectedHustle.modifierSummaryLabel).toBe('x1.50 output');
    expect(component.selectedHustle.showModifierSummary).toBeTrue();
    expect(fixture.nativeElement.textContent).not.toContain('x1.00 speed');
  });

  it('reveals automation only when the existing automation condition is actionable', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(fixture.nativeElement.textContent).not.toContain('Bots available');

    component.state = {
      ...component.state,
      valuation: 110,
      peakValuation: 110,
    };
    detectStateChange(fixture);

    expect(fixture.nativeElement.textContent).toContain('Bots available');
    expect(fixture.nativeElement.textContent).toContain('Automate · $110');

    const automateButton = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((button): button is HTMLButtonElement =>
        button.textContent?.includes('Automate') ?? false
      );

    automateButton?.click();
    fixture.detectChanges();

    expect(component.state.hustles['troll-network'].isAutomated).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Bots online');
    expect(fixture.nativeElement.textContent).not.toContain('Troll People Online ·');
  });

  it('reveals milestone grammar only near an existing milestone threshold', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(fixture.nativeElement.textContent).not.toContain('Next milestone');

    component.state = {
      ...component.state,
      hustles: {
        ...component.state.hustles,
        'troll-network': {
          ...component.state.hustles['troll-network'],
          units: 8,
        },
      },
    };
    detectStateChange(fixture);

    expect(fixture.nativeElement.textContent).toContain('Next milestone');
    expect(fixture.nativeElement.textContent).toContain('10 Forums');
  });

  it('hides Buy Max until at least two units are affordable', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(fixture.nativeElement.textContent).not.toContain('Max');

    component.state = {
      ...component.state,
      valuation: 500,
      peakValuation: 500,
    };
    detectStateChange(fixture);

    expect(component.selectedHustle.buyMaxCount).toBeGreaterThanOrEqual(2);
    expect(fixture.nativeElement.textContent).toContain('Max');
  });

  it('hides Leverage and reveals Rug Pull only from real Rug Pull availability', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(component.availableTabs.map((tab) => tab.id)).toEqual(['hustles']);
    component.setGameTab('leverage');
    expect(component.selectedTab).toBe('hustles');

    component.state = {
      ...component.state,
      valuation: 50_000_000,
      peakValuation: 50_000_000,
    };
    detectStateChange(fixture);

    expect(component.availableTabs.map((tab) => tab.id)).toEqual(['hustles', 'rugPull']);
    expect(fixture.nativeElement.textContent).not.toContain('Leverage');

    const rugPullButton = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((button): button is HTMLButtonElement => button.textContent?.trim() === 'Rug Pull');
    rugPullButton?.click();
    fixture.detectChanges();

    expect(component.selectedTab).toBe('rugPull');
    expect(fixture.nativeElement.textContent).toContain('Projected Net Worth Gain');
    expect(component.state.valuation).toBe(50_000_000);
  });

  it('resets the current run to documented initial conditions while preserving Net Worth', async () => {
    fixture = await createFixture({ playtest: '1' });
    const component = fixture.componentInstance;
    spyOn(window, 'confirm').and.returnValue(true);

    const initialState = component.state;
    component.state = {
      ...initialState,
      valuation: 999,
      peakValuation: 999,
      netWorth: 100_000,
      hustles: {
        ...initialState.hustles,
        'troll-network': {
          ...initialState.hustles['troll-network'],
          units: 7,
          isActive: true,
          isAutomated: true,
          progressMs: 1_200,
        },
        'podcast-network': {
          ...initialState.hustles['podcast-network'],
          units: 3,
          isActive: true,
          isAutomated: true,
          progressMs: 2_400,
        },
      },
    };

    component.resetSimulationRun();

    expect(component.state.valuation).toBe(0);
    expect(component.state.netWorth).toBe(100_000);
    expect(component.state.hustles['troll-network'].units).toBe(1);
    expect(component.state.hustles['troll-network'].isActive).toBeFalse();
    expect(component.state.hustles['troll-network'].isAutomated).toBeFalse();
    expect(component.state.hustles['troll-network'].progressMs).toBe(0);
    expect(component.state.hustles['podcast-network'].units).toBe(0);
    expect(component.state.hustles['podcast-network'].isActive).toBeFalse();
    expect(component.playtestSession?.events.at(-1)?.type).toBe('session_reset');

    component.activate('troll-network');

    expect(component.state.hustles['troll-network'].isActive).toBeTrue();
  });

  it('commits a Rug Pull into persistent Net Worth when the forecast is available', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    spyOn(window, 'confirm').and.returnValue(true);
    component.state = {
      ...createInitialGameState(component.definitions),
      valuation: 50_000_000,
      peakValuation: 50_000_000,
    };

    component.commitRugPull();
    fixture.detectChanges();

    expect(component.state.valuation).toBe(0);
    expect(component.state.netWorth).toBe(100_000);
    expect(component.state.hustles['troll-network'].units).toBe(1);
    expect(window.localStorage.getItem('grift-os-meta-v1')).toContain('100000');
  });

  async function createFixture(queryParams: Record<string, string>): Promise<ComponentFixture<GriftOsGameComponent>> {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [GriftOsGameComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(queryParams),
            },
          },
        },
      ],
    }).compileComponents();

    const createdFixture = TestBed.createComponent(GriftOsGameComponent);
    createdFixture.detectChanges();

    return createdFixture;
  }

  function detectStateChange(componentFixture: ComponentFixture<GriftOsGameComponent>): void {
    componentFixture.componentInstance['changeDetectorRef'].markForCheck();
    componentFixture.detectChanges();
  }

  async function settleFocus(): Promise<void> {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
});
