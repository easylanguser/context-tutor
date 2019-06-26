import { Component, OnInit, ViewChildren, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { LoadingController, IonItemSliding, AlertController, NavController, IonFab } from '@ionic/angular';
import { Lesson } from 'src/app/models/lesson';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { LessonDeleteService } from '../../services/http/lesson-delete/lesson-delete.service';
import { Chart } from 'chart.js';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { updateIsRequired } from 'src/app/app.component';
import * as _ from 'lodash';
import { USER_AVATAR_KEY } from '../account/account.page';
import { StorageService } from 'src/app/services/storage/storage-service';
import { GetUserAvatarService } from 'src/app/services/http/get-user-avatar/get-user-avatar.service';

@Component({
	selector: 'page-lessons-list',
	templateUrl: 'lessons-list.page.html',
	styleUrls: ['lessons-list.page.scss']
})
export class LessonsListPage implements OnInit, AfterViewInit {

	displayedLessons: Lesson[] = [];
	@ViewChildren('chartsid') pieCanvases: any;
	@ViewChild('fab', { static: false }) fabBtn: IonFab;
	pieCharts: Array<Chart> = [];
	firstEnter: boolean = true;
	displayHints: boolean = false;

	constructor(
		private loadingController: LoadingController,
		private navCtrl: NavController,
		private lessonsDataService: LessonsDataService,
		private alertCtrl: AlertController,
		private lessonDeleteService: LessonDeleteService,
		private storage: StorageService,
		private getAvatarService: GetUserAvatarService,
		private utils: UtilsService,
		private cdRef: ChangeDetectorRef) { }

	async ngOnInit() {
		const loading = await this.loadingController.create({
			message: 'Loading',
			backdropDismiss: true
		});
		await loading.present();
		this.getData().then(() => {
			this.displayedLessons.sort(this.lessonsDataService.sortLessonsByTime);
			loading.dismiss();
		});
		this.configureTipsFloating();
	}

	configureTipsFloating() {
		const fab: HTMLElement = <HTMLElement>(document.getElementById("add-lesson-fab").firstChild);
		fab.addEventListener('click', () => {
			if (!this.lessonsDataService.lessons.length) {
				const tip = document.getElementById('tip-add-lesson');
				if (fab.classList.contains('fab-button-close-active')) {
					tip.style.bottom = 'calc(3vh + 20px)';
					tip.style.right = 'calc(3vh + 50px)';
					tip.innerHTML = "Click button \u21e8 <br>to add a <b>new lesson</b>";
				} else {
					tip.style.bottom = 'calc(3vh + 80px)';
					tip.style.right = 'calc(3vh + 5px)';
					tip.innerHTML = "Choose <b>file</b> or add <b>manually</b><br> \u21e9 \u21e9";
				}
			}
		});

		const content = <HTMLIonContentElement>document.getElementById('list-scroll');
		content.scrollEvents = true;
		const fabAdd = document.getElementById('add-lesson-fab');
		content.addEventListener('ionScroll', _.throttle((ev: CustomEvent) => {
			if (ev.detail.velocityY > 0.1) {
				fabAdd.classList.add('hidden-btn');
			} else if (ev.detail.velocityY < -0.1) {
				fabAdd.classList.remove('hidden-btn');
			}
		}, 300));
	}

	ionViewDidEnter() {
		this.updateCharts();
		if (updateIsRequired[0]) {
			this.getData().then(() => {
				this.displayedLessons.sort(this.lessonsDataService.sortLessonsByTime);
			});
			updateIsRequired[0] = false;
		}
		this.lessonsDataService.lessons.forEach(lsn => {
			lsn.sentences.forEach(sentence => {
				const stat = this.lessonsDataService.getStatisticsOfSentence(sentence);
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
			});
		});
	}

	ionViewWillLeave() {
		const fab: HTMLElement = <HTMLElement>(document.getElementById("add-lesson-fab").firstChild);
		fab.dispatchEvent(new Event('click'));
		this.fabBtn.close();
	}

	ngAfterViewInit() {
		this.pieCanvases.changes.subscribe(() => {
			this.syncCharts();
			this.cdRef.detectChanges();
		});
	}

	addLessonFile() {
		this.navCtrl.navigateForward(['add-lesson']);
	}

	addLessonText() {
		this.navCtrl.navigateForward(['add-lesson'], { queryParams: { hideFileInput: true } });
	}

	private syncCharts() {
		this.pieCharts = [];
		for (const i in this.pieCanvases._results) {
			this.pieCharts.push(new Chart(this.pieCanvases._results[i].nativeElement, this.utils.getNewChartObject()));
		}
		this.updateCharts();
	}

	private updateCharts() {
		let i = 0;
		for (const lesson of this.displayedLessons) {
			const chartData = this.pieCharts[i].data.datasets[0];
			chartData.data[0] = 1;
			chartData.data[1] = 0;
			chartData.data[2] = 0;
			for (const stats of lesson.statistics) {
				if (stats.correctAnswers + stats.wrongAnswers + stats.hintUsages + stats.giveUps > 0) {
					chartData.data[0] += stats.correctAnswers;
					chartData.data[1] += stats.wrongAnswers;
					chartData.data[2] += stats.hintUsages + stats.giveUps;
				}
			}

			if (chartData.data[0] + chartData.data[1] + chartData.data[2] > 1) {
				--chartData.data[0];
				chartData.backgroundColor[0] = '#AFF265';
				chartData.backgroundColor[1] = '#FF9055';
				chartData.backgroundColor[2] = '#FFE320';
				this.pieCharts[i].options.cutoutPercentage = 60;
				this.pieCharts[i].update();
			}
			++i;
		}

		this.cdRef.detectChanges();
	}

	async deleteItem(slidingItem: IonItemSliding, lessonID: number) {
		const alert = await this.alertCtrl.create({
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
					handler: () => {
						slidingItem.close();

						this.lessonDeleteService.delete(lessonID);
						this.lessonsDataService.removeAllLessonSentences(lessonID);
						this.lessonsDataService.removeLesson(lessonID);

						let i = 0;
						for (i; i < this.displayedLessons.length; i++) {
							if (this.displayedLessons[i].id === lessonID) {
								break;
							}
						}

						if (i !== this.displayedLessons.length) {
							this.displayedLessons.splice(i, 1);
							this.pieCharts[i].destroy();
							this.pieCharts.splice(i, 1);
						}
					}
				}
			]
		});
		await alert.present();
	}

	async editItem(slidingItem: IonItemSliding, lessonId: number) {
		slidingItem.close();
		this.navCtrl.navigateForward(['edit-lesson-title'], { queryParams: { lessonId: lessonId } });
	}

	doRefresh(event) {
		this.getData().then(() => {
			event.target.complete();
			(<HTMLIonSegmentElement>document.getElementById('lessons-filter-segment')).value = "all";
		});
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	private async getData() {
		await this.lessonsDataService.refreshLessons().then(() => {
			this.displayedLessons = this.lessonsDataService.lessons;
			this.displayHints = this.displayedLessons.length === 0;
		});
	}

	async filterClick(type: number) {
		const loading = await this.loadingController.create({
			message: 'Loading',
			backdropDismiss: true
		});
		await loading.present();
		const allLessons = await this.lessonsDataService.lessons;
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
		await loading.dismiss();
	}

	openLesson(lesson: Lesson) {
		if (lesson.statistics.length < 20) {
			this.navCtrl.navigateForward(
				['sentences-list'], {
					queryParams: {
						lessonID: lesson.id
					}
				});
		} else {
			this.navCtrl.navigateForward(
				['sentences-list'], {
					queryParams: {
						lessonID: lesson.id,
						showLoader: true
					}
				});
		}
	}
}
