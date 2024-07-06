import { NgModule } from '@angular/core';
import { SafePipe } from './pipe/safe.pipe';
import { MarkdownPipe } from './pipe/markdown.pipe';

@NgModule({
  declarations: [SafePipe, MarkdownPipe],
  exports: [SafePipe, MarkdownPipe]
})
export class CoreModule { }
