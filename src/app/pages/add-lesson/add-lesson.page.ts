import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage-service';
import { AddLessonService } from 'src/app/services/http/add-lesson/add-lesson.service';
import { AddSentenceService } from 'src/app/services/http/add-sentence/add-sentence.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-add-lesson',
  templateUrl: './add-lesson.page.html',
  styleUrls: ['./add-lesson.page.scss'],
})
export class AddLessonPage implements OnInit {

  lessonName: string;
  lessonUrl: string;
  sentenceText: string;
  sentenceHiddenWords: string;

  sentences: any[] = [];

  constructor(
    private storageService: StorageService,
    private addLessonService: AddLessonService,
    private addSentenceService: AddSentenceService,
    private toastController: ToastController) { }

  ngOnInit() { }

  addNewSentenceToLesson() {
    if (this.sentenceText !== undefined && this.sentenceHiddenWords !== undefined) {
      const words = this.sentenceHiddenWords.split('|');
      const indexesArray: Array<[number, number]> = [];

      for (const item of words) {
        const indexes = item.split(' ');
        indexesArray.push([Number(indexes[0]), Number(indexes[1])]);
      }

      this.sentences.push({
        words: indexesArray,
        text: this.sentenceText
      });

      this.sentenceText = "";
      this.sentenceHiddenWords = "";
    }
  }

  addNewLesson() {
    if (this.lessonName !== undefined && this.lessonUrl !== undefined) {
      this.storageService.get("user_id")
      .then(userId => {
        this.addLessonService.postNewLesson({
          userId: userId,
          name: this.lessonName,
          url: this.lessonUrl
        }).then(res => {
          const newLessonId = res.id;
          for (const sentence of this.sentences) {
            this.addSentenceService.postNewSentence({
              lessonId: newLessonId,
              words: sentence.words,
              text: sentence.text
            });
          }
        });
      }).then(() => {
        this.lessonName = "";
        this.lessonUrl = "";
        this.sentenceText = "";
        this.sentenceHiddenWords = "";
      }).then(async () => {
        const toast = await this.toastController.create({
          message: 'New lesson was added',
          position: 'bottom',
          duration: 700,
          animated: true
        });
        toast.present();
      });
    }
  }
}
