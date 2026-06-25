import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject } from '@angular/core';
import { MetaService } from '@core/services/meta.service';
import profileData from '@data/profile.data';
import { AiSettlementGameComponent } from '@pages/experimental/ai-settlement-game/ai-settlement-game';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiSettlementGameComponent],
  templateUrl: './experimental.component.html',
  styleUrl: './experimental.component.scss',
})
export class ExperimentalComponent {
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  metaService = inject(MetaService);
  
  constructor() {
    this.metaService.setMetaTags(
      `Experimental - ${profileData.name}`,
      'Test experimental browser games like the untitled AI settlement prototype.',
      [
        'daniel thomas nowinski',
        'experimental',
        'games',
        'ai settlement',
        'browser game',
        'strategy game',
        'simulation game',
        'angular games',
      ]
    );
  }
}
