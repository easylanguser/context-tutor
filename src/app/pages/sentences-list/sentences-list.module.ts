import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SentencesListPage } from './sentences-list';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule
	],
	declarations: [
		SentencesListPage,
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SentencesListPageModule { }
