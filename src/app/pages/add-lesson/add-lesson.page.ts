import { AddLessonFileService } from './../../services/http/add-lesson-file/add-lesson-file.service';
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

  lessonNameInputIsValidated: boolean = true;
  lessonUrlInputIsValidated: boolean = true;
  sentenceTextTextareaIsValidated: boolean = true;
  sentenceWordsTextareaIsValidated: boolean = true;

  sentences: any[] = [];
  indexesArray: Array<[number, number]> = [];

  constructor(
    private storageService: StorageService,
    private addLessonService: AddLessonService,
    private addSentenceService: AddSentenceService,
    private toastController: ToastController,
    private addLessonFileService: AddLessonFileService) { }

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

  addWordToSentence() {
    const area = <HTMLTextAreaElement>document.getElementById("sentence-text-textarea").lastChild;
    var start = area.selectionStart;
    var finish = area.selectionEnd;
    var sel = area.value.substring(start, finish);

    const selObj = sel.toString();
    for (let i = 0; i < selObj.length; i++) {
      const charAtPos = selObj[i].charCodeAt(0);
      if (!((charAtPos > 64 && charAtPos < 91) || (charAtPos > 96 && charAtPos < 123))) {
        return;
      }
    }
    this.indexesArray.push([start, finish - start]);
  }

  async addNewSentenceToLesson() {
    let validated: boolean = true;

    if (this.sentenceText === undefined || this.sentenceText === "") {
      document.getElementById("sentence-text-textarea").style.borderColor = "#F00";
      validated = false;
    }
    if (this.indexesArray.length === 0) {
      document.getElementById("sentence-words-textarea").style.borderColor = "#F00";
      validated = false;
    }

    if (!validated) return;

    for (let i = 0; i < this.indexesArray.length - 1; i++) {
      for (let j = i + 1; j < this.indexesArray.length; j++) {
        if (!((this.indexesArray[i][0] < this.indexesArray[j][0] &&
          this.indexesArray[i][0] + this.indexesArray[i][1] < this.indexesArray[j][0] + this.indexesArray[j][1]) ||
          (this.indexesArray[i][0] > this.indexesArray[j][0] &&
            this.indexesArray[i][0] + this.indexesArray[i][1] > this.indexesArray[j][0] + this.indexesArray[j][1]))) {
          return;
        }
      }
    }

    this.indexesArray.sort((el1, el2) => el1[0] - el2[0]);

    this.sentences.push({
      words: this.indexesArray,
      text: this.sentenceText
    });

    this.indexesArray = [];
    this.sentenceText = "";

    const toast = await this.toastController.create({
      message: 'There are ' + this.sentences.length + ' sentences in current lesson',
      position: 'bottom',
      duration: 900,
      animated: true
    });
    toast.present();

  }

  saveFile() {
    this.storageService.get('user_id')
      .then(userId => {
        this.addLessonFileService.postNewLessonFile(
          (<HTMLInputElement>document.getElementById('file-input')).files, userId);
      });
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