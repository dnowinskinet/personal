import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { MetaService } from '../../core/services/meta.service';
import profileData from '../../data/profile.data';
import { ExpertiseArea } from './expertise-area/expertise-area';
import { Intro } from '../../pages/home/components/intro/intro';
import { LanguageTools } from '../../pages/home/components/language-tools/language-tools';
import { InWork } from '../../pages/home/components/in-work/in-work';
import { Loader } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
