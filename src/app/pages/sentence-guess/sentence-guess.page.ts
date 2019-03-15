import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UtilsService } from '../../services/utils/utils.service';
import { ToastController } from '@ionic/angular';
import { Sentence } from 'src/app/models/sentence';
import { LessonsService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import * as anime from 'animejs';
import { GuessBarComponent } from 'src/app/components/guess-bar/guess-bar.component';

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
	sentenceIndex: number = 1; // Number of current sentence in lesson

	constructor(private route: ActivatedRoute,
		private loadingController: LoadingController,
		private util: UtilsService,
		private toastController: ToastController,
		public lessonsData: LessonsService) { }

	// Get number of sentence and id of the lesson from previous page
	ngOnInit() {
		this.sentenceIndex = Number(this.route.snapshot.queryParamMap.get('current')) + 1;
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lesson'));

		this.pieChart = new Chart(this.pieCanvas.nativeElement, {
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
		});

		this.updateChart();
	}

	// Get current Sentence object from service
	curSentence(): Sentence {
		return this.lessonsData.getLessonByID(this.lessonId).sentences[this.sentenceIndex - 1];
	}

	updateChart() {
		const chartData = this.pieChart.data.datasets[0];
		const stats = this.curSentence().statistics;

		if (stats.correctAnswers + stats.wrongAnswers + stats.hintUsages + stats.giveUps === 0) {
			chartData.data[0] = 1;
			chartData.data[1] = 0;
			chartData.data[2] = 0;
			chartData.backgroundColor[0] = '#F0F0F0';
		} else {
			chartData.data[0] = stats.correctAnswers;
			chartData.data[1] = stats.wrongAnswers;
			chartData.data[2] = stats.hintUsages + this.curSentence().hiddenWord.length * stats.giveUps;
			chartData.backgroundColor[0] = '#0F0';
			chartData.backgroundColor[1] = '#F00';
			chartData.backgroundColor[2] = '#FF0';
		}

		this.pieChart.update();
	}

	async showToast() {
		this.toastIsShown = true;
		const toast = await this.toastController.create({
			message: 'Sentence is filled',
			position: 'middle',
			duration: 1000,
			animated: true
		});
		toast.present();
		setTimeout(() => { this.toastIsShown = false; }, 1500);
	}
}
