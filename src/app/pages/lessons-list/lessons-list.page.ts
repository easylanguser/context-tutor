import { Component, OnInit, ViewChildren, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { IonItemSliding, AlertController, NavController, IonList, ModalController } from '@ionic/angular';
import { Lesson } from 'src/app/models/lesson';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import { UtilsService } from 'src/app/services/utils/utils.service';
import * as _ from 'lodash';
import { LessonHttpService } from 'src/app/services/http/lessons/lesson-http.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Globals } from 'src/app/services/globals/globals';
import { ShareLessonModal } from 'src/app/modals/share-lesson/share-lesson.modal';

const urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

@Component({
	selector: 'page-lessons-list',
	templateUrl: 'lessons-list.page.html',
	styleUrls: ['lessons-list.page.scss']
})
export class LessonsListPage implements OnInit, AfterViewInit {

	displayedLessons: Lesson[] = [];
	@ViewChildren('chartsid') pieCanvases: any;
	@ViewChild('lessonsList', { static: false }) lessonsList: IonList;
	pieCharts: Array<Chart> = [];
	firstEnter: boolean = true;

	contentIsScrolled: boolean = false;

	constructor(
		private navController: NavController,
		private lessonsDataService: LessonsDataService,
		private alertController: AlertController,
		private lessonHttpService: LessonHttpService,
		private utils: UtilsService,
		public globals: Globals,
		private browser: InAppBrowser,
		private cdRef: ChangeDetectorRef,
		private modalController: ModalController) { }

	async ngOnInit() {
		await this.utils.createAndShowLoader('Loading');
		await this.getData();
		this.addFabsHandler();
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
		this.updateCharts();
		if (this.globals.updateIsRequired[0]) {
			this.getData().then(() => {
				this.globals.updateIsRequired[0] = false;
			});
		}
		this.resetLocalStatistic();
	}

	private resetLocalStatistic() {
		this.lessonsDataService.lessons.forEach(lsn => {
			lsn.sentences.forEach(sentence => {
				const stat = this.lessonsDataService.getStatisticsOfSentence(sentence);
				if (stat) {
					stat.solvedStatus = false;
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

	ngAfterViewInit() {
		this.pieCanvases.changes.subscribe(() => {
			this.syncCharts();
			this.cdRef.detectChanges();
		});
	}

	async ionViewWillLeave() {
		await this.lessonsList.closeSlidingItems();
	}

	addLessonFile() {
		this.navController.navigateForward(['add-lesson']);
	}

	private syncCharts() {
		this.pieCharts = [];
		for (const i in this.pieCanvases._results) {
			this.pieCharts.push(new Chart(this.pieCanvases._results[i].nativeElement, this.utils.getNewChartObject()));
		}
		this.updateCharts();
	}

	async openLink(slidingItem: IonItemSliding, lessonUrl: string) {
		if (lessonUrl.match(urlRegex)) {
			slidingItem.close().then(() => {
				this.browser.create(lessonUrl);
			});
		} else {
			this.utils.showToast('Lesson URL is not valid');
		}
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
					if (stats && (stats.correctAnswers + stats.wrongAnswers + stats.hintUsages + stats.giveUps > 0)) {
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
				++i;
			}
		}

		this.cdRef.detectChanges();
	}

	async deleteItem(slidingItem: IonItemSliding, lessonId: number) {
		const alert = await this.alertController.create({
			message: 'Are you sure you want to delete this lesson?',
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
					handler: async () => {
						slidingItem.close();
						await this.lessonHttpService.deleteLesson(lessonId);
						this.lessonsDataService.removeLesson(lessonId);

						if (this.displayedLessons.length === 0) {
							await this.getData();
						}
					}
				}
			]
		});
		await alert.present();
	}

	async shareLesson(slidingItem: IonItemSliding, lesson: Lesson) {
		slidingItem.close();
		const modal = await this.modalController.create({
			component: ShareLessonModal,
			componentProps: {
				'lessonId': lesson.id
			}
		});
		return await modal.present();

	}

	async editItem(slidingItem: IonItemSliding, lessonId: number) {
		slidingItem.close();
		this.navController.navigateForward(['edit-lesson-title'], { queryParams: { lessonId: lessonId } });
	}

	async doRefresh(event) {
		await this.getData();
		(<HTMLIonSegmentElement>document.getElementById('lessons-filter-segment')).value = "all";

		event.target.complete();
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	private async getData() {
		await this.utils.createAndShowLoader('Loading...');
		await this.lessonsDataService.refreshLessons();
		this.displayedLessons = this.lessonsDataService.lessons.sort(this.lessonsDataService.sortLessonsByTime);

		await this.utils.dismissLoader();
	}

	async filterClick(type: number) {
		await this.lessonsList.closeSlidingItems();
		await this.utils.createAndShowLoader('Loading');

		const allLessons = this.lessonsDataService.lessons;
		if (type === 1) {
			this.displayedLessons = allLessons;
		} else {
			if (type === 2) {
				this.displayedLessons = allLessons.filter(this.utils.redAndYellowFilterLesson);
			} else {
				this.displayedLessons = allLessons.filter(lesson =>
					lesson.statistics.some(stat => stat.wrongAnswers > 0)
				);
			}
		}

		await this.utils.dismissLoader();
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
