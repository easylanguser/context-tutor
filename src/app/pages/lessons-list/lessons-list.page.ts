import { Component, OnInit, ViewChildren } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Lesson } from 'src/app/models/lesson';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Globals } from 'src/app/services/globals/globals';
import { GestureHandlerService } from 'src/app/services/gestures/gesture-handler.service';
import { Chart } from 'chart.js';
import * as _ from 'lodash';
import anime from 'animejs/lib/anime.es';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
	selector: 'page-lessons-list',
	templateUrl: 'lessons-list.page.html',
	styleUrls: ['lessons-list.page.scss'],
	animations: [
		trigger(
			'enterAnimation', [
				transition(':enter', [
					style({ height: 0 }),
					animate('.7s cubic-bezier(.8, -.6, .2, 1.5)', style({ height: '13.6vh' }))
				]),
				transition(':leave', [
					animate('.5s ease-in-out', style({ transform: 'scale(0)', height: 0 }))
				])
			]
		)
	]
})
export class LessonsListPage implements OnInit {

	displayedLessons: Lesson[] = [];
	@ViewChildren('statsLessonsCanvases') pieCanvases: any;
	pieCharts: Array<Chart> = [];
	filter: string = 'all';
	contentIsScrolled: boolean = false;
	firstEnter: boolean = true;

	constructor(
		private navController: NavController,
		private lessonsDataService: LessonsDataService,
		private utils: UtilsService,
		public gestureHandler: GestureHandlerService,
		public globals: Globals) { }

	async ngOnInit() {
		await this.utils.createAndShowLoader('Loading...');
		await this.getData();
		this.addFabsHandler();
		await this.utils.dismissLoader();
		this.syncCharts();
		this.pieCanvases.changes.subscribe(() => {
			this.syncCharts();
		});
		this.firstEnter = false;
	}

	ionItemTouchDown(lesson: Lesson, event: any) {
		this.gestureHandler.ionItemTouchDown(lesson, event);
	}

	ionItemTouchUp(evt, lesson: Lesson) {
		if (this.gestureHandler.ionItemTouchUp(evt)) {
			this.openLesson(lesson);
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
		await this.utils.createAndShowLoader('Loading...');

		const allLessons = this.lessonsDataService.lessons;
		if (this.filter === 'all') {
			this.displayedLessons = allLessons;
		} else if (this.filter === 'almost-correct') {
			this.displayedLessons = allLessons.filter(this.utils.redAndYellowFilterLesson);
		} else {
			this.displayedLessons = allLessons.filter(lesson =>
				lesson.statistics.some(stat => stat.wrongAnswers > 0)
			);
		}

		await this.utils.dismissLoader();
	}

	private addFabsHandler() {
		const content = <HTMLIonContentElement>document.getElementById('list-scroll');
		content.scrollEvents = true;
		content.addEventListener('ionScroll', _.throttle((ev: CustomEvent) => {
			if (!this.globals.getIsDemo()) {
				if (ev.detail.velocityY > 0.1) {
					this.contentIsScrolled = true;
				} else if (ev.detail.velocityY < -0.1) {
					this.contentIsScrolled = false;
				}
			}
		}, 250));
	}

	ionViewDidEnter() {
		if (this.globals.updateIsRequired[0]) {
			this.getData().then(() => {
				this.globals.updateIsRequired[0] = false;
			});
		}
		this.globals.progressedWords = [];
		this.updateCharts(1000);
	}

	addLessonFile() {
		this.navController.navigateForward(['add-lesson']);
	}

	private syncCharts() {
		this.pieCharts = [];
		for (const canvas of this.pieCanvases._results) {
			this.pieCharts.push(new Chart(canvas.nativeElement, this.utils.getNewChartObject()));
		}
		this.updateCharts(0);
	}

	private updateCharts(animationDuration: number) {
		let i = 0;
		for (const lesson of this.displayedLessons) {
			if (lesson.statistics) {
				const chart = this.pieCharts[i].data.datasets[0], chartData = chart.data;
				chartData[0] = 1;
				chartData[1] = 0;
				chartData[2] = 0;
				for (const stats of lesson.statistics) {
					if (stats && (stats.correctAnswers + stats.wrongAnswers +
						stats.hintUsages + stats.giveUps > 0)) {
						chartData[0] += stats.correctAnswers;
						chartData[1] += stats.wrongAnswers;
						chartData[2] += stats.hintUsages + stats.giveUps;
					}
				}

				if (chartData[0] + chartData[1] + chartData[2] > 1) {
					--chartData[0];
					chart.backgroundColor[0] = this.globals.chartsColors[0];
					chart.backgroundColor[1] = this.globals.chartsColors[1];
					chart.backgroundColor[2] = this.globals.chartsColors[2];
					this.pieCharts[i].options.cutoutPercentage = 60;
					this.pieCharts[i].update(animationDuration);
				}
			}
			++i;
		}
	}

	async doRefresh(event?: any) {
		if (!event) {
			anime({
				targets: [
					document.querySelector('#desktop-refresher-lessons')
				],
				rotate: '+=360',
				elasticity: 50,
				easing: 'easeOutElastic',
				duration: 3000
			});
			await this.utils.createAndShowLoader('Loading...');
		}
		await this.getData();
		(<HTMLIonSegmentElement>document.getElementById('lessons-filter-segment')).value = "all";
		if (event) {
			event.target.complete();
			setTimeout(() => {
				event.target.complete();
			}, 5000);
		} else {
			await this.utils.dismissLoader();
		}
	}

	private async getData() {
		await this.lessonsDataService.refreshLessons();
		this.displayedLessons = this.lessonsDataService.lessons.sort(this.lessonsDataService.sortLessonsByTime);
	}

	openLesson(lesson: Lesson) {
		this.navController.navigateForward(
			['sentences-list'], {
				queryParams: {
					lessonId: lesson.id,
					parentId: lesson.parentId,
					showLoader: lesson.statistics.length > 20
				}
			});
	}
}
