import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { MetaService } from '../../core/services/meta.service';
import profileData from '../../data/profile.data';
import { ImageSkeletonDirective } from '../../core/directives/image-skeleton.directive';
import { ExpertiseArea } from './expertise-area/expertise-area';
import { Intro } from './expertise-area/intro';
import { Loader } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
@Component({
  selector: 'home-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ExpertiseArea, Intro, ImageSkeletonDirective, Loader],
  template: `
    @defer(on immediate){
      <intro/>
      <expertise-area/>
    }@placeholder {
      <loader/>
    }
  `
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
  }
}
