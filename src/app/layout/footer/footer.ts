import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import profileData from '../../data/profile.data';
import { ProfileSchema } from '../../data/schema/profile.schema';
import { Logo } from '../../shared/components/logo/logo';
import { SocialLink } from '../../shared/components/social-link/social-link';
@Component({
    selector: 'foot-note',
    template: `<footer aria-label="Site footer">
  <div class="mx-auto grid max-w-screen-lg grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-t border-neutral-200 px-4 py-2 text-gray-900 dark:border-neutral-700 dark:text-white md:px-10 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-4">
      <div class="flex min-w-0 items-center gap-2 whitespace-nowrap sm:justify-self-start">
        <logo/>
        <span>{{ profile().name }}</span>
      </div>
      <social-link class="justify-self-end sm:col-start-3 sm:row-start-1"/>
      <nav aria-label="Legal" class="col-span-2 flex min-h-11 items-center justify-center text-center text-xs text-gray-600 dark:text-gray-300 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        <span>© {{ currentYear }}</span>
        <span aria-hidden="true" class="mx-1 text-gray-400 dark:text-gray-500">·</span>
        <a
          routerLink="/privacy"
          class="inline-flex min-h-11 items-center rounded px-1 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        >Privacy</a>
        <span aria-hidden="true" class="mx-1 text-gray-400 dark:text-gray-500">·</span>
        <a
          routerLink="/terms"
          class="inline-flex min-h-11 items-center rounded px-1 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        >Terms</a>
      </nav>
  </div>
</footer>`,
    imports: [SocialLink, Logo, RouterLink],
    styles: [`
      foot-note social-link a {
        align-items: center;
        border-radius: 0.375rem;
        display: inline-flex;
        justify-content: center;
        min-height: 44px;
        min-width: 44px;
      }

      foot-note social-link a:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
    `],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Footer {
  currentYear = new Date().getFullYear();
  profile = signal<ProfileSchema>(profileData);
}
