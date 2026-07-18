import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([])
      ],
      declarations: [
        AppComponent
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'dnowinski'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('dnowinski');
  });

  it('should render the app shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const main = compiled.querySelector('main');

    expect(main).toBeTruthy();
    expect(compiled.querySelector('foot-note')).toBeTruthy();
    expect(main?.classList).toContain('site-main');
    expect(main?.classList).not.toContain('min-h-screen');
  });

  it('hides the global scroll-to-top control only on the Sudoku route', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const updateRouteShell = (app as unknown as {
      updateRouteShell(url: string): void;
    }).updateRouteShell.bind(app);

    updateRouteShell('/experimental/sudoku?from=test');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('scroll-to-top')).toBeNull();

    updateRouteShell('/about');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('scroll-to-top')).not.toBeNull();
  });
});
