import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SentenceAddingPage } from './sentence-adding.page';

const routes: Routes = [
  {
    path: '',
    component: SentenceAddingPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SentenceAddingPage]
})
export class SentenceAddingPageModule {}
