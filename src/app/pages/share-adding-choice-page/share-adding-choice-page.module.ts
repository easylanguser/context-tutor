import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ShareAddingChoicePagePage } from './share-adding-choice-page.page';

const routes: Routes = [
  {
    path: '',
    component: ShareAddingChoicePagePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ShareAddingChoicePagePage]
})
export class ShareAddingChoicePagePageModule {}
