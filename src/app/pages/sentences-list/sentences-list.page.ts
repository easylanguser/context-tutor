import { Component, OnInit, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';
import { Sentence } from 'src/app/models/sentence';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import { NavController, ToastController } from '@ionic/angular';
import { Globals } from 'src/app/services/globals/globals';
import { GestureHandlerService } from 'src/app/services/gestures/gesture-handler.service';
import anime from 'animejs/lib/anime.es';
import * as _ from 'lodash';
import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';

@Component({
	selector: 'page-sentences-list',
	templateUrl: 'sentences-list.page.html',
	styleUrls: ['sentences-list.page.scss'],
	animations: [
		trigger('sentencesAnimation', [
			transition('* => *', [
				query(':enter', style({ opacity: 0, height: 0 }), { optional: true }),
				query(':enter', stagger('100ms', [
					animate('300ms ease-in', keyframes([
						style({ opacity: 0, offset: 0 }),
						style({ opacity: .5, transform: 'scale(1.1)', offset: 0.4 }),
						style({ opacity: 1, height: '15vh', transform: 'scale(1)', offset: 1 })
					]))]), { optional: true }),
				query(':leave', stagger('100ms', [
					animate('500ms ease-out', style({ height: 0 }))
				]), { optional: true })
			])
		])
	]
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
		await this.utils.createAndShowLoader('Loading...');
		if (!this.lessonsDataService.lessons.length) {
			await this.lessonsDataService.refreshLessons();
		}
		await this.initData();

		this.addFabHandler();
		this.firstEnter = false;
		this.pieCanvases.changes.subscribe(() => this.syncCharts());
		
		this.utils.dismissLoader();
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
		}, 250), { passive: true });
	}

	async initData() {
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));
		this.parentId = Number(this.route.snapshot.queryParamMap.get('parentId'));

		await this.getData();
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
		if (this.globals.updateIsRequired) {
			this.lessonsDataService.getSentencesByLessonId(this.lessonId, this.parentId).then(() => {
				this.getData();
				this.globals.updateIsRequired = false;
			});
		}
		this.updateCharts(1000);
	}

	async ionViewWillLeave() {
		if (this.toast) {
			await this.toast.dismiss();
			this.toast = null;
		}
	}

	ionItemTouchDown(event: any, sentence: Sentence) {
		this.gestureHandler.ionItemTouchDown(event, sentence, this.parentId);
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

	async filterChanged() {
		if (this.firstEnter) {
			this.firstEnter = false;
			return;
		}
		const allSentences: Sentence[] = await this.lessonsDataService.getLessonById(this.lessonId).sentences;
		if (this.filter === 'all') {
			this.displayedSentences = allSentences;
		} else if (this.filter === 'not-correct') {
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

	private syncCharts() {
		this.pieCharts = [];
		for (const canvas of this.pieCanvases._results) {
			this.pieCharts.push(new Chart(canvas.nativeElement, this.utils.getNewChartObject()));
		}
		this.updateCharts(0);
	}

	private updateCharts(animationDuration: number) {
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
				this.pieCharts[i].update(animationDuration);
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

	async doRefresh(event?: any) {
		if (!event) {
			anime({
				targets: [document.querySelector('#desktop-refresher-sentences')],
				rotate: '+=360',
				elasticity: 50,
				easing: 'easeOutElastic',
				duration: 3000
			});
			await this.utils.createAndShowLoader('Loading...');
		}
		await this.getData();
		this.filter = "all";
		if (event) {
			event.target.complete();
			setTimeout(() => {
				event.target.complete();
			}, 5000);
		} else {
			await this.utils.dismissLoader();
		}
	}
}
