import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//pages
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { ErrorComponent } from './pages/error/error.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },  
  { path: 'about', component: AboutComponent, pathMatch: 'full' },
  { path: '**', component: ErrorComponent, pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
