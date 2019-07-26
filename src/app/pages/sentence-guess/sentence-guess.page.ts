import { UtilsService } from 'src/app/services/utils/utils.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { Sentence } from 'src/app/models/sentence';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import { Statistics } from 'src/app/models/statistics';
import * as anime from 'animejs';
import { Location } from '@angular/common';
import { StatisticHttpService } from 'src/app/services/http/statistics/statistic-http.service';
import { Globals } from 'src/app/services/globals/globals';
import { Storage } from '@ionic/storage';

@Component({
	selector: 'app-sentence-guess',
	templateUrl: './sentence-guess.page.html',
	styleUrls: ['./sentence-guess.page.scss'],
	host: {
		'(document:keypress)': 'handleKeyboardEvent($event)'
	}
})

export class SentenceGuessPage implements OnInit {

	@ViewChild('pieCanvas', { static: false }) pieCanvas;
	pieChart: any;

	alertIsShown: boolean;
	lessonId: number = 0;
	parentId: number = 0;
	sentenceId: number;

	sentenceNumber: number;
	sentencesTotal: number;

	curWordIndex: number = 0;
	curCharsIndexes: number[] = [];

	statisticsDeltasArray: Array<[number, number, number, number]> = [];

	alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	updateFront: boolean = false;

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

	yellowHighlight = '0 0 5px 1px #E0E306';
	redHighlight = '0px 0px 8px 0px rgba(167, 1, 6, 1)';

	groups = ['QWSD', 'RTFG', 'EAIO'];
	unknownCharGroup = '!@#&';

	constructor(private route: ActivatedRoute,
		private alertController: AlertController,
		public lessonsDataService: LessonsDataService,
		private utils: UtilsService,
		private statisticHttpService: StatisticHttpService,
		private location: Location,
		private navController: NavController,
		private storage: Storage,
		private globals: Globals) { }

	async ngOnInit() {
		this.sentenceId = Number(this.route.snapshot.queryParamMap.get('current'));
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));
		this.parentId = Number(this.route.snapshot.queryParamMap.get('parentId'));

		this.sentenceContent = document.getElementById('sentence-content');

		if (!this.lessonsDataService.lessons.length) {
			await this.lessonsDataService.refreshLessons();
			await this.lessonsDataService.getSentencesByLessonId(this.lessonId, this.parentId);
		}

		await this.createAndPostStatisticsIfNotExists();

		this.getData();
	}

	async createAndPostStatisticsIfNotExists() {
		if (!this.curStats()) {
			this.lessonsDataService.createNewStatisticRecord(
				this.sentenceId,
				this.lessonId,
				this.globals.userId,
				this.lessonsDataService.getSentenceByIds(this.lessonId, this.sentenceId).words
			);
			await this.statisticHttpService.postNewStatisticsRecord(
				this.lessonId,
				this.sentenceId
			);
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

		this.sentenceNumber = this.lessonsDataService.getSentenceNumberByIds(this.lessonId, this.sentenceId) + 1;
		this.sentencesTotal = this.lessonsDataService.getLessonById(this.lessonId).sentences.length;

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

		if (this.curStats().solvedStatus) {
			const span = this.createSpan(false);
			span.innerText = this.curSentence().text;
			this.sentenceContent.appendChild(span);
			this.hideBottomControls();
		} else {
			this.curWordIndex = this.curStats().curWordIndex;
			this.curCharsIndexes = this.curStats().curCharsIndexes;
			this.restoreSentence();
		}
	}

	restoreSentence() {
		const templates = this.globals.savedTemplates.find(elem => elem[0] === this.curSentence().id);
		if (templates) {
			for (let template of templates[1]) {
				this.sentenceContent.appendChild(template);
			}
		} else {
			const underscored = this.curSentence().textUnderscored;
			let previousIndex = 0, index = 1, span;
			for (let i = 0; i < underscored.length; i++) {
				if (underscored.charAt(i) === this.globals.charForHiding) {
					span = this.createSpan(false);
					span.innerText = this.curSentence().textUnderscored.substring(previousIndex, i);
					this.sentenceContent.appendChild(span);

					previousIndex = i;

					do {
						++i;
						span = this.createSpan(true, index++);
						span.classList.add('blue-text');
						span.innerText = this.globals.charForHiding;
						this.sentenceContent.appendChild(span);
						previousIndex = i;
					} while (underscored.charAt(i) === this.globals.charForHiding && i < underscored.length);
				}
			}

			if (this.curSentence().textUnderscored.charAt(previousIndex) !== this.globals.charForHiding) {
				span = this.createSpan(false);
				span.innerText = this.curSentence().textUnderscored.substring(previousIndex);
				this.sentenceContent.appendChild(span);
			}
			const firstBox = document.getElementById('box-1');
			firstBox.classList.remove('blue-text');
			firstBox.classList.add('red-text');
			firstBox.innerText = this.globals.charForHiding;
		}

		this.refreshCharBoxes();
	}

	curSentence(): Sentence {
		const lessonSentences = this.lessonsDataService.getLessonById(this.lessonId).sentences;
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
			chartColors[0] = this.globals.chartsColors[0];
			chartColors[1] = this.globals.chartsColors[1];
			chartColors[2] = this.globals.chartsColors[2];
		}

		this.pieChart.update();
	}

	saveStatistics() {
		const stats = this.curStats();
		if (this.globals.getIsDemo()) {
			this.storage.set('sentence-' + this.curSentence().id, stats.correctAnswers +
				'|' + stats.wrongAnswers + '|' + stats.giveUps + '|' + stats.hintUsages);
		} else {
			this.statisticHttpService
				.updateStatisticsOfSentence({
					sentenceId: this.curSentence().id,
					correctAnswers: stats.correctAnswers,
					wrongAnswers: stats.wrongAnswers,
					giveUps: stats.giveUps,
					hintUsages: stats.hintUsages
				});
		}

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
		this.navController.navigateBack(['sentences-list'], {
			queryParams: {
				lessonId: this.lessonId,
				parentId: this.parentId
			}
		});
	}

	saveData() {
		this.curStats().curWordIndex = this.curWordIndex;
		this.curStats().curCharsIndexes = this.curCharsIndexes;

		const elements = [];
		const id = this.curSentence().id;
		this.sentenceContent.childNodes.forEach(node => elements.push(<HTMLElement>(node)));
		const indexOfExisting = this.globals.savedTemplates.findIndex(elem => elem[0] === id);
		indexOfExisting === -1 ?
			this.globals.savedTemplates.push([id, elements]) :
			this.globals.savedTemplates[indexOfExisting] = [id, elements];

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
				message: '<p class="green-text">Green: +' + greenDelta +
					'</p><p class="yellow-text">Yellow: +' + yellowDelta +
					'</p><p class="red-text">Red: +' + redDelta + '</p>',
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

	changeSentence(forward: boolean) {
		if (this.sentenceTranslateIsPlayed) {
			return;
		}

		this.saveData();

		const lessonSentences = this.lessonsDataService.getLessonById(this.lessonId).sentences;
		const currentLessonIndex = this.lessonsDataService.getSentenceNumberByIds(this.lessonId, this.sentenceId);
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
		this.sentenceNumber = this.lessonsDataService.getSentenceNumberByIds(this.lessonId, this.sentenceId) + 1;

		// Change url parameter displaying current sentence
		let path = this.location.path();
		path = path.replace(path.substring(path.indexOf('current'),
			path.indexOf('&')), 'current=' + this.curSentence().id);
		this.location.go(path);

		this.createAndPostStatisticsIfNotExists().then(() => {
			if (this.statisticsDeltasArray.findIndex(elem => elem[0] === this.curSentence().id) === -1) {
				const stats = this.curStats();
				this.statisticsDeltasArray.push([
					this.curSentence().id,
					stats.wrongAnswers,
					stats.hintUsages + stats.giveUps,
					stats.correctAnswers
				]);
			}
		});
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

			let event = this.correctCharEvent();
			this.handleKeyboardEvent(event);

			button.disabled = true;

			setTimeout(() => {
				event = this.correctCharEvent();
				this.handleKeyboardEvent(event);
				setTimeout(() => {
					event = this.correctCharEvent();
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
			const event = this.correctCharEvent();
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

	private correctCharEvent(): KeyboardEvent {
		return new KeyboardEvent('evHint', { key: this.curCorrectChar() });
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
		if (!this.utils.isEnglishChar(correctChar))
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
		const boxesIds = ['char-box-1', 'char-box-2', 'char-box-3', 'char-box-4'];
		for (const id of boxesIds) {
			document.getElementById(id).style.boxShadow = 'none';
		}
		this.generateRandomCharacters();
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
			redBox.innerText = this.globals.charForHiding;

			if (!this.utils.isEnglishChar(this.curCorrectChar())) {
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

			let indexOfCharBox: number = 0;
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
			if (indexOfCharBox !== 0) {
				document.getElementById('char-box-' + indexOfCharBox).style.boxShadow = this.redHighlight;
			}
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

	hideBottomControls() {
		const targets = [
			document.querySelector('#chars'),
			document.querySelector('#hint-button'),
			document.querySelector('#give-up-button')
		];
		const footer = document.getElementById('footer').style;
		if (this.curStats().solvedStatus) {
			footer.background = 'var(--ion-background-color)';
			anime({
				targets: targets,
				opacity: 0,
				easing: 'easeInOutBack',
				duration: 400
			});
		} else {
			footer.background = '#FFF';
			anime({
				targets: targets,
				opacity: 1,
				easing: 'easeInOutBack',
				duration: 400
			});
		}
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

		this.hideBottomControls();

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