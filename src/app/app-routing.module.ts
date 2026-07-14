import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//pages
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { ErrorComponent } from './pages/error/error.component';
import { ExperimentalComponent } from './pages/experimental/experimental.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },  
  { path: 'about', component: AboutComponent, pathMatch: 'full' },
  {
    path: 'experimental',
    component: ExperimentalComponent,
    children: [
      {
        path: 'settlement',
        loadComponent: () => import('./pages/experimental/ai-settlement-game/ai-settlement-game')
          .then((m) => m.AiSettlementGameComponent),
      },
      {
        path: 'sudoku',
        loadComponent: () => import('./pages/experimental/sudoku-game/sudoku-game')
          .then((m) => m.SudokuGameComponent),
      },
      {
        path: 'grift-os',
        loadComponent: () => import('./pages/experimental/grift-os-game/grift-os-game')
          .then((m) => m.GriftOsGameComponent),
      },
    ],
  },
  { path: '**', component: ErrorComponent, pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
