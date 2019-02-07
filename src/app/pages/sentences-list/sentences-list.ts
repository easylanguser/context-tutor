import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LessonByNameService } from '../../services/lesson-by-name/lesson-by-name.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';
import { Sentence } from 'src/app/models/sentence';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Statistics } from 'src/app/models/statistics';

@Component({
	selector: 'page-sentences-list',
	templateUrl: 'sentences-list.html',
	styleUrls: ['sentences-list.scss'],
})

export class SentencesListPage {

	private lessonId: number;

	constructor(private api: LessonByNameService,
		private loadingController: LoadingController,
		private util: UtilsService,
		private route: ActivatedRoute,
		private router: Router,
		private lessonData: LessonsDataService) { }

	ngOnInit() {
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonID'));
		this.getData(this.lessonId);
	}

	// Open sentence to guess by clicking on it in the list
	openSentence(sentenceNumber) {
		this.router.navigate(['sentence-guess'],
			{ queryParams: { current: sentenceNumber, lesson: this.lessonId } });
	}

	doRefresh(event) {
		this.getData(this.lessonId).then(_ => { event.target.complete() });
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	// Get sentences by certain lesson
	private async getData(lessonId) {
		const loading = await this.loadingController.create({ message: 'Loading' });
		await loading.present();
		this.api.getData(lessonId)
			.subscribe(res => {
				let lsn = res[0];
				for (let i = 0; i < lsn.length; i++) {
					const sentence = new Sentence(
						lsn[i].id,
						lsn[i].words,
						lsn[i].text,
						this.util.hideChars(lsn[i].text, lsn[i].words),
						[],
						0,
						false,
						new Statistics(0, 0, 0, 0, 0, 0, 0));
					if (!this.lessonData.getLessonByID(lessonId).sentences.some(sntn => sntn.id === sentence.id)) {
						this.lessonData.getLessonByID(lessonId).addSentence(sentence);
					}
				}
				loading.dismiss();
			}, err => {
				console.log(err);
				loading.dismiss();
			});
	}
}
