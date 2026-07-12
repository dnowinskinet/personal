import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { GriftOsGameComponent } from './grift-os-game';
import { INFLUENCE_ENGINE_MECHANICS } from './empires/influence/mechanics/influence-mechanics';
import { createInitialGameState } from './game-engine/economy';
import { PLAYTEST_STORAGE_KEY } from './playtest/playtest-session';

describe('GriftOsGameComponent', () => {
  let fixture: ComponentFixture<GriftOsGameComponent> | null = null;

  afterEach(() => {
    fixture?.destroy();
    fixture = null;
    window.localStorage.removeItem(PLAYTEST_STORAGE_KEY);
    window.localStorage.removeItem('grift-os-meta-v1');
    window.localStorage.removeItem('grift-os-run-v1');
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

  it('derives the root visual condition only from automation and purchased Leverage', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(component.visualCondition).toBe('manual');
    expect(fixture.nativeElement.querySelector('.grift-os-app')?.getAttribute('data-visual-condition')).toBe('manual');

    component.state = {
      ...component.state,
      netWorth: 1_000_000,
      founderTakePreparation: {
        completedStages: 1,
        isActive: true,
        progressMs: 1_000,
      },
    };
    detectStateChange(fixture);

    expect(component.visualCondition).toBe('manual');

    component.state = {
      ...component.state,
      hustles: {
        ...component.state.hustles,
        'troll-network': {
          ...component.state.hustles['troll-network'],
          isAutomated: true,
        },
      },
    };
    detectStateChange(fixture);

    expect(component.visualCondition).toBe('automated');
    expect(fixture.nativeElement.querySelector('.grift-os-app')?.getAttribute('data-visual-condition')).toBe('automated');

    component.state = {
      ...component.state,
      leveragePurchases: ['attention-loop'],
    };
    detectStateChange(fixture);

    expect(component.visualCondition).toBe('structural');
    expect(fixture.nativeElement.querySelector('.grift-os-app')?.getAttribute('data-visual-condition')).toBe('structural');
  });

  it('sizes the mode navigation from the number of available modes', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    component.applyRunShortcut('portfolio-scale');
    detectStateChange(fixture);

    const modeNavigation = fixture.nativeElement.querySelector('.grift-mode-tabs') as HTMLElement | null;

    expect(modeNavigation).not.toBeNull();
    expect(modeNavigation?.style.getPropertyValue('--grift-mode-count')).toBe(String(component.availableTabs.length));
  });

  it('exposes player-facing music and SFX mute controls', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(fixture.nativeElement.textContent).toContain('Music on');
    expect(fixture.nativeElement.textContent).toContain('SFX on');

    const musicButton = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((button): button is HTMLButtonElement =>
        button.textContent?.includes('Music on') ?? false
      );

    musicButton?.click();
    fixture.detectChanges();

    expect(component.audioSettings.isMuted).toBeFalse();
    expect(component.audioSettings.musicVolume).toBe(0);
    expect(component.isMusicMuted).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Music off');
  });

  it('restores the local run state on the same machine', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    component.applyRunShortcut('two-hustles');
    detectStateChange(fixture);

    expect(window.localStorage.getItem('grift-os-run-v1')).toContain('podcast-network');

    fixture.destroy();
    fixture = await createFixture({});
    const restored = fixture.componentInstance;

    expect(restored.state.valuation).toBe(320);
    expect(restored.state.hustles['troll-network'].units).toBe(2);
    expect(restored.state.hustles['podcast-network'].units).toBe(1);
    expect(restored.selectedHustleId).toBe('podcast-network');
  });

  it('credits automated offline production before showing a dismissible notice', async () => {
    const savedState = createInitialGameState(INFLUENCE_ENGINE_MECHANICS);
    const automatedState = {
      ...savedState,
      valuation: 100,
      peakValuation: 100,
      hustles: {
        ...savedState.hustles,
        'troll-network': {
          ...savedState.hustles['troll-network'],
          isActive: true,
          isAutomated: true,
          progressMs: 0,
        },
      },
    };

    window.localStorage.setItem('grift-os-run-v1', JSON.stringify({
      version: 1,
      savedAt: Date.now() - 120_000,
      selectedHustleId: 'troll-network',
      state: automatedState,
    }));

    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(component.offlineReturn?.pendingPayout).toBeGreaterThan(0);
    expect(component.state.valuation).toBeGreaterThan(100);
    expect(fixture.nativeElement.textContent).toContain('Since you were gone');
    expect(fixture.nativeElement.textContent).toContain('added to Valuation');
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.grift-offline-backdrop')).toBeNull();

    const creditedValuation = component.state.valuation;
    const dismissButton = fixture.nativeElement.querySelector(
      '[data-testid="grift-offline-notice"] button'
    ) as HTMLButtonElement | null;

    expect(dismissButton).not.toBeNull();
    dismissButton?.click();
    detectStateChange(fixture);

    expect(component.offlineReturn).toBeNull();
    expect(component.state.valuation).toBe(creditedValuation);
    expect(window.localStorage.getItem('grift-os-run-v1')).toContain(String(component.state.valuation));
  });

  it('closes the playtest debug menu from inside the popover', async () => {
    fixture = await createFixture({ playtest: '1' });
    const details = fixture.nativeElement.querySelector(
      '[data-testid="grift-playtest-controls"]'
    ) as HTMLDetailsElement | null;

    expect(details).not.toBeNull();
    details!.open = true;
    fixture.detectChanges();

    const closeButton = Array.from<HTMLButtonElement>(details!.querySelectorAll('button'))
      .find((button): button is HTMLButtonElement =>
        button.textContent?.includes('Close menu') ?? false
      );

    closeButton?.click();
    fixture.detectChanges();

    expect(details!.open).toBeFalse();
    expect(document.activeElement).toBe(details!.querySelector('summary'));
  });

  it('closes the normal Run tools menu from inside the popover', async () => {
    fixture = await createFixture({});
    const details = fixture.nativeElement.querySelector('.grift-run-menu') as HTMLDetailsElement | null;

    expect(details).not.toBeNull();
    details!.open = true;
    fixture.detectChanges();

    const closeButton = Array.from<HTMLButtonElement>(details!.querySelectorAll('button'))
      .find((button): button is HTMLButtonElement =>
        button.textContent?.includes('Close menu') ?? false
      );

    closeButton?.click();
    fixture.detectChanges();

    expect(details!.open).toBeFalse();
    expect(document.activeElement).toBe(details!.querySelector('summary'));
  });

  it('provides run shortcuts for fast local progression QA', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(fixture.nativeElement.textContent).toContain('Jump: Two Hustles');
    expect(fixture.nativeElement.textContent).toContain('Jump: Buildout');
    expect(fixture.nativeElement.textContent).toContain('Jump: Portfolio');
    expect(fixture.nativeElement.textContent).toContain('Jump: Post Rug');

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
    expect(fixture.nativeElement.textContent).toContain('Paid Fan Club');
    expect(fixture.nativeElement.textContent).toContain('Merch Store');
  });

  it('provides a buildout shortcut with a selected owned Hustle', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    component.applyRunShortcut('portfolio-mid');
    detectStateChange(fixture);

    expect(component.ownedHustleCount).toBe(4);
    expect(component.selectedHustleId).toBe('culture-war-media');
    expect(component.state.hustles['culture-war-media'].units).toBe(4);
    expect(component.state.hustles['venture-portfolio'].units).toBe(0);
  });

  it('provides a mature portfolio shortcut without reordering Hustles', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    component.applyRunShortcut('portfolio-scale');
    detectStateChange(fixture);

    const names = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.grift-hustle-name'))
      .map((element) => element.textContent?.trim());
    const rows = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.grift-hustle-entry'));

    expect(component.ownedHustleCount).toBe(8);
    expect(component.selectedHustleId).toBe('venture-portfolio');
    expect(names.slice(0, 8)).toEqual([
      'Social Media Account',
      'Paid Fan Club',
      'Merch Store',
      'Podcast',
      'VIP Events',
      'Success University',
      'Brand Ambassador Program',
      'Coaching Company',
    ]);
    expect(rows[0].classList).toContain('grift-hustle-settled');
    expect(rows[7].classList).toContain('grift-hustle-contextual');
  });

  it('provides an Endgame shortcut with all Hustles and prestige state established', async () => {
    fixture = await createFixture({ playtest: '1' });
    const component = fixture.componentInstance;

    component.applyRunShortcut('endgame');
    detectStateChange(fixture);

    expect(component.runShortcuts.some((shortcut) => shortcut.id === 'endgame')).toBeTrue();
    expect(component.state.netWorth).toBe(1_000_000_000_000);
    expect(component.state.rugPullCount).toBe(8);
    expect(component.state.valuation).toBe(1_000_000_000_000_000);
    expect(component.ownedHustleCount).toBe(10);
    expect(component.selectedHustleId).toBe('sovereign-network');
    expect(component.rugPullPreview.isAvailable).toBeTrue();
    expect(Object.values(component.state.hustles).every((hustle) =>
      hustle.units > 0 && hustle.isAutomated && hustle.isActive
    )).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('$1T');
    expect(fixture.nativeElement.textContent).toContain('$1Q');
  });

  it('can render a playtest Rug Pull proof state directly from query params', async () => {
    fixture = await createFixture({ playtest: '1', run: 'rug-pull-ready', surface: 'rugPull' });
    const component = fixture.componentInstance;

    expect(component.selectedVisibleTab).toBe('rugPull');
    expect(component.rugPullPreview.isAvailable).toBeTrue();
    expect(component.rugPullPreview.projectedNetWorthGain).toBe(1_000_000);
    expect(fixture.nativeElement.textContent).toContain('Walk away with');
    expect(fixture.nativeElement.textContent).toContain('+$1M');
  });

  it('can render a playtest post-Rug proof state with Net Worth visible', async () => {
    fixture = await createFixture({ playtest: '1', run: 'post-rug' });
    const component = fixture.componentInstance;

    expect(component.selectedVisibleTab).toBe('hustles');
    expect(component.state.valuation).toBe(0);
    expect(component.state.netWorth).toBe(1_000_000);
    expect(component.showNetWorth).toBeTrue();
    expect(component.rugPullResolution?.netWorthGainLabel).toBe('+$1M');
    expect(fixture.nativeElement.textContent).toContain('+$1M Net Worth realized');
  });

  it('provides a post-Rug shortcut with the fresh-run multiplier active', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    component.applyRunShortcut('post-rug');
    detectStateChange(fixture);

    expect(component.state.valuation).toBe(0);
    expect(component.state.netWorth).toBe(1_000_000);
    expect(component.showNetWorth).toBeTrue();
    expect(component.selectedHustleId).toBe('troll-network');
    expect(component.selectedHustle.modifierSummaryLabel).toContain('x5 output');
    expect(component.rugPullResolution?.netWorthGainLabel).toBe('+$1M');
    expect(fixture.nativeElement.textContent).toContain('+$1M Net Worth realized');
    expect(fixture.nativeElement.textContent).toContain('x5 output');
    expect(window.localStorage.getItem('grift-os-meta-v1')).toContain('100000');
    expect(window.localStorage.getItem('grift-os-run-v1')).toContain('"netWorth":100000');
  });

  it('shows the current Net Worth advantage in the HUD and reserves projected values for Rug Pull', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    component.state = {
      ...component.state,
      netWorth: 1_000_000,
      valuation: 3_000_000_000,
      peakValuation: 3_000_000_000,
    };
    detectStateChange(fixture);

    expect(component.wealthAdvantageLabel).toBe('Up to +400% established output');
    expect(fixture.nativeElement.querySelector('.grift-net-worth')?.textContent)
      .toContain('Up to +400% established output');

    component.setGameTab('rugPull');
    detectStateChange(fixture);

    expect(component.rugPullResultingNetWorthLabel).toBe('$31M');
    expect(component.rugPullWealthAdvantageLabel).toBe('Up to +1120% established next-run output');
  });

  it('starts fresh with only the first owned Hustle and no next-enterprise horizon', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    const text = fixture.nativeElement.textContent;

    expect(component.selectedHustle.definition.name).toBe('Social Media Account');
    expect(component.showNextHustleHorizon).toBeFalse();
    expect(component.showPinnedSelectedContext).toBeFalse();
    expect(text).toContain('Social Media Account');
    expect(text).toContain('Your Hustles');
    expect(text).not.toContain('Active ledger');
    expect(text).not.toContain('Next enterprise');
    expect(text).not.toContain('Paid Fan Club');
    expect(text).not.toContain('Merch Store');
    expect(text).not.toContain('Private Community');
    expect(text).not.toContain('Selected Hustle');
    expect(text).not.toContain('10 visible');
    expect(text).not.toContain('x1 output');
    expect(text).not.toContain('Post an Affiliate LinkPost an Affiliate Link');
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
        button.textContent?.includes('Add Follower') ?? false
      );

    addForumButton?.click();
    fixture.detectChanges();

    expect(component.state.hustles['troll-network'].units).toBe(2);
    expect(component.showNextHustleHorizon).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Next enterprise');
    expect(fixture.nativeElement.textContent).toContain('Paid Fan Club');
    expect(fixture.nativeElement.textContent).not.toContain('Merch Store');
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
    expect(component.selectedHustle.definition.name).toBe('Paid Fan Club');
    expect(fixture.nativeElement.textContent).toContain('Selected Hustle');
    expect(fixture.nativeElement.textContent).toContain('Next enterprise');
    expect(fixture.nativeElement.textContent).toContain('Merch Store');
    expect(fixture.nativeElement.textContent).not.toContain('Podcast');
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
    expect(component.selectedHustle.definition.name).toBe('Social Media Account');
    expect(fixture.nativeElement.textContent).not.toContain('x1 output');

    rowSelectButtons[1].click();
    fixture.detectChanges();

    expect(component.selectedContextOpen).toBeTrue();
    expect(component.selectedHustle.definition.name).toBe('Paid Fan Club');
    expect(fixture.nativeElement.querySelector('.grift-inspector-panel')?.textContent).toContain('Paid Fan Club');
  });

  it('closes the selected-Hustle context with Escape', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    const rowSelectButton = fixture.nativeElement.querySelector('.grift-hustle-select') as HTMLButtonElement;

    rowSelectButton.click();
    fixture.detectChanges();
    await settleFocus();

    expect(component.selectedContextOpen).toBeTrue();
    const contextPanel = fixture.nativeElement.querySelector('.grift-inspector-panel') as HTMLElement;
    const contextCloseButton = contextPanel.querySelector('.grift-context-close') as HTMLButtonElement;
    contextCloseButton.focus();
    expect(document.activeElement).toBe(contextCloseButton);

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
        button.textContent?.includes('Post an Affiliate Link ·') ?? false
      );

    manualButton?.click();
    fixture.detectChanges();

    expect(component.state.hustles['troll-network'].isActive).toBeTrue();
    expect(component.selectedHustle.definition.name).toBe('Social Media Account');
    expect(fixture.nativeElement.textContent).toContain('Post an Affiliate Link...');
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
    expect(component.selectedHustle.definition.name).toBe('Social Media Account');
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
    expect(fixture.nativeElement.textContent).not.toContain('+$0.01 Social Media Account');
  });

  it('creates a Valuation gain flyout from an actual payout event', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    component['addPayoutFeedback'](
      { hustleId: 'troll-network', payout: 4, cyclesCompleted: 2 },
      performance.now()
    );
    detectStateChange(fixture);

    expect(component.valuationFlyouts.length).toBe(1);
    expect(component.valuationFlyouts[0].direction).toBe('gain');
    expect(component.valuationFlyouts[0].label).toBe('↑ +$8');
    expect(fixture.nativeElement.querySelector('.grift-valuation-flyout--gain')?.textContent).toContain('↑ +$8');
    expect(fixture.nativeElement.querySelector('.grift-local-feedback')).toBeNull();
  });

  it('creates one Valuation spend flyout from a successful unit purchase', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    component.state = {
      ...component.state,
      valuation: 100,
      peakValuation: 100,
    };
    detectStateChange(fixture);

    component.buyOne('troll-network');
    detectStateChange(fixture);

    expect(component.state.hustles['troll-network'].units).toBe(2);
    expect(component.valuationFlyouts.length).toBe(1);
    expect(component.valuationFlyouts[0].direction).toBe('spend');
    expect(component.valuationFlyouts[0].label).toBe('↓ -2.95¢');
    expect(fixture.nativeElement.querySelector('.grift-valuation-flyout--spend')?.textContent).toContain('↓ -2.95¢');
  });

  it('creates one Valuation spend flyout from a Buy Max purchase', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    component.state = {
      ...component.state,
      valuation: 500,
      peakValuation: 500,
    };
    detectStateChange(fixture);

    component.buyMax('troll-network');

    expect(component.valuationFlyouts.length).toBe(1);
    expect(component.valuationFlyouts[0].direction).toBe('spend');
    expect(component.valuationFlyouts[0].label).toMatch(/^↓ -\$/);
    expect(component.state.hustles['troll-network'].units).toBeGreaterThan(2);
  });

  it('creates one Valuation spend flyout from an automation purchase', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    component.state = {
      ...component.state,
      valuation: 110,
      peakValuation: 110,
    };
    detectStateChange(fixture);

    component.automate('troll-network');
    detectStateChange(fixture);

    expect(component.state.hustles['troll-network'].isAutomated).toBeTrue();
    expect(component.valuationFlyouts.length).toBe(1);
    expect(component.valuationFlyouts[0].direction).toBe('spend');
    expect(component.valuationFlyouts[0].label).toBe('↓ -50¢');
    expect(fixture.nativeElement.querySelector('.grift-valuation-flyout--spend')?.textContent).toContain('↓ -50¢');
  });

  it('bounds simultaneous Valuation flyouts by direction', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    component['addValuationFlyout']('gain', 1);
    component['addValuationFlyout']('gain', 2);
    component['addValuationFlyout']('gain', 3);
    component['addValuationFlyout']('gain', 4);
    component['addValuationFlyout']('spend', 5);
    component['addValuationFlyout']('spend', 6);
    component['addValuationFlyout']('spend', 7);

    expect(component.valuationFlyouts.filter((flyout) => flyout.direction === 'gain').length).toBe(3);
    expect(component.valuationFlyouts.filter((flyout) => flyout.direction === 'spend').length).toBe(2);
    expect(component.valuationFlyouts.some((flyout) => flyout.label === '↑ +$1')).toBeFalse();
    expect(component.valuationFlyouts.some((flyout) => flyout.label === '↓ -$5')).toBeFalse();
  });

  it('completes a manual cycle from real elapsed time even when the browser callback is late', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    if (component['simulationTimerId'] !== null) {
      window.clearInterval(component['simulationTimerId']);
      component['simulationTimerId'] = null;
    }

    spyOnProperty(document, 'hidden', 'get').and.returnValue(false);
    component.activate('troll-network');
    component['lastTickTime'] = 1_000;
    spyOn(performance, 'now').and.returnValue(3_150);

    component['tick']();

    expect(component.state.valuation).toBe(0.0025);
    expect(component.state.hustles['troll-network'].isActive).toBeFalse();
    expect(component.state.hustles['troll-network'].progressMs).toBe(0);
  });

  it('flushes partial progress ticks without waiting for another interaction', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    if (component['simulationTimerId'] !== null) {
      window.clearInterval(component['simulationTimerId']);
      component['simulationTimerId'] = null;
    }

    spyOnProperty(document, 'hidden', 'get').and.returnValue(false);
    component.activate('troll-network');
    component['lastTickTime'] = 1_000;
    spyOn(performance, 'now').and.returnValue(1_500);

    component['tick']();

    const progressTrack = fixture.nativeElement.querySelector(
      '.grift-progress-track'
    ) as HTMLElement | null;

    expect(component.state.hustles['troll-network'].progressMs).toBe(500);
    expect(progressTrack?.style.getPropertyValue('--grift-progress-scale')).toBe('0.2500');
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

    expect(component.selectedHustle.modifierSummaryLabel).toBe('x3 output');
    expect(component.selectedHustle.showModifierSummary).toBeTrue();
    expect(fixture.nativeElement.textContent).not.toContain('x1 speed');
  });

  it('reveals automation only when the existing automation condition is actionable', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(fixture.nativeElement.textContent).not.toContain('Auto-Poster ready');

    component.state = {
      ...component.state,
      valuation: 110,
      peakValuation: 110,
    };
    detectStateChange(fixture);

    expect(fixture.nativeElement.textContent).toContain('Auto-Poster ready');
    expect(fixture.nativeElement.textContent).toContain('Automate · 50¢');

    const automateButton = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((button): button is HTMLButtonElement =>
        button.textContent?.includes('Automate') ?? false
      );

    automateButton?.click();
    fixture.detectChanges();

    expect(component.state.hustles['troll-network'].isAutomated).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Auto-Poster · posting links');
    component.openSelectedContext('troll-network');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Automation active');
    expect(fixture.nativeElement.textContent).not.toContain('Post an Affiliate Link ·');
  });

  it('reveals milestone grammar only near an existing milestone threshold', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(fixture.nativeElement.querySelector('.grift-milestone-inline')).toBeNull();

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

    expect(fixture.nativeElement.querySelector('.grift-milestone-inline')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Next 10');
  });

  it('hides Buy Max until at least two units are affordable', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(fixture.nativeElement.textContent).not.toContain('Buy +');

    component.state = {
      ...component.state,
      valuation: 500,
      peakValuation: 500,
    };
    detectStateChange(fixture);

    expect(component.selectedHustle.buyMaxCount).toBeGreaterThanOrEqual(2);
    expect(fixture.nativeElement.textContent).toContain(`Buy +${component.selectedHustle.buyMaxCount}`);
  });

  it('hides Leverage and reveals Rug Pull only from real Rug Pull availability', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;

    expect(component.availableTabs.map((tab) => tab.id)).toEqual(['hustles']);
    component.setGameTab('leverage');
    expect(component.selectedTab).toBe('hustles');

    component.state = {
      ...component.state,
      valuation: 100_000_000,
      peakValuation: 100_000_000,
    };
    detectStateChange(fixture);

    expect(component.availableTabs.map((tab) => tab.id)).toEqual(['hustles', 'rugPull']);
    expect(fixture.nativeElement.textContent).not.toContain('Leverage');

    const rugPullButton = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((button): button is HTMLButtonElement => button.textContent?.trim() === 'Rug Pull');
    rugPullButton?.click();
    fixture.detectChanges();

    expect(component.selectedTab).toBe('rugPull');
    expect(fixture.nativeElement.textContent).toContain('Walk away with');
    expect(fixture.nativeElement.textContent).toContain('+$1M');
    expect(fixture.nativeElement.textContent).toContain('Net Worth');
    expect(fixture.nativeElement.textContent).toContain('Run value sacrificed');
    expect(fixture.nativeElement.textContent).toContain('This run ends');
    expect(fixture.nativeElement.textContent).toContain('You keep');
    expect(component.state.valuation).toBe(100_000_000);
  });

  it('lets the player leave Rug Pull mode before committing', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    component.state = {
      ...component.state,
      valuation: 100_000_000,
      peakValuation: 100_000_000,
    };
    detectStateChange(fixture);

    component.setGameTab('rugPull');
    detectStateChange(fixture);

    const returnButton = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((button): button is HTMLButtonElement => button.textContent?.trim() === 'Return to Hustles');
    returnButton?.click();
    fixture.detectChanges();

    expect(component.selectedTab).toBe('hustles');
    expect(component.state.valuation).toBe(100_000_000);
    expect(component.state.netWorth).toBe(0);
  });

  it('cancels Rug Pull without changing run or persistent state', async () => {
    fixture = await createFixture({});
    const component = fixture.componentInstance;
    spyOn(window, 'confirm').and.returnValue(false);
    component.state = {
      ...component.state,
      valuation: 100_000_000,
      peakValuation: 100_000_000,
    };
    component.setGameTab('rugPull');
    detectStateChange(fixture);

    component.commitRugPull();

    expect(component.state.valuation).toBe(100_000_000);
    expect(component.state.netWorth).toBe(0);
    expect(component.selectedTab).toBe('rugPull');
    expect(component.rugPullResolution).toBeNull();
  });

  it('resets the debug run to documented initial conditions and clears Net Worth', async () => {
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
    expect(component.state.netWorth).toBe(0);
    expect(component.state.rugPullCount).toBe(0);
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
      valuation: 100_000_000,
      peakValuation: 100_000_000,
    };

    component.commitRugPull();
    fixture.detectChanges();
    await settleFocus();
    fixture.detectChanges();

    expect(component.state.valuation).toBe(0);
    expect(component.state.netWorth).toBe(1_000_000);
    expect(component.state.hustles['troll-network'].units).toBe(1);
    expect(component.selectedVisibleTab).toBe('hustles');
    expect(component.payoutFeedback.some((feedback) => feedback.tone === 'rug-pull')).toBeFalse();
    expect(component.valuationFlyouts.length).toBe(0);
    expect(component.rugPullResolution?.netWorthGainLabel).toBe('+$1M');
    expect(fixture.nativeElement.textContent).toContain('Extraction committed');
    expect(fixture.nativeElement.textContent).toContain('+$1M Net Worth realized');
    expect(fixture.nativeElement.textContent).toContain('Net Worth');
    expect(fixture.nativeElement.textContent).toContain('$1M');
    expect(component.selectedHustle.modifierSummaryLabel).toContain('x5 output');
    expect(fixture.nativeElement.textContent).toContain('x5 output');
    expect(window.localStorage.getItem('grift-os-meta-v1')).toContain('100000');

    fixture.destroy();
    fixture = await createFixture({});
    const restored = fixture.componentInstance;

    expect(restored.state.valuation).toBe(0);
    expect(restored.state.netWorth).toBe(1_000_000);
    expect(restored.state.hustles['troll-network'].units).toBe(1);
    expect(restored.showNetWorth).toBeTrue();
    expect(restored.selectedHustle.modifierSummaryLabel).toContain('x5 output');
    expect(fixture.nativeElement.textContent).toContain('x5 output');
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
