import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SentencesListPage } from './pages/sentences-list/sentences-list.page';
import { SentenceGuessPage } from './pages/sentence-guess/sentence-guess.page';
import { AddLessonPage } from './pages/add-lesson/add-lesson.page';
import { EditLessonTitlePage } from './pages/edit-lesson-title/edit-lesson-title.page';
import { SentenceAddingPage } from './pages/sentence-adding/sentence-adding.page';
import { ShareAddingChoicePage } from './pages/share-adding-choice/share-adding-choice.page';
import { LessonsListPage } from './pages/lessons-list/lessons-list.page';

const routes: Routes = [
	{ path: '', redirectTo: 'lessons-list', pathMatch: 'full' },
	{ path: 'lessons-list', component: LessonsListPage },
	{ path: 'sentences-list', component: SentencesListPage },
	{ path: 'sentence-guess', component: SentenceGuessPage },
	{ path: 'add-lesson', component: AddLessonPage },
	{ path: 'share-adding-choice', component: ShareAddingChoicePage },
	{ path: 'sentence-adding', component: SentenceAddingPage },
	{ path: 'edit-lesson-title', component: EditLessonTitlePage },
	{ path: '**', redirectTo: 'lessons-list' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule { }
