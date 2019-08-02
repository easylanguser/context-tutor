import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SentencesListPage } from './sentences-list.page';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: SentencesListPage
	}
]

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes)
	],
	declarations: [
		SentencesListPage,
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SentencesListPageModule { }
