import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './services/guard/auth-guard.service';

const routes: Routes = [
	{ path: '', redirectTo: 'lessons-list', pathMatch: 'full' },
	{ path: 'lessons-list', loadChildren: () => import('./pages/lessons-list/lessons-list.page.module').then(mod => mod.LessonsListPageModule), canActivate: [AuthGuardService] },
	{ path: 'sentences-list', loadChildren: () => import('./pages/sentences-list/sentences-list.page.module').then(mod => mod.SentencesListPageModule), canActivate: [AuthGuardService] },
	{ path: 'sentence-guess', loadChildren: () => import('./pages/sentence-guess/sentence-guess.module').then(mod => mod.SentenceGuessPageModule), canActivate: [AuthGuardService]  },
	{ path: 'login', loadChildren: () => import('./pages/login/login.module').then(mod => mod.LoginPageModule) },
	{ path: 'account', loadChildren: () => import('./pages/account/account.module').then(mod => mod.AccountPageModule) },
	{ path: 'forget', loadChildren: () => import('./pages/forget/forget.module').then(mod => mod.ForgetPageModule) },
	{ path: 'change', loadChildren: () => import('./pages/change/change.module').then(mod => mod.ChangePageModule) },
	{ path: 'add-lesson', loadChildren: () => import('./pages/add-lesson/add-lesson.module').then(mod => mod.AddLessonPageModule) },
	{ path: 'share-adding-choice', loadChildren: () => import('./pages/share-adding-choice/share-adding-choice.module').then(mod => mod.ShareAddingChoicePageModule)  },
	{ path: 'sentence-adding', loadChildren: () => import('./pages/sentence-adding/sentence-adding.module').then(mod => mod.SentenceAddingPageModule) },
	{ path: 'edit-lesson-title', loadChildren: () => import('./pages/edit-lesson-title/edit-lesson-title.module').then(mod => mod.EditLessonTitlePageModule) },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule { }
