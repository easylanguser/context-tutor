import { Component, OnInit, ViewChildren, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';
import { Sentence } from 'src/app/models/sentence';
import { LessonsService } from 'src/app/services/lessons/lessons.service';
import { Chart } from 'chart.js';
import { SentenceDeleteService } from 'src/app/services/http/sentence-delete/sentence-delete.service';
import { IonItemSliding, AlertController } from '@ionic/angular';

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
	offset: number = 0;

	constructor(
		private alertCtrl: AlertController,
		private utils: UtilsService,
		private route: ActivatedRoute,
		private router: Router,
		public lessonData: LessonsService,
		private sentenceDeleteService: SentenceDeleteService) { }

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

	loadData(event) {
		this.offset += 20;
		setTimeout(() => {
			this.getData().then(() => event.target.complete());
			if (this.displayedSentences.length === this.lessonData.getLessonByID(this.lessonId).sentences.length) {
				event.target.disabled = true;
			}
		}, 200);
	}

	async deleteItem(slidingItem: IonItemSliding, sentenceID: number) {
		const alert = await this.alertCtrl.create({
			message: 'Are you sure you want to delete this sentence?',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					handler: () => {
						slidingItem.close();
					}
				},
				{
					text: 'Delete',
					handler: () => {
						slidingItem.close();

						this.sentenceDeleteService.delete(sentenceID);

						let i = 0;
						for (i; i < this.displayedSentences.length; i++) {
							if (this.displayedSentences[i].id === sentenceID) {
								break;
							}
						}

						if (i !== this.displayedSentences.length) {
							this.displayedSentences.splice(i, 1);
							this.pieCharts[i].destroy();
							this.pieCharts.splice(i, 1);
						}
					}
				}
			]
		});
		await alert.present();
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
				chartData.backgroundColor[0] = '#a6ed92';
				chartData.backgroundColor[1] = '#ff9663';
				chartData.backgroundColor[2] = '#ffe353';
				this.pieCharts[i].options.cutoutPercentage = 67;
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
		this.displayedSentences = await this.getSentencesRange();
	}

	allClick() {
		this.getData();
	}

	redClick() {
		this.getData().then(() => {
			this.displayedSentences.filter(sentence => sentence.statistics.wrongAnswers > 0);
		})		
	}

	redAndYellowClick() {
		this.getData().then(() => {
			this.displayedSentences.filter(this.utils.redAndYellowFilterSentence);
		})
	}

	getSentencesRange(): Sentence[] {
		return this.lessonData.getRangeOfLessonSentences(this.lessonId, 0, this.offset + 20);
	}
}
