import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SentencesListPage } from './pages/sentences-list/sentences-list.page';
import { SentenceGuessPage } from './pages/sentence-guess/sentence-guess.page';
import { LoginPage } from './pages/login/login.page';
import { SignUpPage } from './pages/sign-up/sign-up.page';
import { AccountPage } from './pages/account/account.page';
import { ForgetPage } from './pages/forget/forget.page';
import { ChangePage } from './pages/change/change.page';
import { AddLessonPage } from './pages/add-lesson/add-lesson.page';
import { EditLessonTitlePage } from './pages/edit-lesson-title/edit-lesson-title.page';
import { SentenceAddingPage } from './pages/sentence-adding/sentence-adding.page';
import { ShareAddingChoicePage } from './pages/share-adding-choice/share-adding-choice.page';

const routes: Routes = [
	{ path: '', redirectTo: 'lessons-list', pathMatch: 'full' },
	{
		path: 'lessons-list', loadChildren: './pages/lessons-list/lessons-list.page.module#LessonsListPageModule',
		
	},
	{ path: 'sentences-list', component: SentencesListPage },
	{ path: 'sentence-guess', component: SentenceGuessPage },
	{ path: 'login', component: LoginPage },
	{ path: 'sign-up', component: SignUpPage },
	{ path: 'account', component: AccountPage },
	{ path: 'forget', component: ForgetPage },
	{ path: 'change', component: ChangePage },
	{ path: 'add-lesson', component: AddLessonPage },
	{ path: 'share-adding-choice', component: ShareAddingChoicePage },
	{ path: 'sentence-adding', component: SentenceAddingPage },
	{ path: 'edit-lesson-title', component: EditLessonTitlePage }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule { }
