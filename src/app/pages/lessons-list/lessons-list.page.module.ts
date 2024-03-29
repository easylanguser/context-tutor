import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LessonsListPage } from './lessons-list.page';

const routes: Routes = [
	{
		path: '',
		component: LessonsListPage
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes)
	],
	declarations: [LessonsListPage],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LessonsListPageModule { }
