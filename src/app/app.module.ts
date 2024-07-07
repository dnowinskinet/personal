import { NgModule, OnInit, effect, inject, ElementRef, ViewEncapsulation } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { Footer } from './layout/footer/footer';
import { Navbar } from './layout/navbar/navbar';
import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { Intro } from './pages/home/expertise-area/intro';
import { ExpertiseArea } from './pages/home/expertise-area/expertise-area';
import { ScrollToTop } from '@shared/components/scroll-to-top/scroll-to-top';
import { NgClass } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    Navbar,
    Footer,
    Intro,
    ExpertiseArea,
    ScrollToTop,
    NgClass
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}