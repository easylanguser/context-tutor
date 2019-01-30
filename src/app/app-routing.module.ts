import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LessonsEditingPage} from './pages/lesson-editing/lessons-editing';
import {SentenceGuessPage} from './pages/sentence-guess/sentence-guess.page';

import {AuthGuardService} from "./services/guard/auth-guard.service";
import {LoginPage} from "./pages/login/login.page";
import {SignUpPage} from "./pages/sign-up/sign-up.page";
import {AccountPage} from "./pages/account/account.page";

const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', loadChildren: './pages/home/home.module#HomePageModule', canActivate: [AuthGuardService]},
    {path: 'lesson-editing', component: LessonsEditingPage, canActivate: [AuthGuardService]},
    {path: 'sentence-guess', component: SentenceGuessPage, canActivate: [AuthGuardService]},
    {path: 'login', component: LoginPage},
    {path: 'sign-up', component: SignUpPage},
    {path: 'account', component: AccountPage, canActivate: [AuthGuardService]}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
