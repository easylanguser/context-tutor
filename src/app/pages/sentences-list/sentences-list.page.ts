import { Component, OnInit, ViewChildren, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';
import { Sentence } from 'src/app/models/sentence';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import { SentenceDeleteService } from 'src/app/services/http/sentence-delete/sentence-delete.service';
import { IonItemSliding, AlertController, NavController, ToastController } from '@ionic/angular';
import * as anime from 'animejs';
import { updateIsRequired } from 'src/app/app.component';

@Component({
	selector: 'page-sentences-list',
	templateUrl: 'sentences-list.page.html',
	styleUrls: ['sentences-list.page.scss'],
})

export class SentencesListPage implements OnInit, AfterViewInit {

	displayedSentences: Sentence[];
	lessonId: number;
	lessonTitle: string;
	@ViewChildren('chartsid') pieCanvases: any;
	pieCharts: Array<Chart> = [];
	offset: number = 0;
	toast: HTMLIonToastElement = null;
	addButtonIsAnimating: boolean = false;

	constructor(
		private toastController: ToastController,
		private alertCtrl: AlertController,
		private utils: UtilsService,
		private route: ActivatedRoute,
		private navCtrl: NavController,
		public lessonsDataService: LessonsDataService,
		private sentenceDeleteService: SentenceDeleteService,
		private cdRef: ChangeDetectorRef) { }

	ngOnInit() {
		if (!this.lessonsDataService.lessons.length) {
			this.lessonsDataService.refreshLessons().then(() => {
				this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonID'));
				this.getData();
			});
		} else {
			this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonID'));
			this.getData();
		}
	}

	goBack() {
		this.navCtrl.navigateBack(['lessons-list']);
	}

	ionViewDidEnter() {
		this.updateCharts();
		if (updateIsRequired[0] || this.displayedSentences.length === 0) {
			this.lessonsDataService.getSentencesByLessonId(this.lessonId).then(() => {
				this.getData();
				updateIsRequired[0] = false;
			});
		}
	}

	ngAfterViewInit() {
		this.pieCanvases.changes.subscribe(() => {
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
			if (this.displayedSentences.length === this.lessonsDataService.getLessonByID(this.lessonId).sentences.length) {
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
						this.lessonsDataService.removeSentence(lessonID, sentenceID)

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
				chartData.backgroundColor[0] = '#AFF265';
				chartData.backgroundColor[1] = '#FF9055';
				chartData.backgroundColor[2] = '#FFE320';
				this.pieCharts[i].options.cutoutPercentage = 67;
				this.pieCharts[i].update();
			}

			++i;
		}
		
		this.cdRef.detectChanges();
	}

	async addSentenceToLesson() {
		if (this.toast) {
			anime({
				targets: ['#edit-sentence-icon'],
				rotate: 0,
				duration: 0
			});
		}
		this.navCtrl.navigateForward(['sentence-adding'], {
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
			anime({
				targets: ['#edit-sentence-icon'],
				rotate: 180,
				easing: 'easeInOutBack',
				duration: 500
			});

			this.toast = await this.toastController.create({
				message: 'Select sentence to edit, or click button again to dismiss',
				mode: 'ios',
				cssClass: 'toast-black',
				position: 'top'
			});

			this.toast.present().then(() => this.addButtonIsAnimating = false);
		} else {
			anime({
				targets: ['#edit-sentence-icon'],
				rotate: 0,
				easing: 'easeInOutBack',
				duration: 500
			});

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
			this.navCtrl.navigateForward(['sentence-adding'], {
				queryParams: {
					toEdit: sentenceId,
					lessonId: this.lessonId
				}
			});
			anime({
				targets: ['#edit-sentence-icon'],
				rotate: 0,
				duration: 0
			});
		}
	}

	doRefresh(event) {
		this.getData().then(_ => {
			event.target.complete();
			(<HTMLIonSegmentElement>document.getElementById('sentences-filter-segment')).value = "all";
		});
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	private async getData() {
		const currentLesson = this.lessonsDataService.getLessonByID(this.lessonId);
		this.lessonTitle = currentLesson.name.toString();
		this.displayedSentences = currentLesson.sentences;
	}

	allClick() {
		this.getData();
	}

	redClick() {
		this.displayedSentences = this.lessonsDataService
			.getRangeOfLessonSentences(this.lessonId, 0, this.offset + 20)
			.filter(sentence => sentence.statistics.wrongAnswers > 0);
	}

	redAndYellowClick() {
		this.displayedSentences = this.lessonsDataService
			.getRangeOfLessonSentences(this.lessonId, 0, this.offset + 20)
			.filter(this.utils.redAndYellowFilterSentence);
	}
}
