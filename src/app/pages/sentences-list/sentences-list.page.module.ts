import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SentencesListPage } from './sentences-list.page';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild([
			{
				path: '',
				component: SentencesListPage
			}
		])
	],
	declarations: [
		SentencesListPage,
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SentencesListPageModule { }
