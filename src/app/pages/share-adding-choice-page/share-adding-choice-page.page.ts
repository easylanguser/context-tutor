import { Component, OnInit, ViewChildren } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { Chart } from 'chart.js';
import { LoadingController } from '@ionic/angular';
import { LessonsService } from 'src/app/services/lessons/lessons.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: 'app-share-adding-choice-page',
	templateUrl: './share-adding-choice-page.page.html',
	styleUrls: ['./share-adding-choice-page.page.scss'],
})
export class ShareAddingChoicePagePage implements OnInit {

	displayedLessons: Lesson[];
	@ViewChildren('chartsid') pieCanvases: any;
	pieCharts: Array<Chart> = [];

	constructor(
		private loadingController: LoadingController,
		private lessonService: LessonsService,
		private utils: UtilsService) { }

	ngOnInit() {
		this.getData();
	}

	ngAfterViewInit() {
		this.pieCanvases.changes.subscribe(() => {
			this.syncCharts();
		});
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

	private async getData() {
		const loading = await this.loadingController.create({ message: 'Loading' });
		await loading.present();
		await this.lessonService.getLessons().then(() => {
			this.displayedLessons = this.lessonService.lessons;
		}).then(() => loading.dismiss());
	}
}
