import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  ViewEncapsulation,
  effect,
  computed,
  inject,
  DOCUMENT
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { DarkModeService } from '../../core/services/dark-mode.service';
import { NgClass } from '@angular/common';
import navlinkData from '../../data/nav-link.data';
import { ThemeService } from '../../core/services/theme.service';
import { Icon } from '@shared/components/icon/icon';
import { moon, sun } from '@icon/regular.icon';
import { paintBucket } from '@icon/solid.icon';
import { ToolbarColor } from '../../shared/components/toolbar-color/toolbar-color'

@Component({
    selector: 'navbar',
    imports: [RouterModule, NgClass, Icon, ToolbarColor],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    template: `<nav class="bg-gray-50/75 dark:bg-gray-900/75 fixed w-full z-[2] top-0 start-0 backdrop-blur-lg rounded">
  <toolbar-color/>
  <div class="max-w-screen-lg flex flex-wrap items-center justify-between mx-auto p-4 border-y border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700">
    <a href="https://dnowinski.com"><img src="/assets/image/logo.png" alt="dnowinski logo" class="img-responsive" style="height:40px;"/></a>
    <div class="flex lg:order-2 lg:space-x-0">
    <button (click)="darkModeService.toggleDarkMode()" type="button" aria-label="DarkMode"
        class="mx-1 inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
        <icon [path]="icon()" [size]="20" iconClass="dark:fill-white fill-black"></icon>
      </button>
      <button (click)="themeColor.toggle()" aria-label="Github" class="mx-1 inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
          <icon [path]="paintBucket" [size]="20" iconClass="dark:fill-white fill-black"></icon>
      </button>
      <button (click)="open = !open" type="button" aria-label="MenuToggle"
        class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-900 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-600">
        <div class="space-y-1.5">
          <div class="w-6 h-0.5 bg-black dark:bg-white transition-all delay-0"
            [ngClass]="{'rotate-45 translate-y-2': open}"></div>
          <div class="w-6 h-0.5 bg-black dark:bg-white transition-all delay-0" [ngClass]="{'opacity-0': open}"></div>
          <div class="w-6 h-0.5 bg-black dark:bg-white transition-all delay-0"
            [ngClass]="{'-rotate-45 -translate-y-2': open}">
          </div>
        </div>
      </button>
    </div>
    <div class="w-full ml-auto lg:w-auto lg:order-1 flex lg:block min-h-96 lg:min-h-0 items-center"
      [ngClass]="{ 'hidden': !open}">
      <ul
        class="text-center w-full flex flex-col p-4 mx-2 lg:p-0 mt-4 font-medium rounded-lg lg:items-center lg:space-x-8 lg:flex-row lg:mt-0 dark:border-gray-700">
        @for (link of links(); track link.path) {
          <li>
            <a [routerLink]="link.path" routerLinkActive="text-primary dark:text-primary-400"
              [routerLinkActiveOptions]="{exact: true}" (click)="closeNavigation()"
              class="block py-4 px-3 rounded hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:text-primary-400 dark:text-gray-100 lg:p-0 dark:border-gray-700">{{link.name}}</a>
          </li>
        }
        <li class="relative">
          <button
            type="button"
            class="inline-flex w-full items-center justify-center gap-1 rounded px-3 py-4 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-100 dark:hover:text-primary-400 lg:w-auto lg:p-0"
            aria-haspopup="true"
            [attr.aria-expanded]="experimentalOpen"
            (click)="toggleExperimental($event)"
          >
            Experimental
            <span aria-hidden="true" class="text-xs transition" [ngClass]="{'rotate-180': experimentalOpen}">v</span>
          </button>
          @if (experimentalOpen) {
            <ul class="mt-1 grid gap-1 rounded-lg border border-gray-200 bg-white/95 p-2 text-sm shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 lg:absolute lg:left-1/2 lg:top-full lg:mt-3 lg:min-w-44 lg:-translate-x-1/2">
              @for (experiment of experimentalLinks; track experiment.path) {
                <li>
                  <a
                    [routerLink]="experiment.path"
                    routerLinkActive="text-primary dark:text-primary-400"
                    (click)="closeNavigation()"
                    class="block rounded px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                  >
                    {{ experiment.name }}
                  </a>
                </li>
              }
            </ul>
          }
        </li>
      </ul>
    </div>
  </div>

</nav>`
})
export class Navbar {
  open = false;
  experimentalOpen = false;
  paintBucket = paintBucket;
  links = computed(() => navlinkData.filter((link) => link.name !== 'Experimental'))
  experimentalLinks = [
    {
      name: 'AI Settlement',
      path: '/experimental/settlement',
    },
    {
      name: 'GriftOS',
      path: '/experimental/grift-os',
    },
  ];
  icon = computed(() => this.darkModeService.isDark() ? sun : moon)
  darkModeService = inject(DarkModeService);
  renderer = inject(Renderer2);
  document: Document = inject(DOCUMENT);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  public themeColor = inject(ThemeService)
  constructor() {
    effect(() => {
      this.applyDarkModeStyles();
    });
  }

  toggleExperimental(event?: Event): void {
    event?.stopPropagation();
    this.experimentalOpen = !this.experimentalOpen;
  }

  closeNavigation(): void {
    this.open = false;
    this.experimentalOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target;

    if (target instanceof Node && !this.elementRef.nativeElement.contains(target)) {
      this.experimentalOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.experimentalOpen = false;
  }

  private applyDarkModeStyles() {
    const darkMode = this.darkModeService.isDark();
    const root = this.document.documentElement;
    const favicon = this.document.querySelector("link[rel*='icon']");
    const newFaviconHref = `assets/icons/favicon-${darkMode ? 'dark' : 'light'
      }.png`;
    this.renderer.setAttribute(favicon, 'href', newFaviconHref);
    root.classList[darkMode ? 'add' : 'remove']('dark');
  }
}
