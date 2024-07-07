import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { MetaService } from '../../core/services/meta.service';
import profileData from '../../data/profile.data';
import { ImageSkeletonDirective } from '../../core/directives/image-skeleton.directive';
import { Loader } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-home',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  metaService = inject(MetaService);
  constructor() {
    this.metaService.setMetaTags(
      `Home - ${profileData.name}`,
      'Welcome to my person website. Its a mess, for now.',
      [
        'daniel thomas nowinski',
        'daniel thomas',
        'danielthomasnowinski',
        'data scientist',
        'dc',
        'bio',
        'developer',
        'portfolio',
        'development',
        'android',
        'web',
        'ios',
      ]
    );
  };
}
