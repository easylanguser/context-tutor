import { Component, OnInit, ViewChildren } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Lesson } from 'src/app/models/lesson';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import { UtilsService } from 'src/app/services/utils/utils.service';
import * as _ from 'lodash';
import { Globals } from 'src/app/services/globals/globals';
import { GestureHandlerService } from 'src/app/services/gestures/gesture-handler.service';

@Component({
	selector: 'page-lessons-list',
	templateUrl: 'lessons-list.page.html',
	styleUrls: ['lessons-list.page.scss']
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
		this.resetLocalStatistic();
		this.updateCharts();
	}

	private resetLocalStatistic() {
		this.lessonsDataService.lessons.forEach(lsn => {
			lsn.sentences.forEach(sentence => {
				const stat = this.lessonsDataService.getStatisticsOfSentence(sentence);
				if (stat) {
					stat.isSolved = false;
					stat.curWordIndex = 0;
					for (let i in stat.curCharsIndexes) {
						stat.curCharsIndexes[i] = 0;
					}
					if (stat.curCharsIndexes.length === 0) {
						for (let _ in sentence.hiddenChars) {
							stat.curCharsIndexes.push(0);
						}
					}
				}
			});
		});
		this.globals.savedTemplates = [];
	}

	addLessonFile() {
		this.navController.navigateForward(['add-lesson']);
	}

	private syncCharts() {
		this.pieCharts = [];
		for (const canvas of this.pieCanvases._results) {
			this.pieCharts.push(new Chart(canvas.nativeElement, this.utils.getNewChartObject()));
		}
		this.updateCharts();
	}

	private updateCharts() {
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
					this.pieCharts[i].update();
				}
			}
			++i;
		}
	}

	async doRefresh(event?: any) {
		if (!event) {
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
