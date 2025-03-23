import { Component, Signal, ViewEncapsulation, input } from '@angular/core';
import { NgClass } from '@angular/common'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope,  } from '@fortawesome/free-solid-svg-icons';
import { faSteam, faLinkedin, faInstagram} from '@fortawesome/free-brands-svg-icons';
import { IconDefinition } from "@fortawesome/angular-fontawesome";

@Component({
    selector: 'iSpan',
    imports: [NgClass, FontAwesomeModule,],
    encapsulation: ViewEncapsulation.None,
    template: `
  <fa-icon [icon]="passthrough()" [ngClass]="{'fill-gray-900 dark:fill-gray-200 flex' : color() === ''}" class="{{iconClass()}}"  [attr.viewBox]="viewBox()"
  [attr.fill]="color()" size="xl">
</fa-icon>
  `
})
export class iSpan {
  faSteam =faSteam;
  faEnvelope =faEnvelope;
  faLinkedin =faLinkedin;
  faInstagram=faInstagram;
  title = input<string>();
  passthrough = input<any>();
  light = input<any>('');
  title2 = input<string | Signal<string>>();
  size = input<number>(30);
  color = input<any>();
  viewBox = input<string>('0 0 24 24');
  iconClass = input<string>('');
  name = input<string>('');

}
