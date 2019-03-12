import { Component, OnInit, ViewChildren, AfterViewInit } from '@angular/core';
import { LoadingController, IonItemSliding, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Lesson } from 'src/app/models/lesson';
import { LessonsService } from 'src/app/services/lessons-data/lessons-data.service';
import { LessonDeleteService } from 'src/app/services/lesson-delete/lesson-delete.service';
import { Chart } from 'chart.js';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
	styleUrls: ['home.scss']
})
export class HomePage implements OnInit, AfterViewInit {

	displayedLessons: Lesson[];
	@ViewChildren('chartsid') pieCanvases: any;
	pieCharts: Array<Chart> = [];

	constructor(private loadingController: LoadingController,
		private router: Router,
		private lessonService: LessonsService,
		private alertCtrl: AlertController,
		private lessonDeleteService: LessonDeleteService) { }

	ngOnInit() {
		this.getData().then(res => res);
	}

	ionViewDidEnter() {
		this.updateCharts();
	}

	ngAfterViewInit() {
		this.pieCanvases.changes.subscribe(_ => {
			this.syncCharts();
		});
	}

	private syncCharts() {
		this.pieCharts = [];
		for (let i = 0; i < this.pieCanvases._results.length; i++) {
			this.pieCharts.push(new Chart(this.pieCanvases._results[i].nativeElement, {
				type: 'pie',
				data: {
					datasets: [
						{
							data: [1, 0, 0],
							backgroundColor: ['#999', '#999', '#999']
						}
					],
				},
				options: {
					legend: {
						display: false
					},
					tooltips: {
						enabled: false
					},
					events: [],
					elements: {
						arc: {
							borderWidth: 0
						}
					}
				}
			}));
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
				chartData.backgroundColor[0] = '#0F0';
				chartData.backgroundColor[1] = '#F00';
				chartData.backgroundColor[2] = '#FF0';
				this.pieCharts[i].update();
			} else {
				this.pieCharts[i].update({ duration: 0 });
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

						// this.lessonDeleteService.delete(lessonID);

						let i = 0;
						for (i; i < this.displayedLessons.length; i++) {
							if (this.displayedLessons[i].id === lessonID) {
								break;
							}
						}

						if (i !== this.displayedLessons.length) {
							this.displayedLessons.splice(i, 1);
							this.pieCharts.splice(i, 1);
						}
					}
				}
			]
		});
		await alert.present();
	}

	doRefresh(event) {
		this.getData().then(_ => { event.target.complete(); });
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	// Get list of lessons, add them to displayed and to lessons data serviced
	private async getData() {
		const loading = await this.loadingController.create({ message: 'Loading' });
		await loading.present();
		this.displayedLessons = await this.lessonService.getLessons();
		loading.dismiss();
	}

	allClick() {
		this.displayedLessons = this.lessonService.getLessons();
	}

	redClick() {
		this.displayedLessons = this.lessonService.getLessons().filter(lesson =>
			lesson.sentences.some(snt => snt.statistics.wrongAnswers > 0)
		);
	}

	redAndYellowClick() {
		this.displayedLessons = this.lessonService.getLessons().filter(lesson =>
			lesson.sentences.some(snt => snt.statistics.wrongAnswers > 0 && snt.statistics.hintUsages > 0)
		);
	}

	// Go to selected lesson page
	openLesson(lessonID) {
		this.router.navigate(['sentences-list'], { queryParams: { lessonID: lessonID } });
	}
}
