import { Component, OnInit, ViewChildren, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';
import { Sentence } from 'src/app/models/sentence';
import { LessonsService } from 'src/app/services/lessons/lessons.service';
import { Chart } from 'chart.js';
import { SentenceDeleteService } from 'src/app/services/http/sentence-delete/sentence-delete.service';
import { IonItemSliding, AlertController, NavController, ToastController } from '@ionic/angular';
import * as anime from 'animejs';

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
	statisticsIsNotEmpty: boolean = true;
	toast: HTMLIonToastElement = null;
	addButtonIsAnimating: boolean = false;

	constructor(
		private toastController: ToastController,
		private alertCtrl: AlertController,
		private utils: UtilsService,
		private route: ActivatedRoute,
		private navCtrl: NavController,
		public lessonData: LessonsService,
		private sentenceDeleteService: SentenceDeleteService,
		private cdRef: ChangeDetectorRef) { }

	ngOnInit() {
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonID'));
		this.getData();
	}

	goBack() {
		this.navCtrl.pop();
	}

	ionViewDidEnter() {
		this.updateCharts();
	}

	ngAfterViewInit() {
		this.pieCanvases.changes.subscribe(_ => {
			this.syncCharts();
		});
	}

	ionViewWillLeave() {
		if (this.toast) {
			this.toast.dismiss().then(() => this.toast = null);
		}
	}

	private syncCharts() {
		this.pieCharts = [];
		for (const i in this.pieCanvases._results) {
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
				document.getElementById("sentences-list").style.paddingBottom = "15vh";
			}
		}, 200);
	}

	async deleteItem(slidingItem: IonItemSliding, lessonID: number, sentenceID: number) {
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
						this.lessonData.removeSentence(lessonID, sentenceID)

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
		let statisticsIsNotEmpty: boolean = false;
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
				statisticsIsNotEmpty = true;
			}

			++i;
		}
		this.statisticsIsNotEmpty = statisticsIsNotEmpty;
		this.cdRef.detectChanges();
	}

	async addSentenceToLesson() {
		this.navCtrl.navigateForward(['sentence-adding-page'], {
			queryParams: {
				lessonId: this.lessonId
			}
		});
	}

	async editSentence() {
		if (this.addButtonIsAnimating)
			return;
		this.addButtonIsAnimating = true;

		if (!this.toast) {
			await anime({
				targets: ['#edit-sentence-icon'],
				rotate: 180,
				easing: 'easeInOutBack',
				duration: 500
			}).finished;

			this.toast = await this.toastController.create({
				message: 'Select sentence to edit, or click button again to dismiss',
				mode: 'ios',
				cssClass: 'toast-black',
				position: 'top'
			});

			this.toast.present().then(() => this.addButtonIsAnimating = false);
		} else {
			await anime({
				targets: ['#edit-sentence-icon'],
				rotate: 0,
				easing: 'easeInOutBack',
				duration: 500
			}).finished;

			this.toast.dismiss().then(() => {
				this.toast = null;
				this.addButtonIsAnimating = false;
			});
		}
	}

	openSentence(sentenceId: number) {
		if (!this.toast) {
			this.navCtrl.navigateForward(['sentence-guess'], {
				queryParams: {
					current: sentenceId,
					lesson: this.lessonId
				}
			});
		} else {
			this.navCtrl.navigateForward(['sentence-adding-page'], {
				queryParams: {
					toEdit: sentenceId,
					lessonId: this.lessonId
				}
			});
		}
	}

	doRefresh(event) {
		this.getData().then(_ => { event.target.complete(); });
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	private async getData() {
		this.displayedSentences = await this.lessonData
			.getRangeOfLessonSentences(this.lessonId, 0, this.offset + 20);
	}

	allClick() {
		this.getData();
	}

	redClick() {
		this.displayedSentences = this.lessonData
			.getRangeOfLessonSentences(this.lessonId, 0, this.offset + 20)
			.filter(sentence => sentence.statistics.wrongAnswers > 0);
	}

	redAndYellowClick() {
		this.displayedSentences = this.lessonData
			.getRangeOfLessonSentences(this.lessonId, 0, this.offset + 20)
			.filter(this.utils.redAndYellowFilterSentence);
	}
}
