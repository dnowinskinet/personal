import { Component, ViewEncapsulation, signal, input } from '@angular/core';
import socialLinkData from '../../../data/social-link.data';
import { SocialLinkSchema } from '../../../data/schema/social-links.schema'
import { iSpan } from '../icon/icon2';
import { faEnvelope,  } from '@fortawesome/free-solid-svg-icons';
import {faSteam, faLinkedin, faInstagram} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'social-link',
    imports: [iSpan, FontAwesomeModule],
    encapsulation: ViewEncapsulation.None,
    template: `
    @for (s of socialLink(); track $index) {
    <a
      [href]="s.link"
      target="_blank"
      [attr.aria-label]="s.name"
      [attr.title]="s.name"
      class="text-primary hover:text-gray-500 dark:hover:text-primary-400 dark:text-gray-100 lg:p-0 dark:border-gray-700"
    >
      <iSpan 
        [passthrough]="s.icon"
        class="hover:fill-[{{ s.color }}] dark:hover:fill-[{{ s.color }}]" />
        </a>
    }
  `,
    styles: [
        `
      social-link {
        @apply flex flex-row gap-3;
      }
    `,
    ]
})
export class SocialLink {
    faSteam =faSteam;
  faEnvelope =faEnvelope;
  faLinkedin =faLinkedin;
  faInstagram=faInstagram;
  public socialLink = signal<SocialLinkSchema[]>(socialLinkData);
  constructor() {}
}
