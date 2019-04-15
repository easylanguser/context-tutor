import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage-service';
import { AddLessonService } from 'src/app/services/http/add-lesson/add-lesson.service';
import { AddSentenceService } from 'src/app/services/http/add-sentence/add-sentence.service';

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

  sentences: Object[] = [];

  constructor(private storageService: StorageService,
    private addLessonService: AddLessonService,
    private addSentenceService: AddSentenceService) { }

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
        text: this.sentenceText,
        words: indexesArray
      });
    }
  }

  addNewLesson() {
    if (this.lessonName !== undefined && this.lessonUrl !== undefined) {
      this.storageService.get("user_id")
      .then(userId => {
        console.log(this.addLessonService.postNewLesson({
          userId: userId,
          name: this.lessonName,
          url: this.lessonUrl
        }));
      }); /* .then(() => {
        this.addSentenceService.postNewSentence({
          for (const sentence of sentences) {

          }
        });
      }); */
    }
  }
}
