import {Component} from '@angular/core';
import {LoadingController} from '@ionic/angular';
import {LessonByNameService} from '../lesson-by-name.service';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';
import {UtilsService} from '../utils.service';

@Component({
    selector: 'page-lessons-editing',
    templateUrl: 'lessons-editing.html',
    styleUrls: ['lessons-editing.scss'],
})

export class LessonsEditingPage {

    private indexes: Array<number[]> = [];
    private sentences: Array<string> = [];
    private sentencesWithUnderscores: Array<string> = [];
    private lessonName: string;

    constructor(private api: LessonByNameService,
                private loadingController: LoadingController,
                private util: UtilsService,
                private route: ActivatedRoute,
                private router: Router) {
    }

    ngOnInit() {
        const lessonId = this.route.snapshot.paramMap.get('id');
        this.getData(lessonId);
    }

    // Open sentence to guess by clicking on it in the list
    openSentence(lessonNumber) {
        console.log(2)
        this.router.navigate(['sentence-guess'],
            {queryParams: {first: lessonNumber, lesson: this.lessonName}});
    }

    // Get sentences by certain lesson
    private async getData(lessonName) {
        const loading = await this.loadingController.create({
            message: 'Loading'
        });
        await loading.present();
        this.api.getData(lessonName)
            .subscribe(res => {
                console.log(res);
                let lesson = res[0];
                for (let i = 0; i < lesson.length; i++) {
                    this.sentences.push(lesson[i].text);
                    this.indexes.push(lesson[i].hiddenWord);
                    this.sentencesWithUnderscores.push(
                        this.util.replaceLettersWithUnderscore(this.sentences[i], this.indexes[i]))
                }
                loading.dismiss();
            }, err => {
                console.log(err);
                loading.dismiss();
            });
    }
}
