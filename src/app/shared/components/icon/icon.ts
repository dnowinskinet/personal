import { Component, Signal, ViewEncapsulation, input } from '@angular/core';
import { NgClass } from '@angular/common'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'icon',
    imports: [NgClass, FontAwesomeModule],
    encapsulation: ViewEncapsulation.None,
    template: `
  <svg [ngClass]="{'fill-gray-900 dark:fill-gray-200 flex' : color() === ''}" class="{{iconClass()}}" [attr.viewBox]="viewBox()"
  [attr.fill]="color()" [attr.width]="size()" [attr.height]="size()">
    <path [attr.d]="path()" />
  </svg>
  `
})
export class Icon {
  path = input<string | Signal<string>>();
  size = input<number>(30);
  color = input<string>('');
  viewBox = input<string>('0 0 24 24');
  iconClass = input<string>('');
  faCoffee = faCoffee;
}
