import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareAddingChoicePage } from './share-adding-choice.page';

const routes: Routes = [
	{
		path: '',
		component: ShareAddingChoicePage
	}
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ShareAddingChoicePage]
})
export class ShareAddingChoicePageModule { }
