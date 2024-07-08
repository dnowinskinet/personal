import { Component, ViewEncapsulation, signal, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import socialLinkData from '../../../data/social-link.data';
import { SocialLinkSchema } from '../../../data/schema/social-links.schema'
import { NgClass } from '@angular/common'
import { Icon2 } from '../icon/icon2';

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
      class="text-primary hover:text-primary dark:hover:text-primary-400 dark:text-gray-100 lg:p-0 dark:border-gray-700"
    >
      <fa-icon
      [icon]="s.icon"
      size="2x"
     style=""
      class="hover:fill-[{{ s.color }}] dark:hover:fill-[{{ s.color }}]"
      
      
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
  iconClass = input<string>('');
  public socialLink = signal<SocialLinkSchema[]>(socialLinkData);
  constructor() {}
}
