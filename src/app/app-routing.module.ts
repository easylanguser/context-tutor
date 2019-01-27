import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LessonsEditingPage } from './lesson-editing/lessons-editing';
import { SentenceGuessPage } from './sentence-guess/sentence-guess.page';
import {AuthGuardService} from "./services/guard/auth-guard.service";



const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule', canActivate: [AuthGuardService] },
  { path: 'lesson/:id', component: LessonsEditingPage,canActivate: [AuthGuardService] },
  { path: 'sentence-guess', component: SentenceGuessPage, canActivate: [AuthGuardService] },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
