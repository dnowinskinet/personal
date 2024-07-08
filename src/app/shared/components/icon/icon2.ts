import { Component, Signal, ViewEncapsulation, input } from '@angular/core';
import { NgClass } from '@angular/common'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'fa-icon',
  imports: [NgClass, FontAwesomeModule],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  template: `
  <svg [ngClass]="{'fill-gray-900 dark:fill-gray-200 flex' : color() === ''}" class="{{iconClass()}}" [attr.viewBox]="viewBox()"
  [attr.fill]="color()" >
    <path [attr.d]="path()" />
  </svg>
  `,
})
export class Icon2 {
  path = input<string | Signal<string>>();
  color = input<string>('');
  viewBox = input<string>('0 0 24 24');
  iconClass = input<string>('');
}
