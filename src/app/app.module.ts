import { NgModule, OnInit, effect, inject, ElementRef, ViewEncapsulation } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { PreloadAllModules, provideRouter, withPreloading, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { Footer } from './layout/footer/footer';
import { Navbar } from './layout/navbar/navbar';
import { AppComponent } from './app.component';
import { routes } from './app-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { Intro } from './pages/home/expertise-area/intro';
import { ExpertiseArea } from './pages/home/expertise-area/expertise-area';
import { ScrollToTop } from '@shared/components/scroll-to-top/scroll-to-top';
import { NgClass } from '@angular/common';
import { ErrorComponent } from './pages/error/error.component';

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
    NgClass,
    ErrorComponent,
  ],
  providers: [
    provideAnimations(),
    provideHttpClient(withFetch()),
    provideRouter(routes, withViewTransitions(), withPreloading(PreloadAllModules),
      withInMemoryScrolling({
      scrollPositionRestoration: 'enabled',
    })
  ),
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}