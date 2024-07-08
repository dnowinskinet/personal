import { Component, ViewEncapsulation, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import socialLinkData from '../../../data/social-link.data';
import { SocialLinkSchema } from '../../../data/schema/social-links.schema'
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { Icon2} from '@shared/components/icon/icon2';
import { NgClass } from '@angular/common'
@Component({
  selector: 'social-link',
  standalone: true,
  imports: [FontAwesomeModule, NgClass, Icon2], 
  encapsulation: ViewEncapsulation.None,
  template: `
    @for (s of socialLink(); track $index) {
    <a
      [href]="s.link"
      target="_blank"
      [attr.aria-label]="s.name"
      [attr.title]="s.name"
    >
      <fa-icon
      [icon]="s.icon"
      size="2x"
      iconClass="hover:fill-[{{ s.color }}] dark:hover:fill-[{{ s.color }}]"
      />
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
  public socialLink = signal<SocialLinkSchema[]>(socialLinkData);
  constructor() {}
}
