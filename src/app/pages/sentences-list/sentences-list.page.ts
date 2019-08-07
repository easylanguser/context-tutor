import { Component, OnInit, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';
import { Sentence } from 'src/app/models/sentence';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import { NavController, ToastController } from '@ionic/angular';
import * as anime from 'animejs';
import * as _ from 'lodash';
import { Globals } from 'src/app/services/globals/globals';
import { GestureHandlerService } from 'src/app/services/gestures/gesture-handler.service';

@Component({
	selector: 'page-sentences-list',
	templateUrl: 'sentences-list.page.html',
	styleUrls: ['sentences-list.page.scss'],
})
export class SentencesListPage implements OnInit {

	displayedSentences: Sentence[] = [];
	lessonId: number;
	parentId: number = null;
	lessonTitle: string;
	@ViewChildren('statsSentencesCanvases') pieCanvases: any;
	pieCharts: Array<Chart> = [];
	filter: string = 'all';
	toast: HTMLIonToastElement = null;
	addButtonIsAnimating: boolean = false;
	contentIsScrolled: boolean = false;
	firstEnter: boolean = true;

	constructor(
		private toastController: ToastController,
		private utils: UtilsService,
		private route: ActivatedRoute,
		private navController: NavController,
		private lessonsDataService: LessonsDataService,
		public gestureHandler: GestureHandlerService,
		public globals: Globals) { }

	async ngOnInit() {
		const showLoader = this.route.snapshot.queryParamMap.get('showLoader');
		if (showLoader === 'true') {
			await this.utils.createAndShowLoader('Loading...<br>Please, wait');
		}

		if (!this.lessonsDataService.lessons.length) {
			await this.lessonsDataService.refreshLessons();
		}
		await this.initData(showLoader);
		
		this.addFabHandler();
		
		setTimeout(() => {
			this.syncCharts();
			this.pieCanvases.changes.subscribe(() => {
				this.syncCharts();
			});	
		});
	}

	private addFabHandler() {
		const content = <HTMLIonContentElement>document.getElementById('sentences-list-scroll');
		content.scrollEvents = true;

		content.addEventListener('ionScroll', _.throttle((ev: CustomEvent) => {
			if (ev.detail.velocityY > 0.1) {
				this.contentIsScrolled = true;
			} else if (ev.detail.velocityY < -0.1) {
				this.contentIsScrolled = false;
			}
		}, 250));
	}

	async initData(showLoader) {
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));
		this.parentId = Number(this.route.snapshot.queryParamMap.get('parentId'));

		await this.getData();
		if (showLoader === 'true') {
			await this.utils.dismissLoader();
		}
	}

	private async getData() {
		const lesson = this.lessonsDataService.getLessonById(this.lessonId);
		this.lessonTitle = lesson.name.toString();
		if (this.globals.getIsDemo()) {
			this.displayedSentences = await lesson.sentences.sort(this.lessonsDataService.sortSentencesByAddingTime);
		} else {			
			this.displayedSentences = await this.lessonsDataService.getSentencesByLessonId(this.lessonId, this.parentId);
		}
	}

	goBack() {
		this.navController.navigateBack(['lessons-list']);
	}

	ionViewDidEnter() {
		if (this.globals.updateIsRequired[0]) {
			this.lessonsDataService.getSentencesByLessonId(this.lessonId, this.parentId).then(() => {
				this.getData();
				this.globals.updateIsRequired[0] = false;
			});
		}
		this.updateCharts();
	}

	async ionViewWillLeave() {
		if (this.toast) {
			await this.toast.dismiss();
			this.toast = null;
		}
	}

	ionItemTouchDown(sentence: Sentence) {
		this.gestureHandler.ionItemTouchDown(sentence, this.parentId);
	}

	ionItemTouchUp(evt, sentence: Sentence) {
		if (this.gestureHandler.ionItemTouchUp(evt)) {
			this.openSentence(sentence.id);
		}
	}

	ionContentTouchStart = (evt) => this.gestureHandler.ionContentTouchStart(evt);

	ionContentTouchEnd(evt) {
		const filterRes = this.gestureHandler.ionContentTouchEnd(evt);
		if (filterRes === true) {
			this.changeFilter(true);
		} else if (filterRes === false) {
			this.changeFilter(false);
		}
	}

	changeFilter(isLeftSwipe: boolean) {
		if (this.filter === 'all') {
			this.filter = isLeftSwipe ? 'not-correct' : 'almost-correct';
		} else if (this.filter === 'almost-correct') {
			this.filter = isLeftSwipe ? 'all' : 'not-correct';
		} else {
			this.filter = isLeftSwipe ? 'almost-correct' : 'all';
		}
	}

	async filterClick() {
		if (this.firstEnter) {
			this.firstEnter = false;
			return;
		}
		await this.utils.createAndShowLoader('Loading');

		if (this.filter === 'all') {
			await this.getData();
		} else {
			const allSentences = await this.lessonsDataService.getSentencesByLessonId(this.lessonId, this.parentId);
			if (this.filter === 'not-correct') {
				this.displayedSentences = allSentences.filter(sentence => {
					const stat = this.lessonsDataService.getStatisticsOfSentence(sentence);
					return stat && stat.wrongAnswers > 0;
				});
			} else {
				this.displayedSentences = allSentences.filter(sentence => {
					const stat = this.lessonsDataService.getStatisticsOfSentence(sentence);
					if (!stat) {
						return false;
					}
					return this.utils.redAndYellowFilterSentence(stat);
				});
			}
		}
		await this.utils.dismissLoader();
	}

	private syncCharts() {
		this.pieCharts = [];
		for (const canvas of this.pieCanvases._results) {
			this.pieCharts.push(new Chart(canvas.nativeElement, this.utils.getNewChartObject()));
		}
		this.updateCharts();
	}

	private updateCharts() {
		if (!this.displayedSentences || !this.displayedSentences.length) {
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

				chart.backgroundColor[0] = this.globals.chartsColors[0];
				chart.backgroundColor[1] = this.globals.chartsColors[1];
				chart.backgroundColor[2] = this.globals.chartsColors[2];

				this.pieCharts[i].options.cutoutPercentage = 60;
				this.pieCharts[i].update();
			}

			++i;
		}
	}

	async addSentenceToLesson() {
		if (this.toast) {
			anime({
				targets: ['#edit-sentence-icon'],
				rotate: 0,
				duration: 0
			});
		}
		this.navController.navigateForward(['sentence-adding'], {
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
			this.navController.navigateForward(['sentence-guess'], {
				queryParams: {
					current: sentenceId,
					lessonId: this.lessonId,
					parentId: this.parentId
				}
			});
		} else {
			this.navController.navigateForward(['sentence-adding'], {
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
}
