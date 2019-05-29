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
import { AuthGuardService } from './services/guard/auth-guard.service';

const routes: Routes = [
	{ path: '', redirectTo: 'lessons-list', pathMatch: 'full' },
	{ path: 'lessons-list', loadChildren: './pages/lessons-list/lessons-list.page.module#LessonsListPageModule', canActivate: [AuthGuardService] },
	{ path: 'sentences-list', component: SentencesListPage, canActivate: [AuthGuardService] },
	{ path: 'sentence-guess', component: SentenceGuessPage, canActivate: [AuthGuardService]  },
	{ path: 'login', component: LoginPage, canActivate: [AuthGuardService]  },
	{ path: 'sign-up', component: SignUpPage, canActivate: [AuthGuardService]  },
	{ path: 'account', component: AccountPage, canActivate: [AuthGuardService]  },
	{ path: 'forget', component: ForgetPage, canActivate: [AuthGuardService]  },
	{ path: 'change', component: ChangePage, canActivate: [AuthGuardService]  },
	{ path: 'add-lesson', component: AddLessonPage, canActivate: [AuthGuardService]  },
	{ path: 'share-adding-choice', component: ShareAddingChoicePage, canActivate: [AuthGuardService]  },
	{ path: 'sentence-adding', component: SentenceAddingPage, canActivate: [AuthGuardService]  },
	{ path: 'edit-lesson-title', component: EditLessonTitlePage, canActivate: [AuthGuardService]  }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule { }
