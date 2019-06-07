import { Component, OnInit, ViewChildren } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { Chart } from 'chart.js';
import { LoadingController, NavController } from '@ionic/angular';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { sharedText } from 'src/app/app.component';

@Component({
	selector: 'app-share-adding-choice',
	templateUrl: './share-adding-choice.page.html',
	styleUrls: ['./share-adding-choice.page.scss'],
})
export class ShareAddingChoicePage implements OnInit {

	displayedLessons: Lesson[];
	allLessons: Lesson[];
	@ViewChildren('chartsid') pieCanvases: any;
	pieCharts: Array<Chart> = [];
	searchValue: string;

	constructor(
		private navCtrl: NavController,
		private loadingController: LoadingController,
		private lessonsDataService: LessonsDataService,
		private utils: UtilsService) { }

	ngOnInit() {
		this.getData();
	}

	goBack() {
		sharedText[0] = undefined;
		this.navCtrl.navigateBack(['lessons-list']);
	}

	ngAfterViewInit() {
		this.pieCanvases.changes.subscribe(() => {
			this.syncCharts();
		});
	}

	filterLessons(event: CustomEvent) {
		const fltr = String(event.detail.value);
		this.displayedLessons = this.allLessons.filter(lsn => lsn.name.toLowerCase().indexOf(fltr.toLowerCase()) >= 0);
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
				chartData.backgroundColor[0] = '#AFF265';
				chartData.backgroundColor[1] = '#FF9055';
				chartData.backgroundColor[2] = '#FFE320';
				this.pieCharts[i].options.cutoutPercentage = 67;
				this.pieCharts[i].update();
			}

			++i;
		}
	}

	private async getData() {
		const loading = await this.loadingController.create({
			message: 'Loading',
			backdropDismiss: true
		});
		await loading.present();
		await this.lessonsDataService.refreshLessons().then(() => {
			this.displayedLessons = this.lessonsDataService.lessons;
			this.allLessons = Object.assign([], this.displayedLessons);
		}).then(() => loading.dismiss());
	}

	addToExistingLesson(lessonId: number) {
		this.navCtrl.navigateForward(['sentence-adding'], { queryParams: { lessonId: lessonId } });
	}

	createNewLesson() {
		this.navCtrl.navigateForward(['sentence-adding']);
	}
}
