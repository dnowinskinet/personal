import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MetaService } from '@core/services/meta.service';
import profileData from '@data/profile.data';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './experimental.component.html',
  styleUrl: './experimental.component.scss',
})
export class ExperimentalComponent {
  readonly showExperimentIndex = signal(false);
  readonly experiments = [
    {
      label: 'AI Settlement',
      path: '/experimental/settlement',
      description: 'A compact systems prototype about civic pressure, resources, and settlement survival.',
    },
    {
      label: 'Sudoku',
      path: '/experimental/sudoku',
      description: 'Daily seeded Sudoku and unlimited puzzles with four difficulties and local records.',
    },
    {
      label: 'GriftOS',
      path: '/experimental/grift-os',
      description: 'A satirical idle tycoon about paper valuation, Hustles, Leverage, and the exit.',
    },
  ];

  metaService = inject(MetaService);
  private readonly router = inject(Router);
  
  constructor() {
    this.updateIndexVisibility(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateIndexVisibility(event.urlAfterRedirects);
      }
    });

    this.metaService.setMetaTags(
      `Experimental - ${profileData.name}`,
      'Play experimental browser game prototypes.',
      [
        'daniel thomas nowinski',
        'experimental',
        'games',
        'ai settlement',
        'griftos',
        'sudoku',
        'browser game',
        'strategy game',
        'simulation game',
        'angular games',
      ]
    );
  }

  private updateIndexVisibility(url: string): void {
    const path = url.split('?')[0].replace(/\/$/, '');
    this.showExperimentIndex.set(path === '/experimental');
  }
}
