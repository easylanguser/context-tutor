import { Component, OnInit, ViewChildren, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilsService, chartsColors } from '../../services/utils/utils.service';
import { Sentence } from 'src/app/models/sentence';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import { SentenceDeleteService } from 'src/app/services/http/sentence-delete/sentence-delete.service';
import { IonItemSliding, AlertController, NavController, ToastController, LoadingController } from '@ionic/angular';
import * as anime from 'animejs';
import * as _ from 'lodash';
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
	toast: HTMLIonToastElement = null;
	addButtonIsAnimating: boolean = false;
	loader: HTMLIonLoadingElement;

	constructor(
		private toastController: ToastController,
		private alertCtrl: AlertController,
		private utils: UtilsService,
		private route: ActivatedRoute,
		private navCtrl: NavController,
		public lessonsDataService: LessonsDataService,
		private sentenceDeleteService: SentenceDeleteService,
		private loadingController: LoadingController,
		private cdRef: ChangeDetectorRef) { }

	async ngOnInit() {
		const showLoader = this.route.snapshot.queryParamMap.get('showLoader');
		if (showLoader === 'true') {
			this.loader = await this.loadingController.create({
				message: 'Loading...<br>Please, wait',
				backdropDismiss: true
			});
			await this.loader.present();
		}

		if (!this.lessonsDataService.lessons.length) {
			await this.lessonsDataService.refreshLessons();
		}
		this.initData(showLoader);

		this.addFabHandler();
	}

	private addFabHandler() {
		const content = <HTMLIonContentElement>document.getElementById('sentences-list-scroll');
		content.scrollEvents = true;

		const fabEdit = document.getElementById('edit-sentence-fab');
		const fabAdd = document.getElementById('add-sentence-fab');

		content.addEventListener('ionScroll', _.throttle((ev: CustomEvent) => {
			if (ev.detail.velocityY > 0.1) {
				fabAdd.classList.add('hidden-btn');
				fabEdit.classList.add('hidden-btn');
			} else if (ev.detail.velocityY < -0.1) {
				fabAdd.classList.remove('hidden-btn');
				fabEdit.classList.remove('hidden-btn');
			}
		}, 300));
	}

	async initData(showLoader) {
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonID'));
		await this.getData();
		if (showLoader === 'true') {
			this.loader.dismiss();
		}
	}

	goBack() {
		this.navCtrl.navigateBack(['lessons-list']);
	}

	async ionViewDidEnter() {
		if (updateIsRequired[0] || (this.displayedSentences && this.displayedSentences.length === 0)) {
			await this.lessonsDataService.getSentencesByLessonId(this.lessonId);
			this.getData();
			updateIsRequired[0] = false;
		}
		this.updateCharts();
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
		if (this.displayedSentences === undefined || this.displayedSentences.length === 0) {
			return;
		}
		let i = 0;
		for (const sentence of this.displayedSentences) {
			const stats = this.lessonsDataService.getStatisticsOfSentence(sentence);
			if (stats && stats.correctAnswers + stats.wrongAnswers + stats.hintUsages + stats.giveUps !== 0) {
				const chart = this.pieCharts[i].data.datasets[0];
				chart.data[0] = stats.correctAnswers;
				chart.data[1] = stats.wrongAnswers;
				chart.data[2] = stats.hintUsages + sentence.words.length * stats.giveUps;

				chart.backgroundColor[0] = chartsColors[0];
				chart.backgroundColor[1] = chartsColors[1];
				chart.backgroundColor[2] = chartsColors[2];

				this.pieCharts[i].options.cutoutPercentage = 60;
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

			await this.toast.present();
			this.addButtonIsAnimating = false;
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
		this.lessonTitle = this.lessonsDataService.getLessonByID(this.lessonId).name.toString();
		this.displayedSentences = await this.lessonsDataService.getSentencesByLessonId(this.lessonId);
	}

	async filterClick(type: number) {
		this.loader = await this.loadingController.create({
			message: 'Loading',
			backdropDismiss: true
		});
		await this.loader.present();
		if (type === 1) {
			this.getData();
		} else {
			const allSentences = await this.lessonsDataService.getSentencesByLessonId(this.lessonId);
			if (type === 2) {
				this.displayedSentences = allSentences.filter(sentence =>
					this.lessonsDataService.getStatisticsOfSentence(sentence).wrongAnswers > 0
				);
			} else {
				this.displayedSentences = allSentences.filter(sentence =>
					this.utils.redAndYellowFilterSentence(this.lessonsDataService.getStatisticsOfSentence(sentence))
				);
			}
		}
		await this.loader.dismiss();
	}
}
