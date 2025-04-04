import {  Component, ElementRef, OnInit, ViewEncapsulation, effect, inject } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';
import { initFlowbite } from 'flowbite';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent implements OnInit {
  title = "dnowinski";
  constructor(){
    effect(() => {
      this.elementRef.nativeElement.style.setProperty(`--primary-color`, this.theme.getColor())
    })
  }
  private elementRef = inject(ElementRef)
  public theme = inject(ThemeService)
  ngOnInit(): void {
    this.elementRef.nativeElement.removeAttribute("ng-version");
    this.elementRef.nativeElement.removeAttribute("ng-server-context");
  }

}