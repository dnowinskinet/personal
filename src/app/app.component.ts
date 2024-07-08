import {  Component, ElementRef, OnInit, ViewEncapsulation, effect, inject } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = "angular-dashboard-page";
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