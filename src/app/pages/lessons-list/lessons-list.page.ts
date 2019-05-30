import { Component, OnInit, ViewChildren, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { LoadingController, IonItemSliding, AlertController, NavController, IonFab } from '@ionic/angular';
import { Lesson } from 'src/app/models/lesson';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { LessonDeleteService } from '../../services/http/lesson-delete/lesson-delete.service';
import { Chart } from 'chart.js';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { updateIsRequired } from 'src/app/app.component';

@Component({
	selector: 'page-lessons-list',
	templateUrl: 'lessons-list.page.html',
	styleUrls: ['lessons-list.page.scss']
})
export class LessonsListPage implements OnInit, AfterViewInit {

	displayedLessons: Lesson[] = [];
	@ViewChildren('chartsid') pieCanvases: any;
	@ViewChild('fab') fabBtn: IonFab;
	pieCharts: Array<Chart> = [];
	firstEnter: boolean = true;
	statisticsIsNotEmpty: boolean = true;
	displayHints: boolean = false;

	constructor(
		private loadingController: LoadingController,
		private navCtrl: NavController,
		private lessonsDataService: LessonsDataService,
		private alertCtrl: AlertController,
		private lessonDeleteService: LessonDeleteService,
		private utils: UtilsService,
		private cdRef: ChangeDetectorRef) { }

	ngOnInit() {
		this.configureTipsFloating();
		this.getData();
	}

	configureTipsFloating() {
		const fab: HTMLElement = <HTMLElement>(document.getElementById("add-lesson-fab").firstChild);
		fab.addEventListener('click', () => {
			if (!this.displayedLessons.length) {
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
	}

	ionViewDidEnter() {
		if (this.firstEnter) {
			this.firstEnter = false;
		} else {
			this.updateCharts();
			if (updateIsRequired[0]) {
				this.getData();
				updateIsRequired[0] = false;
			}
		}
	}

	ionViewWillLeave() {
		const fab: HTMLElement = <HTMLElement>(document.getElementById("add-lesson-fab").firstChild);
		fab.dispatchEvent(new Event('click'));
		this.fabBtn.close();
	}

	ngAfterViewInit() {
		this.pieCanvases.changes.subscribe(() => {
			this.syncCharts();
			this.displayHints = this.displayedLessons.length === 0;
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
		let i = 0, statisticsIsNotEmpty: boolean = false;
		for (const lesson of this.displayedLessons) {
			const chartData = this.pieCharts[i].data.datasets[0];
			chartData.data[0] = 1;
			chartData.data[1] = 0;
			chartData.data[2] = 0;
			for (const sentence of lesson.sentences) {
				const stats = sentence.statistics;
				if (stats.correctAnswers + stats.wrongAnswers + stats.hintUsages + stats.giveUps > 0) {
					chartData.data[0] += stats.correctAnswers;
					chartData.data[1] += stats.wrongAnswers;
					chartData.data[2] += stats.hintUsages + sentence.hiddenWord.length * stats.giveUps;
				}
			}

			if (chartData.data[0] + chartData.data[1] + chartData.data[2] > 1) {
				--chartData.data[0];
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
			this.updateCharts();
		});
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	private async getData() {
		const loading = await this.loadingController.create({ message: 'Loading', duration: 8000 });
		await loading.present();
		await this.lessonsDataService.getLessons().then(() => {
			this.displayedLessons = this.lessonsDataService.lessons;
			this.displayHints = this.displayedLessons.length === 0;
			this.displayedLessons.sort(this.lessonsDataService.sortLessonsByTime);
		}).then(() => loading.dismiss());
	}

	allClick() {
		this.displayedLessons = this.lessonsDataService.lessons;
	}

	redClick() {
		this.displayedLessons = this.lessonsDataService.lessons.filter(lesson =>
			lesson.sentences.some(snt => snt.statistics.wrongAnswers > 0)
		);
	}

	redAndYellowClick() {
		this.displayedLessons = this.lessonsDataService.lessons.filter(this.utils.redAndYellowFilterLesson);
	}

	openLesson(lessonID) {
		this.navCtrl.navigateForward(
			['sentences-list'], {
				queryParams: {
					lessonID: lessonID
				}
			});
	}
}
