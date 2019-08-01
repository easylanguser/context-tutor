import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SentenceGuessPage } from './sentence-guess.page';
import { WordViewComponent } from 'src/app/components/word-view/word-view.component';
import { CharacterComponent } from 'src/app/components/character/character.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild([
			{
				path: '',
				component: SentenceGuessPage
			}
		])
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	declarations: [SentenceGuessPage, WordViewComponent, CharacterComponent]
})
export class SentenceGuessPageModule { }
