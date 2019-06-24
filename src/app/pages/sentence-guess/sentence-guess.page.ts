import { StatisticsUpdateService } from '../../services/http/statistics-update/statistics-update.service';
import { UtilsService, redCharForHiding, charForHiding } from 'src/app/services/utils/utils.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { Sentence } from 'src/app/models/sentence';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import { Statistics } from 'src/app/models/statistics';
import * as anime from 'animejs';
import { Location } from '@angular/common';

@Component({
	selector: 'app-sentence-guess',
	templateUrl: './sentence-guess.page.html',
	styleUrls: ['./sentence-guess.page.scss'],
	host: {
		'(document:keypress)': 'handleKeyboardEvent($event)'
	}
})

export class SentenceGuessPage implements OnInit {

	@ViewChild('pieCanvas') pieCanvas;
	pieChart: any;

	alertIsShown: boolean; // Single toast flag
	lessonId: number = 0; // Id of current lesson
	sentenceId: number; // Number of current sentence in lesson

	sentenceNumber: number;
	sentencesTotal: number;

	curWordIndex: number = 0; // Number of word, that user is currently at
	curCharsIndexes: number[] = []; // Number of character for each word, that user is currently at

	statisticsDeltasArray: Array<[number, number, number, number]> = []; // Deltas by id for red, yellow, green stats

	alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	updateFront: boolean = false;

	// Single animation at a time flags
	sentenceTranslateIsPlayed: boolean = false;
	charactersRotationIsPlayed: boolean = false;

	firstChar: string;
	secondChar: string;
	thirdChar: string;
	fourthChar: string;

	firstCharBack: string;
	secondCharBack: string;
	thirdCharBack: string;
	fourthCharBack: string;

	sentenceContent: HTMLElement;
	savedTemplates: Array<[number, HTMLElement[]]> = [];

	// Highlights colors
	yellowHighlight = '0 0 5px 1px #E0E306';
	redHighlight = '0px 0px 8px 0px rgba(167, 1, 6, 1)';

	groups = ['QWSD', 'RTFG', 'EAIO'];
	unknownCharGroup = '!@#&';

	constructor(private route: ActivatedRoute,
		private alertController: AlertController,
		public lessonsDataService: LessonsDataService,
		private utils: UtilsService,
		private statisticsUpdateService: StatisticsUpdateService,
		private location: Location,
		private navCtrl: NavController,
		private util: UtilsService) { }

	ngOnInit() {
		this.sentenceId = Number(this.route.snapshot.queryParamMap.get('current'));
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lesson'));

		this.sentenceContent = document.getElementById('sentence-content');

		if (!this.lessonsDataService.lessons.length) {
			this.lessonsDataService.refreshLessons().then(() => {
				this.lessonsDataService.getSentencesByLessonId(this.lessonId).then(() => {
					this.getData();
				});
			});
		} else {
			this.getData();
		}
	}

	private createSpan(isHidden: boolean, indexOfHidden?: number): HTMLElement {
		const span = document.createElement('span');
		span.className = isHidden ? 'hidden' : 'visible';
		if (isHidden) {
			span.id = 'box-' + String(indexOfHidden);
		}
		span.style.fontSize = '4vh';
		span.style.fontFamily = "Arial";
		span.style.userSelect = 'text';
		return span;
	}

	private getData() {
		this.pieChart = new Chart(this.pieCanvas.nativeElement, this.utils.getNewChartObject());
		this.updateChart();

		this.sentenceNumber = this.lessonsDataService.getSentenceNumberByIDs(this.lessonId, this.sentenceId) + 1;
		this.sentencesTotal = this.lessonsDataService.getLessonByID(this.lessonId).sentences.length;

		const stats = this.curStats();
		this.statisticsDeltasArray.push([
			this.curSentence().id,
			stats.wrongAnswers,
			stats.hintUsages + stats.giveUps,
			stats.correctAnswers
		]);

		while (this.sentenceContent.firstChild) {
			this.sentenceContent.removeChild(this.sentenceContent.firstChild);
		}

		if (this.curStats().solvedStatus) { // Display filled sentence, if it has already been solved
			const span = this.createSpan(false);
			span.innerText = this.curSentence().text;
			this.sentenceContent.appendChild(span);
		} else {
			// Restore user progress 
			this.curWordIndex = this.curStats().curWordIndex;
			this.curCharsIndexes = this.curStats().curCharsIndexes;

			this.restoreSentence();
		}

		if (this.lessonsDataService.getLessonByID(this.lessonId).sentences.length === 1) {
			document.getElementById('next-sentence-button').style.visibility = 'hidden';
			document.getElementById('prev-sentence-button').style.visibility = 'hidden';
		}
	}

	restoreSentence() {
		const templates = this.savedTemplates.find(elem => elem[0] === this.curSentence().id);
		if (templates) {
			for (let template of templates[1]) {
				this.sentenceContent.appendChild(template);
			}
		} else {
			const underscored = this.curSentence().textUnderscored;
			let previousIndex = 0, index = 1, span;
			for (let i = 0; i < underscored.length; i++) {
				if (underscored.charAt(i) === charForHiding) {
					span = this.createSpan(false);
					span.innerText = this.curSentence().textUnderscored.substring(previousIndex, i);
					this.sentenceContent.appendChild(span);

					previousIndex = i;

					do {
						++i;
						span = this.createSpan(true, index++);
						span.classList.add('blue-text');
						span.innerText = charForHiding;
						this.sentenceContent.appendChild(span);
						previousIndex = i;
					} while (underscored.charAt(i) === charForHiding && i < underscored.length);
				}
			}

			if (this.curSentence().textUnderscored.charAt(previousIndex) !== charForHiding) {
				span = this.createSpan(false);
				span.innerText = this.curSentence().textUnderscored.substring(previousIndex);
				this.sentenceContent.appendChild(span);
			}
			const firstBox = document.getElementById('box-1');
			firstBox.classList.remove('blue-text');
			firstBox.classList.add('red-text');
			firstBox.innerText = charForHiding;
		}

		this.refreshCharBoxes();
	}

	// Get current Sentence object from service
	curSentence(): Sentence {
		const lessonSentences = this.lessonsDataService.getLessonByID(this.lessonId).sentences;
		return lessonSentences.find(sentence => sentence.id === this.sentenceId);
	}

	curStats(): Statistics {
		return this.lessonsDataService.getStatisticsOfSentence(this.curSentence());
	}

	updateChart() {
		const chart = this.pieChart.data.datasets[0];
		const chartData = chart.data;
		const chartColors = chart.backgroundColor;
		const stats = this.curStats();

		if (stats.correctAnswers + stats.wrongAnswers + stats.hintUsages + stats.giveUps === 0) {
			chartData[0] = 1;
			chartData[1] = 0;
			chartData[2] = 0;
		} else {
			chartData[0] = stats.correctAnswers;
			chartData[1] = stats.wrongAnswers;
			chartData[2] = stats.hintUsages + stats.giveUps;
			chartColors[0] = '#AFF265';
			chartColors[1] = '#FF9055';
			chartColors[2] = '#FFE320';
		}

		this.pieChart.update();
	}

	saveStatistics() {
		const stats = this.curStats();
		this.statisticsUpdateService
			.updateData({
				sentenceId: this.curSentence().id,
				correctAnswers: stats.correctAnswers,
				giveUps: stats.giveUps,
				hintUsages: stats.hintUsages,
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
		this.curStats().curWordIndex = this.curWordIndex;
		this.curStats().curCharsIndexes = this.curCharsIndexes;
		this.saveStatistics();
	}

	ionViewWillLeave() {
		this.saveData();
	}

	async showAlert() {
		this.alertIsShown = true;
		const stats = this.curStats();
		const savedStats = this.statisticsDeltasArray.find(elem => elem[0] === this.curSentence().id);
		const greenDelta = stats.correctAnswers - savedStats[3];
		const yellowDelta = stats.giveUps + stats.hintUsages - savedStats[2];
		const redDelta = stats.wrongAnswers - savedStats[1];
		if (greenDelta + yellowDelta + redDelta !== 0) {
			const alert = await this.alertController.create({
				message: '<p>Green: +' + greenDelta + '</p><p>Yellow: +' +
					yellowDelta + '</p><p>Red: +' + redDelta + '</p>',
				buttons: this.sentencesTotal > 1
					?
					[
						{
							text: 'Ok',
							role: 'cancel'
						},
						{
							text: 'Next sentence',
							handler: () => {
								document.getElementById('next-sentence-button').click();
							}
						}
					]
					:
					[
						{
							text: 'Ok',
							role: 'cancel'
						}
					]
			});
			alert.present();
			setTimeout(() => { this.alertIsShown = false; }, 1500);
		} else {
			this.alertIsShown = false;
		}
	}

	// Get current character to be filled
	private curCorrectChar(): string {
		return this.curSentence().hiddenChars[this.curWordIndex][this.curCharsIndexes[this.curWordIndex]];
	}

	// Remove characters boxes highlighting
	private resetColors() {
		const boxesIDs = ['char-box-1', 'char-box-2', 'char-box-3', 'char-box-4'];
		for (const id of boxesIDs) {
			document.getElementById(id).style.boxShadow = 'none';
		}
	}

	changeSentence(forward: boolean) {
		if (this.sentenceTranslateIsPlayed) {
			return;
		}

		const elements = [];
		const id = this.curSentence().id;
		const indexOfExisting = this.savedTemplates.findIndex(elem => elem[0] === id);
		this.sentenceContent.childNodes.forEach(node => elements.push(<HTMLElement>(node)));

		if (indexOfExisting === -1) {
			this.savedTemplates.push([id, elements]);
		} else {
			this.savedTemplates[indexOfExisting] = [id, elements];
		}

		this.saveData();

		const lessonSentences = this.lessonsDataService.getLessonByID(this.lessonId).sentences;
		const currentLessonIndex = this.lessonsDataService
			.getSentenceNumberByIDs(this.lessonId, this.sentenceId);
		const firstSentenceId = lessonSentences[0].id
		const lastSentenceId = lessonSentences[lessonSentences.length - 1].id;

		if (forward) {
			this.sentenceId = (this.sentenceId === lastSentenceId)
				? firstSentenceId
				: lessonSentences[currentLessonIndex + 1].id;
		} else {
			this.sentenceId = (this.sentenceId === firstSentenceId)
				? lastSentenceId
				: lessonSentences[currentLessonIndex - 1].id;
		}

		this.curWordIndex = 0;
		this.curCharsIndexes = [];

		this.animateSwipe(forward);
		this.sentenceNumber = this.lessonsDataService.getSentenceNumberByIDs(this.lessonId, this.sentenceId) + 1;

		let path = this.location.path();
		path = path.replace(path.substring(path.indexOf('current'), path.indexOf('&')), 'current=' + this.curSentence().id);
		this.location.go(path);

		if (this.statisticsDeltasArray.findIndex(elem => elem[0] === this.curSentence().id) === -1) {
			const stats = this.curStats();
			this.statisticsDeltasArray.push([
				this.curSentence().id,
				stats.wrongAnswers,
				stats.hintUsages + stats.giveUps,
				stats.correctAnswers
			]);
		}
	}

	markAsSolved() {
		this.curStats().solvedStatus = true;
		if (!this.alertIsShown) {
			this.showAlert();
		}
	}

	giveUpClick() { // Give up and show full sentence
		if (!this.curStats().solvedStatus) {
			++this.curStats().giveUps; // Statistics

			const button: HTMLIonButtonElement = <HTMLIonButtonElement>(document.getElementById('give-up-button'));

			let event = new KeyboardEvent('evGiveUp', { key: this.curCorrectChar() });
			this.handleKeyboardEvent(event);

			button.disabled = true;

			setTimeout(() => {
				event = new KeyboardEvent('evGiveUp', { key: this.curCorrectChar() });
				this.handleKeyboardEvent(event);
				setTimeout(() => {
					event = new KeyboardEvent('evGiveUp', { key: this.curCorrectChar() });
					this.handleKeyboardEvent(event);
					button.disabled = false;
				}, 300);
			}, 300);

			if (this.status() === 2) {
				this.markAsSolved();
			}
		}
	}

	// Show user one current character
	hintClick() {
		if (!this.curStats().solvedStatus) {
			++this.curStats().hintUsages; // Statistics
			this.updateChart();
			const event = new KeyboardEvent('evHint', { key: this.curCorrectChar() });
			this.handleKeyboardEvent(event);
		}
	}

	handleBoxClick(index: number) {
		if (!this.curStats().solvedStatus) {
			const fronts = [this.firstChar, this.secondChar, this.thirdChar, this.fourthChar];
			const backs = [this.firstCharBack, this.secondCharBack, this.thirdCharBack, this.fourthCharBack];
			const event = new KeyboardEvent('ev' + index, { key: (this.updateFront ? fronts[index] : backs[index]).toLowerCase() });
			this.handleKeyboardEvent(event);
		}
	}

	private randomAlphabetChar(): string {
		return this.alphabet.charAt(Math.random() * this.alphabet.length);
	}

	// Generate 3 random characters from alphabet and random position for correct character
	private generateRandomCharacters() {
		if (this.charactersRotationIsPlayed) {
			return;
		}

		const correctChar = this.curCorrectChar().toUpperCase();
		const charsToSelectFrom = this.randCharsOrGroup(correctChar);

		this.updateFront = !this.updateFront;
		const srand = Math.floor(Math.random() * 4);
		if (this.updateFront) {
			this.firstChar = charsToSelectFrom.charAt(0);
			this.secondChar = charsToSelectFrom.charAt(1);
			this.thirdChar = charsToSelectFrom.charAt(2);
			this.fourthChar = charsToSelectFrom.charAt(3);
			if (this.correctIsNotPresent(this.firstChar, this.secondChar,
				this.thirdChar, this.fourthChar, correctChar)) {
				switch (srand) {
					case 0: this.firstChar = correctChar; break;
					case 1: this.secondChar = correctChar; break;
					case 2: this.thirdChar = correctChar; break;
					case 3: this.fourthChar = correctChar; break;
				}
			}
		} else {
			this.firstCharBack = charsToSelectFrom.charAt(0);
			this.secondCharBack = charsToSelectFrom.charAt(1);
			this.thirdCharBack = charsToSelectFrom.charAt(2);
			this.fourthCharBack = charsToSelectFrom.charAt(3);
			if (this.correctIsNotPresent(this.firstCharBack, this.secondCharBack,
				this.thirdCharBack, this.fourthCharBack, correctChar)) {
				switch (srand) {
					case 0: this.firstCharBack = correctChar; break;
					case 1: this.secondCharBack = correctChar; break;
					case 2: this.thirdCharBack = correctChar; break;
					case 3: this.fourthCharBack = correctChar; break;
				}
			}
		}

		this.animateFlip();
	}

	correctIsNotPresent(first, second, third, fourth, correct): boolean {
		return first !== correct && second !== correct && third !== correct && fourth !== correct;
	}

	randCharsOrGroup(correctChar: string): string {
		if (!this.util.isEnglishChar(correctChar))
			return this.unknownCharGroup;

		for (const arr of this.groups) {
			if (arr.indexOf(correctChar) > -1) {
				return arr;
			}
		}

		const vowelsPositions = [0, 4, 8, 14, 20, 24];
		const vowelIsGuessed = vowelsPositions.indexOf(this.alphabet.indexOf(correctChar)) !== -1;
		let firstChar, secondChar, thirdChar, fourthChar;

		do {
			firstChar = this.randomAlphabetChar();
		} while ((vowelIsGuessed ?
			!vowelsPositions.includes(this.alphabet.indexOf(firstChar)) :
			vowelsPositions.includes(this.alphabet.indexOf(firstChar))));

		do {
			secondChar = this.randomAlphabetChar();
		} while (secondChar === firstChar ||
			(vowelIsGuessed ?
				!vowelsPositions.includes(this.alphabet.indexOf(secondChar)) :
				vowelsPositions.includes(this.alphabet.indexOf(secondChar))));

		do {
			thirdChar = this.randomAlphabetChar();
		} while (thirdChar === firstChar || thirdChar === secondChar ||
			(vowelIsGuessed ?
				!vowelsPositions.includes(this.alphabet.indexOf(thirdChar)) :
				vowelsPositions.includes(this.alphabet.indexOf(thirdChar))));

		do {
			fourthChar = this.randomAlphabetChar();
		} while (fourthChar === firstChar || fourthChar === secondChar || fourthChar === thirdChar ||
			(vowelIsGuessed ?
				!vowelsPositions.includes(this.alphabet.indexOf(fourthChar)) :
				vowelsPositions.includes(this.alphabet.indexOf(fourthChar))));

		return firstChar + secondChar + thirdChar + fourthChar;
	}

	// Reset characters boxes highlighting and generate random characters
	refreshCharBoxes() {
		this.resetColors();
		this.generateRandomCharacters();
	}

	private highlightClickedCharBox(charBoxNumber: number, color: string) {
		document.getElementById('char-box-' + charBoxNumber).style.boxShadow = color;
	}

	/*
	*	0 - current word is not guessed
	*	1 - current word is guessed, current sentence is not guessed
	*	2 - current word is guessed, current sentence is guessed
	*/
	private status(): number {
		if (this.curCharsIndexes[this.curWordIndex] === this.curSentence().hiddenChars[this.curWordIndex].length) {
			if (this.curWordIndex === this.curSentence().hiddenChars.length - 1) {
				return 2;
			} else {
				return 1;
			}
		}
		return 0;
	}

	private currentIndex(): number {
		return this.curCharsIndexes.reduce((a, b) => a + b) + 1;
	}

	// Handle keyboard event from desktop and clicks on char boxes from mobiles and desktop
	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.sentenceTranslateIsPlayed || this.charactersRotationIsPlayed) {
			return;
		}
		if (this.curStats().solvedStatus) {
			if (!this.alertIsShown) {
				this.showAlert();
			}
			return;
		}

		if (event.key.toUpperCase() === this.curCorrectChar().toUpperCase()) {
			const newBox = document.createElement('span');
			newBox.innerText = this.curCorrectChar();
			if (event.type === 'evGiveUp' || event.type === 'evHint') {
				newBox.className = 'yellow';
			} else {
				++this.curStats().correctAnswers; // Statistics
				newBox.className = 'green';
			}

			const box = document.getElementById('box-' + this.currentIndex());
			box.parentNode.replaceChild(newBox, box);

			// Fill guessed character
			++this.curCharsIndexes[this.curWordIndex];

			const status = this.status();
			if (status === 1) {
				++this.curWordIndex;
			} else if (status === 2) {
				this.markAsSolved();
				return;
			}

			const redBox = document.getElementById('box-' + this.currentIndex());
			redBox.classList.remove('blue-text');
			redBox.classList.add('red-text');
			redBox.innerText = charForHiding;

			if (!this.util.isEnglishChar(this.curCorrectChar())) {
				++this.curCharsIndexes[this.curWordIndex];
				const status = this.status();
				if (status === 1) {
					++this.curWordIndex;
				} else if (status === 2) {
					this.markAsSolved();
					return;
				}
			}

			this.refreshCharBoxes();
		} else {
			++this.curStats().wrongAnswers; // Statistics

			let indexOfCharBox: number;
			switch (event.key) {
				case (this.updateFront ? this.firstChar : this.firstCharBack).toLowerCase(): {
					indexOfCharBox = 1;
					break;
				}
				case (this.updateFront ? this.secondChar : this.secondCharBack).toLowerCase(): {
					indexOfCharBox = 2;
					break;
				}
				case (this.updateFront ? this.thirdChar : this.thirdCharBack).toLowerCase(): {
					indexOfCharBox = 3;
					break;
				}
				case (this.updateFront ? this.fourthChar : this.fourthCharBack).toLowerCase(): {
					indexOfCharBox = 4;
					break;
				}
			}
			this.highlightClickedCharBox(indexOfCharBox, this.redHighlight);
		}

		this.updateChart();
	}

	async animateFlip() {
		if (this.charactersRotationIsPlayed) {
			return;
		}

		this.charactersRotationIsPlayed = true;

		await anime({
			targets: [document.querySelector('#char-box-1'),
			document.querySelector('#char-box-2'),
			document.querySelector('#char-box-3'),
			document.querySelector('#char-box-4')],
			rotateY: '+=180',
			easing: 'easeInOutSine',
			duration: 200
		}).finished;

		this.charactersRotationIsPlayed = false;
	}

	async animateSwipe(forward: boolean) {
		if (this.sentenceTranslateIsPlayed) {
			return;
		}

		this.sentenceTranslateIsPlayed = true;

		const textShownId = '#sentence-content';
		await anime({
			targets: [document.querySelector(textShownId)],
			translateX: forward ? '-=40vw' : '+=40vw',
			opacity: 0,
			easing: 'easeInOutBack',
			duration: 400
		}).finished;

		await anime({
			targets: [document.querySelector(textShownId)],
			translateX: forward ? '+=80vw' : '-=80vw',
			duration: 0
		}).finished;

		await this.getData();

		await anime({
			targets: [document.querySelector(textShownId)],
			translateX: forward ? '-=40vw' : '+=40vw',
			opacity: 1,
			easing: 'easeInOutBack',
			duration: 400
		}).finished;

		this.sentenceTranslateIsPlayed = false;
	}
}