import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MetaService } from '@core/services/meta.service';
import profileData from '@data/profile.data';

@Component({
  selector: 'app-terms-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './terms.html',
})
export class TermsPage {
  private readonly metaService = inject(MetaService);

  constructor() {
    this.metaService.setMetaTags(
      `Terms of Use - ${profileData.name}`,
      'Terms governing use of dnowinski.com, including its games, public source code, third-party marks, and automated access.',
      ['terms of use', 'website terms', 'dnowinski.com']
    );
  }
}
