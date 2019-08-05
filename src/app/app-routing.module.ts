import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './services/guard/auth-guard.service';

const routes: Routes = [
	{ path: '', redirectTo: 'lessons-list', pathMatch: 'full' },
	{ path: 'lessons-list', loadChildren: './pages/lessons-list/lessons-list.page.module#LessonsListPageModule', canActivate: [AuthGuardService] },
	{ path: 'sentences-list', loadChildren: './pages/sentences-list/sentences-list.page.module#SentencesListPageModule' },
	{ path: 'sentence-guess', loadChildren: './pages/sentence-guess/sentence-guess.module#SentenceGuessPageModule'  },
	{ path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
	{ path: 'account', loadChildren: './pages/account/account.module#AccountPageModule' },
	{ path: 'forget', loadChildren: './pages/forget/forget.module#ForgetPageModule' },
	{ path: 'change', loadChildren: './pages/change/change.module#ChangePageModule' },
	{ path: 'add-lesson', loadChildren: './pages/add-lesson/add-lesson.module#AddLessonPageModule' },
	{ path: 'share-adding-choice', loadChildren: './pages/share-adding-choice/share-adding-choice.module#ShareAddingChoicePageModule' },
	{ path: 'sentence-adding', loadChildren: './pages/sentence-adding/sentence-adding.module#SentenceAddingPageModule' },
	{ path: 'edit-lesson-title', loadChildren: './pages/edit-lesson-title/edit-lesson-title.module#EditLessonTitlePageModule' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule { }
