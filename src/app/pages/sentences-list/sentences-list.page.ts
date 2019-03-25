import { Component, OnInit, ViewChildren, AfterViewInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { SentencesByLessonService } from '../../services/http/sentences-by-lesson/sentences-by-lesson.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';
import { Sentence } from 'src/app/models/sentence';
import { LessonsService } from 'src/app/services/lessons/lessons.service';
import { Chart } from 'chart.js';

@Component({
	selector: 'page-sentences-list',
	templateUrl: 'sentences-list.page.html',
	styleUrls: ['sentences-list.page.scss'],
})

export class SentencesListPage implements OnInit, AfterViewInit {

	displayedSentences: Sentence[];
	lessonId: number;
	@ViewChildren('chartsid') pieCanvases: any;
	pieCharts: Array<Chart> = [];

	constructor(private api: SentencesByLessonService,
		private loadingController: LoadingController,
		private utils: UtilsService,
		private route: ActivatedRoute,
		private router: Router,
		public lessonData: LessonsService) { }

	ngOnInit() {
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonID'));
		this.getData();
	}

	ionViewDidEnter() {
		this.updateCharts();
	}

	ngAfterViewInit() {
		this.pieCanvases.changes.subscribe(_ => {
			this.syncCharts();
		});
	}

	private syncCharts() {
		this.pieCharts = [];
		for (let i = 0; i < this.pieCanvases._results.length; i++) {
			this.pieCharts.push(new Chart(this.pieCanvases._results[i].nativeElement, this.utils.getNewChartObject()));
		}
		this.updateCharts();
	}

	private updateCharts() {
		if (this.displayedSentences === undefined ||
			this.displayedSentences.length === 0 ||
			this.pieCharts.length !== this.displayedSentences.length) {
			return;
		}
		let i = 0;
		for (const sentence of this.displayedSentences) {
			const stats = sentence.statistics;
			if (stats.correctAnswers + stats.wrongAnswers + stats.hintUsages + stats.giveUps !== 0) {
				const chartData = this.pieCharts[i].data.datasets[0];
				chartData.data[0] = stats.correctAnswers;
				chartData.data[1] = stats.wrongAnswers;
				chartData.data[2] = stats.hintUsages + sentence.hiddenWord.length * stats.giveUps;
				chartData.backgroundColor[0] = '#0F0';
				chartData.backgroundColor[1] = '#F00';
				chartData.backgroundColor[2] = '#FF0';
				this.pieCharts[i].update();
			}

			++i;
		}
	}

	openSentence(sentenceNumber) {
		this.router.navigate(['sentence-guess'],
			{ queryParams: { current: sentenceNumber, lesson: this.lessonId } });
	}

	doRefresh(event) {
		this.getData().then(_ => { event.target.complete(); });
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	private async getData() {
		const loading = await this.loadingController.create({ message: 'Loading' });
		await loading.present();
		this.displayedSentences = await this.lessonData.getLessonByID(this.lessonId).sentences;
		loading.dismiss();
	}

	allClick() {
		this.displayedSentences = this.lessonData.getLessonByID(this.lessonId).sentences;
	}

	redClick() {
		this.displayedSentences = this.lessonData.getLessonByID(this.lessonId).sentences.filter(sentence =>
			sentence.statistics.wrongAnswers > 0
		);
	}

	redAndYellowClick() {
		this.displayedSentences = this.lessonData.getLessonByID(this.lessonId)
			.sentences.filter(this.utils.redAndYellowFilterSentence);
	}
}
