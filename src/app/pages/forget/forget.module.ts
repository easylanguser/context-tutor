import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ForgetPage } from './forget.page';

const routes: Routes = [
	{
		path: '',
		component: ForgetPage
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		ReactiveFormsModule,
		RouterModule.forChild(routes)
	],
	declarations: [ForgetPage]
})
export class ForgetPageModule { }
