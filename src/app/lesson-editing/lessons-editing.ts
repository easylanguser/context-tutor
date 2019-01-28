import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LessonByNameService } from '../services/lesson-by-name/lesson-by-name.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UtilsService } from '../services/utils/utils.service';
import { Storage } from '@ionic/storage';

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
		private router: Router,
		private storage: Storage) { }

	ngOnInit() {
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonID'));
		this.lessonTitle = this.route.snapshot.queryParamMap.get('lessonTitle');
		this.getData(this.lessonId);
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

		this.storage.get(this.lessonId + 'length').then((length) => {
			if (length !== null) {
				for (var i = 0; i < length; i++) {
					this.storage.get(this.lessonId + 's' + i + 'source')
						.then((val) => { this.sentences.push(val) })
					this.storage.get(this.lessonId + 's' + i + 'idxs')
						.then((val) => { this.indexes.push(val) })
					this.storage.get(this.lessonId + 's' + i + 'textunderscored')
						.then((val) => { this.sentencesWithUnderscores.push(val) })
				}
				loading.dismiss();
			} else {
				this.api.getData(lessonId)
					.subscribe(res => {
						let lesson = (res[0]);
						for (var i = 0; i < lesson.length; i++) {
							this.sentences.push(lesson[i].text);
							this.indexes.push(lesson[i].hiddenWord);
							this.sentencesWithUnderscores.push(
								this.util.replaceLettersWithUnderscore(this.sentences[i], this.indexes[i]))

							this.storage.set(this.lessonId + 's' + i + 'source', this.sentences[i]);
							this.storage.set(this.lessonId + 's' + i + 'idxs', this.indexes[i]);
							this.storage.set(this.lessonId + 's' + i + 'textunderscored', this.sentencesWithUnderscores[i]);

							const hiddenCharacters: string[] = [];
							for (var j = 0; j < this.indexes[i].length; j++) {
								hiddenCharacters.push(this.sentences[i].charAt(this.indexes[i][j]));
							}
							this.storage.set(this.lessonId + 's' + i + 'hiddenchars', hiddenCharacters);
						}
						this.storage.set(this.lessonId + 'length', lesson.length);
						loading.dismiss();
					}, err => {
						console.log(err);
						loading.dismiss();
					});
			}
		});

	}
}
