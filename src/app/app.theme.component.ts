import { Component, ElementRef, OnInit, ViewEncapsulation, effect, inject } from '@angular/core';
import { Navbar } from './layout/navbar/navbar';
import { ScrollToTop } from './shared/components/scroll-to-top/scroll-to-top';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer/footer';
import { ThemeService } from './core/services/theme.service';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-root',
  template: `
  <navbar/>
    <main class="site-main max-w-screen-lg mx-auto px-4 md:px-10 mt-20 mb-4 overflow-x-hidden">
      <router-outlet/>
      <scroll-to-top/>
    </main>
  <foot-note/>
  `,
  imports: [Footer, RouterOutlet, Navbar, ScrollToTop, NgClass],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }

    .site-main {
      flex: 1 0 auto;
      min-height: 0;
      width: 100%;
    }

    foot-note {
      flex-shrink: 0;
    }
  `],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class AppTheme implements OnInit {
  constructor(){
    effect(() => {
      this.elementRef.nativeElement.style.setProperty(`--primary-color`, this.theme.getColor())
    })
  }
  private elementRef = inject(ElementRef)
  public theme = inject(ThemeService)
  ngOnInit(): void {
    this.elementRef.nativeElement.removeAttribute("ng-version");
    this.elementRef.nativeElement.removeAttribute("ng-server-context");
  }

}
