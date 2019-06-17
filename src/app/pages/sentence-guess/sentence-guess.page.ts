import { StatisticsUpdateService } from '../../services/http/statistics-update/statistics-update.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController, NavController } from '@ionic/angular';
import { Sentence } from 'src/app/models/sentence';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import { sortIsRequired } from 'src/app/app.component';
import { Statistics } from 'src/app/models/statistics';

@Component({
	selector: 'app-sentence-guess',
	templateUrl: './sentence-guess.page.html',
	styleUrls: ['./sentence-guess.page.scss']
})

export class SentenceGuessPage implements OnInit {

	@ViewChild('pieCanvas') pieCanvas;
	pieChart: any;

	toastIsShown: boolean; // Single toast flag
	lessonId: number = 0; // Id of current lesson
	sentenceId: number; // Number of current sentence in lesson

	sentenceNumber: number;
	sentencesTotal: number;

	curWordIndex: number = 0; // Number of word, that user is currently at
	curCharsIndexes: number[] = []; // Number of character for each word, that user is currently at
	sentenceShown: string; // Current displayed sentence

	statisticsDeltasArray: Array<[number, number, number, number]> = []; // Deltas by id for red, yellow, green stats

	constructor(private route: ActivatedRoute,
		private toastController: ToastController,
		public lessonsDataService: LessonsDataService,
		private utils: UtilsService,
		private statisticsUpdateService: StatisticsUpdateService,
		private navCtrl: NavController) { }

	ngOnInit() {
		this.sentenceId = Number(this.route.snapshot.queryParamMap.get('current'));
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lesson'));

		if (!this.lessonsDataService.lessons.length) {
			this.lessonsDataService.refreshLessons().then(() => {
				this.getData();
			});
		} else {
			this.getData();
		}
	}

	private getData() {
		this.pieChart = new Chart(this.pieCanvas.nativeElement, this.utils.getNewChartObject());
		this.updateChart();

		this.sentenceNumber = this.lessonsDataService.getSentenceNumberByIDs(this.lessonId, this.sentenceId) + 1;
		this.sentencesTotal = this.lessonsDataService.getLessonByID(this.lessonId).sentences.length;

		const stats = this.curSentenceStatistics();
		this.statisticsDeltasArray.push([
			this.curSentence().id,
			stats.wrongAnswers,
			stats.hintUsages + stats.giveUps,
			stats.correctAnswers
		]);
	}

	// Get current Sentence object from service
	curSentence(): Sentence {
		const lessonSentences = this.lessonsDataService.getLessonByID(this.lessonId).sentences;
		return lessonSentences.find(sentence => sentence.id === this.sentenceId);
	}

	curSentenceStatistics(): Statistics {
		return this.lessonsDataService.getStatisticsOfSentence(this.curSentence());
	}

	updateChart() {
		const chart = this.pieChart.data.datasets[0];
		const chartData = chart.data;
		const chartColors = chart.backgroundColor;
		const stats = this.curSentenceStatistics();

		if (stats.correctAnswers + stats.wrongAnswers + stats.hintUsages + stats.giveUps === 0) {
			chartData[0] = 1;
			chartData[1] = 0;
			chartData[2] = 0;
		} else {
			chartData[0] = stats.correctAnswers;
			chartData[1] = stats.wrongAnswers;
			chartData[2] = stats.hintUsages + this.curSentence().words.length * stats.giveUps;
			chartColors[0] = '#AFF265';
			chartColors[1] = '#FF9055';
			chartColors[2] = '#FFE320';
		}

		this.pieChart.update();
	}

	saveStatistics() {
		const stats = this.curSentenceStatistics();
		this.statisticsUpdateService
			.updateData({
				sentenceId: this.curSentence().id,
				curCharsIndexes: [],
				curWordIndex: 0,
				solvedStatus: false,
				correctAnswers: stats.correctAnswers,
				giveUps: stats.giveUps,
				hintUsages: stats.hintUsages,
				lessonLeaves: stats.lessonLeaves,
				sentenceSkips: stats.sentenceSkips,
				wordSkips: stats.wordSkips,
				wrongAnswers: stats.wrongAnswers
			}).subscribe();

		const index = this.statisticsDeltasArray.findIndex(el => el[0] === this.curSentence().id);
		if (index > -1) {
			const arr = this.statisticsDeltasArray[index];
			arr[0] = this.curSentence().id;
			arr[1] = stats.wrongAnswers;
			arr[2] = stats.hintUsages + stats.giveUps;
			arr[3] = stats.correctAnswers;
		} else {
			this.statisticsDeltasArray.push([
				this.curSentence().id,
				stats.wrongAnswers,
				stats.hintUsages + stats.giveUps,
				stats.correctAnswers
			]);
		}
	}

	goBack() {
		this.navCtrl.navigateBack(['sentences-list'], { queryParams: { lessonID: this.lessonId } });
	}

	saveData() {
		this.curSentenceStatistics().curWordIndex = this.curWordIndex;
		this.curSentenceStatistics().curCharsIndexes = this.curCharsIndexes;
		this.saveStatistics();
	}

	ionViewWillLeave() {
		this.saveData();
		sortIsRequired[0] = true;
	}

	async showToast() {
		this.toastIsShown = true;
		const stats = this.curSentenceStatistics();
		const savedStats = this.statisticsDeltasArray.find(elem => elem[0] === this.curSentence().id);
		const greenDelta = stats.correctAnswers - savedStats[3];
		const yellowDelta = stats.giveUps + stats.hintUsages - savedStats[2];
		const redDelta = stats.wrongAnswers - savedStats[1];
		if (greenDelta + yellowDelta + redDelta !== 0) {
			const toast = await this.toastController.create({
				message: 'Green: +' + greenDelta + '\nYellow: +' + yellowDelta + '\nRed: +' + redDelta,
				position: 'middle',
				duration: 1200,
				cssClass: 'toast-black',
				animated: true
			});
			toast.present();
			setTimeout(() => { this.toastIsShown = false; }, 1500);
		} else {
			this.toastIsShown = false;
		}
	}
}
