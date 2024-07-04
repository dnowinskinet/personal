import { NgModule } from '@angular/core';
import { SafePipe } from '@core/pipe/safe.pipe';
import { MarkdownPipe } from '@core/pipe/markdown.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [SafePipe, MarkdownPipe],
  exports: [SafePipe, MarkdownPipe]
})
export class CoreModule { }
