import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MetaService } from '@core/services/meta.service';
import profileData from '@data/profile.data';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { SenatorMatchingGameComponent } from './senator-matching-game/senator-matching-game.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbAccordionModule, SenatorMatchingGameComponent],
  templateUrl: './experimental.component.html',
  styleUrl: './experimental.component.scss',
})
export class ExperimentalComponent {
  metaService = inject(MetaService);
  
  constructor() {
    this.metaService.setMetaTags(
      `Experimental - ${profileData.name}`,
      'Test new features and games like the Senator Match Challenge.',
      [
        'daniel thomas nowinski',
        'experimental',
        'games',
        'senator matching',
        'us senate',
        'political games',
        'educational games',
        'angular games',
      ]
    );
  }
}
