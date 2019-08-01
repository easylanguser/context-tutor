import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareAddingChoicePage } from './share-adding-choice.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: ShareAddingChoicePage
      }
    ])
  ],
  declarations: [ShareAddingChoicePage]
})
export class ShareAddingChoicePageModule { }
