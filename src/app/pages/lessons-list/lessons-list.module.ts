import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LessonsListPage } from './lessons-list';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: LessonsListPage
      }
    ])
  ],
  declarations: [LessonsListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LessonsListPageModule { }
