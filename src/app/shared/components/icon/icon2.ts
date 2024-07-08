import { Component, Signal, ViewEncapsulation, input } from '@angular/core';
import { NgClass } from '@angular/common'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope,  } from '@fortawesome/free-solid-svg-icons';
import { faSteam, faLinkedin, faInstagram} from '@fortawesome/free-brands-svg-icons'

@Component({
  selector: 'iSpan',
  imports: [NgClass, FontAwesomeModule],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  template: `
  <fa-icon [icon]="title()" >
</fa-icon>
  `,
})
export class iSpan {
  title = input<string>('');
  title2 = input<string | Signal<string>>();
  size = input<number>(30);
  color = input<string>('');
  viewBox = input<string>('0 0 24 24');
  iconClass = input<string>('');
  name = input<string>('');

}
