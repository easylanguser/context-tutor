import { Component, OnInit, ViewChildren, AfterViewInit } from '@angular/core';
import { LoadingController, IonItemSliding, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Lesson } from 'src/app/models/lesson';
import { LessonsService } from 'src/app/services/lessons/lessons.service';
import { LessonDeleteService } from '../../services/http/lesson-delete/lesson-delete.service';
import { Chart } from 'chart.js';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: 'page-lessons-list',
	templateUrl: 'lessons-list.page.html',
	styleUrls: ['lessons-list.page.scss']
})
export class LessonsListPage implements OnInit, AfterViewInit {

	displayedLessons: Lesson[];
	@ViewChildren('chartsid') pieCanvases: any;
	pieCharts: Array<Chart> = [];
	firstEnter: boolean = true;

	constructor(private loadingController: LoadingController,
		private router: Router,
		private lessonService: LessonsService,
		private alertCtrl: AlertController,
		private lessonDeleteService: LessonDeleteService,
		private utils: UtilsService) { }

	ngOnInit() {
		this.getData();
	}

	ionViewDidEnter() {
		this.firstEnter ? this.firstEnter = false : this.updateCharts();
	}

	ngAfterViewInit() {
		this.pieCanvases.changes.subscribe(_ => {
			this.syncCharts();
		});
	}

	addLesson() {
		this.router.navigate(['add-lesson']);
	}

	private syncCharts() {
		this.pieCharts = [];
		for (let i = 0; i < this.pieCanvases._results.length; i++) {
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
			}

			++i;
		}
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

	doRefresh(event) {
		this.getData().then(_ => {
			event.target.complete();
			this.updateCharts();
		});
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	private async getData() {
		const loading = await this.loadingController.create({ message: 'Loading' });
		await loading.present();
		await this.lessonService.getLessons().then(() => {
			this.displayedLessons = this.lessonService.lessons;
		}).then(() => loading.dismiss());
	}

	allClick() {
		this.displayedLessons = this.lessonService.lessons;
	}

	redClick() {
		this.displayedLessons = this.lessonService.lessons.filter(lesson =>
			lesson.sentences.some(snt => snt.statistics.wrongAnswers > 0)
		);
	}

	redAndYellowClick() {
		this.displayedLessons = this.lessonService.lessons.filter(this.utils.redAndYellowFilterLesson);
	}

	openLesson(lessonID) {
		this.router.navigate(['sentences-list'], { queryParams: { lessonID: lessonID } });
	}
}
