import { Component, ViewChild, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LessonsListService } from 'src/app/services/lessons-list/lessons-list.service';
import { Lesson } from 'src/app/models/lesson';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import { ElementRef } from '@angular/core';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
	styleUrls: ['home.scss']
})

export class HomePage {

	@ViewChild('chartCanvas') chartCanvas: ElementRef;

	correct: number;
	wrong: number;
	chartVar: any;
	voted: boolean = false;

	constructor(private api: LessonsListService,
		private loadingController: LoadingController,
		private router: Router,
		private lessonData: LessonsDataService) {
		this.getData();
		this.wrong = 3;
		this.correct = 6;
	}

	ngAfterViewInit() {
		setTimeout(() => {
			if (!this.chartCanvas.nativeElement) {
				setTimeout(() => {
					if (!this.chartCanvas.nativeElement) {
						return;
					} else {
						this.showChart();
					}
				}, 2000)
			} else {
				this.showChart();
			}
		}, 2000)
	}

	showChart() {
		this.chartVar = new Chart(this.chartCanvas.nativeElement, {
			type: 'doughnut',
			data: {
				datasets: [{
					data: [this.correct, this.wrong],
					backgroundColor: [
						'rgba(41, 255, 122, 1)',
						'rgba(255, 1, 12, 1)'
					]
				}],
				labels: [
					'correct',
					'wrong'
				]
			},

			options: {
				legend: {
					display: false
				},
				tooltips: {
					enabled: true
				}
			}
		})
	}

	doRefresh(event) {
		this.getData().then(_ => { event.target.complete() });
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	// Get list of lessons for the home page
	private async getData() {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();
		this.api.getData()
			.subscribe(res => {
				for (let i = 0; i < res[0].length; i++) {
					const lesson = new Lesson(res[0][i].id, res[0][i].name,
						res[0][i].url, res[0][i].created_at);
					if (this.lessonData.getLessonByID(lesson.id) === undefined) {
						this.lessonData.addLesson(lesson);
					}
				}
				loading.dismiss();
			}, err => {
				console.log(err);
				loading.dismiss();
			});
	}

	// Load new page with text
	openLesson(lessonID) {
		this.router.navigate(['sentences-list'], { queryParams: { lessonID: lessonID } });
	}
}
