import {
  ChangeDetectionStrategy,
  Component,
  NgZone,
  ViewEncapsulation,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlatformCheckService } from '../../core/services/platform-check.service';
import profileData from '../../data/profile.data';
import { ProfileSchema } from '../../data/schema/profile.schema';
import { Logo } from '../../shared/components/logo/logo';
import { SocialLink } from '../../shared/components/social-link/social-link';
import { Subscription, interval } from 'rxjs';
@Component({
    selector: 'foot-note',
    template: `<footer aria-label="Site footer">
  <div class="mx-auto max-w-screen-lg border-t border-neutral-200 p-2 dark:border-neutral-700">
    <div
      class="grid justify-items-center gap-3 py-2 text-gray-900 dark:text-white sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4"
    >
      <div class="flex flex-row items-center gap-3 sm:justify-self-start">
        <logo/>
        <span>{{ profile().name }}</span>
      </div>
      <div class="flex items-center justify-center text-center">
        <span aria-label="Current time in Eastern Time">{{ currentTime() }} (Eastern Time)</span>
      </div>
      <social-link class="sm:justify-self-end"/>
    </div>

    <div
      class="flex flex-col items-center gap-1 border-t border-neutral-200 pt-1 text-xs text-gray-600 dark:border-neutral-800 dark:text-gray-300 sm:flex-row sm:justify-between"
    >
      <span class="py-2">© {{ currentYear }} {{ profile().name }}</span>
      <nav aria-label="Legal" class="flex items-center">
        <a
          routerLink="/privacy"
          class="inline-flex min-h-11 items-center rounded px-2 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        >Privacy</a>
        <span aria-hidden="true" class="text-gray-400 dark:text-gray-500">·</span>
        <a
          routerLink="/terms"
          class="inline-flex min-h-11 items-center rounded px-2 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        >Terms</a>
      </nav>
    </div>
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
  private readonly easternTimeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  });
  private readonly easternYearFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    timeZone: 'America/New_York',
  });

  platformCheck = inject(PlatformCheckService);
  private readonly ngZone = inject(NgZone);
  currentTime = signal<string>(this.getCurrentTime());
  currentYear = this.easternYearFormatter.format(new Date());
  profile = signal<ProfileSchema>(profileData);
  timer!: Subscription;
  constructor() {
    effect((onCleanup) => {
      if (this.platformCheck.onBrowser) {
        this.ngZone.runOutsideAngular(() => {
          this.timer = interval(1000).subscribe(() => {
            this.ngZone.run(() => {
              this.currentTime.set(this.getCurrentTime());
            });
          });
        });
      }
      onCleanup(() => {
        if (this.timer) {
          this.timer.unsubscribe();
        }
      });
    });
  }

  getCurrentTime(date = new Date()): string {
    return this.easternTimeFormatter.format(date);
  }
}
