import { NgModule, OnInit, effect, inject, ElementRef, ViewEncapsulation } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { Footer } from './layout/footer/footer';
import { AppTheme } from './app.theme.component';
import { Navbar } from './layout/navbar/navbar';
import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { Intro } from './pages/home/expertise-area/intro';
import { ExpertiseArea } from './pages/home/expertise-area/expertise-area';

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
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}