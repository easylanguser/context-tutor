import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LessonsEditingPage } from './lesson-editing/lessons-editing';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'lesson-editing', component: LessonsEditingPage }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
