import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LessonByNameService } from '../../services/lesson-by-name/lesson-by-name.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';

@Component({
	selector: 'page-lessons-editing',
	templateUrl: 'lessons-editing.html',
	styleUrls: ['lessons-editing.scss'],
})

export class LessonsEditingPage {

	private indexes: Array<number[]> = [];
	private sentences: Array<string> = [];
	private sentencesWithUnderscores: Array<string> = [];
	private lessonId: number;
	private lessonTitle: string;

	constructor(private api: LessonByNameService,
		private loadingController: LoadingController,
		private util: UtilsService,
		private route: ActivatedRoute,
		private router: Router) { }

	ngOnInit() {
		this.getData(this.route.snapshot.queryParamMap.get('lessonID'));
		this.lessonTitle = this.route.snapshot.queryParamMap.get('lessonTitle');
	}

	// Open sentence to guess by clicking on it in the list
	openSentence(sentenceNumber) {
		this.router.navigate(['sentence-guess'],
			{ queryParams: { current: sentenceNumber, lesson: this.lessonId } });
	}

	// Get sentences by certain lesson
	private async getData(lessonId) {
		const loading = await this.loadingController.create({ message: 'Loading' });
		await loading.present();

		this.lessonId = lessonId;
		this.sentences = [];
		this.indexes = [];
		this.sentencesWithUnderscores = [];

		this.api.getData(lessonId)
			.subscribe(res => {
				let lesson = (res[0]);
				
				for (var i = 0; i < lesson.length; i++) {
					this.sentences.push(lesson[i].text);
					this.indexes.push(lesson[i].hiddenWord);
					this.sentencesWithUnderscores.push(
						this.util.replaceLettersWithUnderscore(this.sentences[i], this.indexes[i]))

					const hiddenCharacters: string[] = [];
					for (var j = 0; j < this.indexes[i].length; j++) {
						hiddenCharacters.push(this.sentences[i].charAt(this.indexes[i][j]));
					}
				}
				loading.dismiss();
			}, err => {
				console.log(err);
				loading.dismiss();
			});
	}
}
