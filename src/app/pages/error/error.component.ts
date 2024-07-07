import { Component, ViewEncapsulation } from '@angular/core';
import { Button } from '@shared/components/button/button';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
  imports: [Button],
  encapsulation: ViewEncapsulation.None,
  standalone: true
})
export class ErrorComponent {

}
