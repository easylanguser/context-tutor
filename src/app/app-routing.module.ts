import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LessonsEditingPage } from './lesson-editing/lessons-editing';
import { SentenceGuessPage } from './sentence-guess/sentence-guess.page';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'lesson-editing', component: LessonsEditingPage },
  { path: 'sentence-guess', component: SentenceGuessPage }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
