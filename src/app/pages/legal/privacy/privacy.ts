import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MetaService } from '@core/services/meta.service';
import profileData from '@data/profile.data';

@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './privacy.html',
})
export class PrivacyPage {
  private readonly metaService = inject(MetaService);

  constructor() {
    this.metaService.setMetaTags(
      `Privacy Policy - ${profileData.name}`,
      'Privacy practices for dnowinski.com, including local browser storage and the limited technical information processed by hosting providers.',
      ['privacy policy', 'local storage', 'dnowinski.com']
    );
  }
}
