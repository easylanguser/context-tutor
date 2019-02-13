import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SentencesListPage } from './pages/sentences-list/sentences-list';
import { SentenceGuessPage } from './pages/sentence-guess/sentence-guess.page';

import { AuthGuardService } from "./services/guard/auth-guard.service";
import { LoginPage } from "./pages/login/login.page";
import { SignUpPage } from "./pages/sign-up/sign-up.page";
import { AccountPage } from "./pages/account/account.page";
import { ForgetPage } from "./pages/forget/forget.page";
import { ChangePage } from "./pages/change/change.page";
import { EditLessonPage } from './pages/edit-lesson/edit-lesson.page';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadChildren: './pages/home/home.module#HomePageModule', canActivate: [AuthGuardService] },
    { path: 'sentences-list', component: SentencesListPage, canActivate: [AuthGuardService] },
    { path: 'sentence-guess', component: SentenceGuessPage, canActivate: [AuthGuardService] },
    { path: 'login', component: LoginPage },
    { path: 'sign-up', component: SignUpPage },
    { path: 'account', component: AccountPage, canActivate: [AuthGuardService] },
    { path: 'forget', component: ForgetPage },
    { path: 'change', component: ChangePage, canActivate: [AuthGuardService] },
    { path: 'edit-lesson', component: EditLessonPage },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
