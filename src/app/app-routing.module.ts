import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SentencesListPage } from './pages/sentences-list/sentences-list.page';
import { SentenceGuessPage } from './pages/sentence-guess/sentence-guess.page';
import { LessonsListPage } from './pages/lessons-list/lessons-list.page';

const routes: Routes = [
	{ path: '', redirectTo: 'lessons-list', pathMatch: 'full' },
	{ path: 'lessons-list', component: LessonsListPage },
	{ path: 'sentences-list', component: SentencesListPage },
	{ path: 'sentence-guess', component: SentenceGuessPage },
	{ path: '**', redirectTo: 'lessons-list' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule { }
