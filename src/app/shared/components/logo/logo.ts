import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
    selector: 'logo',
    imports: [RouterLink],
    encapsulation: ViewEncapsulation.None,
    template: `
  <a routerLink="/" aria-label="Brand">
    <img class="img-responsive" src="/assets/image/biography/Dhex.png" alt="biography" width="25" height="25" viewBox="0 0 9 8" fill="none">
  </a>
`
})
export class Logo {}
