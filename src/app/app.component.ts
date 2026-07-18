import { Component, ElementRef, OnInit, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent implements OnInit {
  title = "dnowinski";
  readonly isGriftOsRoute = signal(false);
  readonly isSudokuRoute = signal(false);

  constructor(){
    effect(() => {
      this.elementRef.nativeElement.style.setProperty(`--primary-color`, this.theme.getColor())
    })

    this.updateRouteShell(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateRouteShell(event.urlAfterRedirects);
      }
    });
  }

  private elementRef = inject(ElementRef)
  private readonly router = inject(Router);
  public theme = inject(ThemeService)

  ngOnInit(): void {
    this.elementRef.nativeElement.removeAttribute("ng-version");
    this.elementRef.nativeElement.removeAttribute("ng-server-context");
  }

  private updateRouteShell(url: string): void {
    const path = url.split('?')[0].replace(/\/$/, '');
    this.isGriftOsRoute.set(path.startsWith('/experimental/grift-os'));
    this.isSudokuRoute.set(path === '/experimental/sudoku');
  }
}
