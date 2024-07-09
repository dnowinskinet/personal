import { Component, ViewEncapsulation, signal, input } from '@angular/core';
import socialLinkData from '../../../data/social-link.data';
import { SocialLinkSchema } from '../../../data/schema/social-links.schema'
import { NgClass } from '@angular/common'
import { iSpan } from '../icon/icon2';
import { faEnvelope,  } from '@fortawesome/free-solid-svg-icons';
import {faSteam, faLinkedin, faInstagram} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'social-link',
  standalone: true,
  imports: [NgClass, iSpan, FontAwesomeModule], 
  encapsulation: ViewEncapsulation.None,
  template: `
    @for (s of socialLink(); track $index) {
    <a
      [href]="s.link"
      target="_blank"
      [attr.aria-label]="s.name"
      [attr.title]="s.name"
     class="dark:md:hover:text-{{s.light}} dark:md:text-slate-200 md:text-black"
    >
      <iSpan 
        [passthrough]="s.icon"
        iconClass="dark:md:hover:text-{{s.light}} dark:md:text-slate-200 md:text-black" />
    
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
