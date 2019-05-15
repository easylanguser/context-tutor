import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EditLessonTitlePage } from './edit-lesson-title.page';

const routes: Routes = [
  {
    path: '',
    component: EditLessonTitlePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EditLessonTitlePage]
})
export class EditLessonTitlePageModule {}
