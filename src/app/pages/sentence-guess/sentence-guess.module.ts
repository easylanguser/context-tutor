import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SentenceGuessPage } from './sentence-guess.page';
import { WordViewComponent } from 'src/app/components/word-view/word-view.component';
import { CharacterComponent } from 'src/app/components/character/character.component';

const routes: Routes = [
	{
		path: '',
		component: SentenceGuessPage
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes)
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	declarations: [SentenceGuessPage, WordViewComponent, CharacterComponent]
})
export class SentenceGuessPageModule { }
