import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage-service';
import { AddLessonService } from 'src/app/services/http/add-lesson/add-lesson.service';
import { AddSentenceService } from 'src/app/services/http/add-sentence/add-sentence.service';
import { ToastController } from '@ionic/angular';
import { color } from 'd3';

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

  lessonNameInputIsValidated: boolean = true;
  lessonUrlInputIsValidated: boolean = true;
  sentenceTextTextareaIsValidated: boolean = true;
  sentenceWordsTextareaIsValidated: boolean = true;

  sentences: any[] = [];

  constructor(
    private storageService: StorageService,
    private addLessonService: AddLessonService,
    private addSentenceService: AddSentenceService,
    private toastController: ToastController) { }

  ngOnInit() { }

  onKeyLessonName(event: any) {
    this.lessonNameInputIsValidated = event.target.value === "" ? false : true;
  }

  onKeyLessonUrl(event: any) {
    this.lessonUrlInputIsValidated = event.target.value === "" ? false : true;
  }

  onKeySentenceText(event: any) {
    this.sentenceTextTextareaIsValidated = event.target.value === "" ? false : true;
  }

  onKeySentenceWords(event: any) {
    this.sentenceWordsTextareaIsValidated = event.target.value === "" ? false : true;
  }

  async addNewSentenceToLesson() {
    let validated: boolean = true;

    if (this.sentenceText === undefined || this.sentenceText === "") {
      document.getElementById("sentence-text-textarea").style.borderColor = "#F00";
      validated = false;
    }
    if (this.sentenceHiddenWords === undefined || this.sentenceHiddenWords === "") {
      document.getElementById("sentence-words-textarea").style.borderColor = "#F00";
      validated = false;
    }

    if (!validated) return;

    this.sentenceHiddenWords = this.sentenceHiddenWords.replace(/\s/g, '');
    const words = this.sentenceHiddenWords.split('|');
    const indexesArray: Array<[number, number]> = [];

    for (const item of words) {
      const indexes = item.split('-');
      indexesArray.push([Number(indexes[0]), Number(indexes[1])]);
    }

    for (let i = 0; i < indexesArray.length - 1; i++) {
      for (let j = i + 1; j < indexesArray.length; j++) {
        if (!((indexesArray[i][0] < indexesArray[j][0] &&
          indexesArray[i][0] + indexesArray[i][1] < indexesArray[j][0] + indexesArray[j][1]) ||
          (indexesArray[i][0] > indexesArray[j][0] &&
            indexesArray[i][0] + indexesArray[i][1] > indexesArray[j][0] + indexesArray[j][1]))) {
          return;
        }
      }
    }

    this.sentences.push({
      words: indexesArray,
      text: this.sentenceText
    });

    this.sentenceText = "";
    this.sentenceHiddenWords = "";

    const toast = await this.toastController.create({
      message: 'There are ' + this.sentences.length + ' sentences in current lesson',
      position: 'bottom',
      duration: 900,
      animated: true
    });
    toast.present();

  }

  addNewLesson() {
    let validated: boolean = true;

    if (this.lessonName === undefined || this.lessonName === "") {
      document.getElementById("lesson-name-input").style.borderColor = "#F00";
      validated = false;
    }
    if (this.lessonUrl === undefined || this.lessonUrl === "") {
      document.getElementById("lesson-url-input").style.borderColor = "#F00";
      validated = false;
    }

    if (!validated) return;

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
          this.lessonName = "";
          this.lessonUrl = "";
          this.sentenceText = "";
          this.sentenceHiddenWords = "";
          this.sentences = [];
        });
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
