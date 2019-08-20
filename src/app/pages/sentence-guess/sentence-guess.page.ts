import { UtilsService } from 'src/app/services/utils/utils.service';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { Sentence } from 'src/app/models/sentence';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Chart } from 'chart.js';
import { Statistics } from 'src/app/models/statistics';
import { Location } from '@angular/common';
import { StatisticHttpService } from 'src/app/services/http/statistics/statistic-http.service';
import { Globals, ProgressedWord } from 'src/app/services/globals/globals';
import { StorageService } from 'src/app/services/storage/storage.service';
import * as _ from 'lodash';
import anime from 'animejs/lib/anime.es';

interface SentenceWord {
	index: number;
	allCharacters: any;
	guessChar: string;
	isActive: boolean;
	fullWord: string;
}

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

	lessonId: number = 0;
	parentId: number = 0;
	sentenceId: number;

	sentenceNumber: number;
	sentencesTotal: number;

	sentenceWords: SentenceWord[] = [];
	curWordIndex: number;
	isSolved: boolean = false;

	statisticsDeltasArray: Array<[number, number, number, number]> = [];
	hintsClicks: number = 0;

	alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	edgeCharacters: string[] = [' ', '.', '!', '?', ',', '\n', '\r'];

	updateFront: boolean = false;

	sentenceTranslateIsPlayed: boolean = false;
	charactersRotationIsPlayed: boolean = false;

	charsRefs = ['', '', '', '', '', '', '', ''];

	buttonsHighlights: boolean[] = [false, false, false, false];
	redHighlight = '0px 0px 0px 2px rgb(255, 10, 18)';

	groups = ['QWSD', 'RTFG', 'EAIO'];
	unknownCharGroup = '!@#&';

	constructor(private route: ActivatedRoute,
		private alertController: AlertController,
		public lessonsDataService: LessonsDataService,
		private utils: UtilsService,
		private statisticHttpService: StatisticHttpService,
		private location: Location,
		private navController: NavController,
		private globals: Globals,
		private storage: StorageService,
		private cdRef: ChangeDetectorRef) { }

	async ngOnInit() {
		this.sentenceId = Number(this.route.snapshot.queryParamMap.get('current'));
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));
		this.parentId = Number(this.route.snapshot.queryParamMap.get('parentId'));

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
				this.globals.userId
			);

			await this.statisticHttpService.postNewStatisticsRecord(
				this.lessonId,
				this.sentenceId
			);
		}
	}

	private getData() {
		this.pieChart = new Chart(this.pieCanvas.nativeElement, this.utils.getNewChartObject());

		this.sentenceNumber = this.lessonsDataService.getSentenceNumberByIds(this.lessonId, this.sentenceId) + 1;
		this.sentencesTotal = this.lessonsDataService.getLessonById(this.lessonId).sentences.length;
		this.isSolved = false;

		const stats = this.curStats();
		this.statisticsDeltasArray.push([
			this.curSentence().id,
			stats.wrongAnswers,
			stats.hintUsages + stats.giveUps,
			stats.correctAnswers
		]);

		const sentence = this.curSentence();
		const sentenceLength = sentence.text.length;
		let prevIndex: number = 0, i = 0, activeIsSet = false;

		for (const word of sentence.words) {
			let endIndex: number = sentence.words[i][0],
				startIndex: number = sentence.words[i][0],
				curChar: string;

			do {
				startIndex--;
				curChar = sentence.text.charAt(startIndex);
			} while (this.edgeCharacters.indexOf(curChar) === -1 && startIndex > 0);

			do {
				endIndex++;
				curChar = sentence.text.charAt(endIndex);
			} while (this.edgeCharacters.indexOf(curChar) === -1 && endIndex < sentenceLength);

			const fullWord = sentence.text.substring(startIndex + 1, endIndex);
			const allCharacters = sentence.hiddenChars[i];

			const progressedWord = this.curProgressedWord(allCharacters, fullWord);
			let isActive = false, index = 0;
			if (progressedWord) {
				index = progressedWord.index;
				if (!activeIsSet && progressedWord.index !== allCharacters.length) {
					activeIsSet = true;
					isActive = true;
					this.curWordIndex = i;
				}
			} else if (!activeIsSet) {
				activeIsSet = true;
				isActive = true;
				this.curWordIndex = i;
			}
			this.sentenceWords.push({
				index: index,
				allCharacters: allCharacters,
				guessChar: null,
				isActive: isActive,
				fullWord: fullWord
			});
			this.cdRef.detectChanges();
			document.getElementById('word' + i).insertAdjacentText(
				'beforebegin',
				sentence.text.substring(prevIndex, word[0])
			);
			prevIndex = word[0] + word[1];
			++i;
		}
		document.getElementById('word' + (i - 1)).insertAdjacentText(
			'afterend',
			sentence.text.substring(prevIndex, sentence.text.length)
		);

		if (activeIsSet) {
			this.refreshCharBoxes();
		} else {
			this.isSolved = true;
		}
		this.hideBottomControls();
		this.updateChart();
	}

	removeAllTextNodes(node) {
		if (node.nodeType === 3) {
			node.parentNode.removeChild(node);
		} else if (node.childNodes) {
			for (let i = node.childNodes.length; i--;) {
				this.removeAllTextNodes(node.childNodes[i]);
			}
		}
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
		this.saveStatistics();
	}

	ionViewWillLeave() {
		this.saveData();
	}

	async showAlert() {
		const stats = this.curStats();
		const savedStats = this.statisticsDeltasArray.find(elem => elem[0] === this.curSentence().id);
		const greenDelta = stats.correctAnswers - savedStats[3];
		const yellowDelta = stats.giveUps + stats.hintUsages - savedStats[2];
		const redDelta = stats.wrongAnswers - savedStats[1];
		if (greenDelta + yellowDelta + redDelta !== 0) {
			await this.alertController.create({
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
			}).then(alert => alert.present());
		}
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

	makeActive(index: number) {
		if (!this.isSolved) {
			const curWord = this.sentenceWords[index];
			const progressedWord = this.curProgressedWord(curWord.allCharacters, curWord.fullWord);
			if (!progressedWord || progressedWord.index !== curWord.allCharacters.length) {
				for (let word of this.sentenceWords) {
					if (word.isActive) {
						word.guessChar = null;
						word.isActive = false;
					}
				}
				this.sentenceWords[index].isActive = true;
				this.curWordIndex = index;
				this.refreshCharBoxes();
			}
		}
	}

	giveUpClick() {
		if (!this.isSolved) {
			this.curStats().giveUps += 3;
			this.hintsClicks += 3;

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
		}
	}

	hintClick() {
		if (!this.isSolved) {
			this.curStats().hintUsages++;
			this.hintsClicks++;
			this.handleKeyboardEvent(this.correctCharEvent());
		}
	}

	handleBoxClick(index: number) {
		if (!this.isSolved) {
			const event = new KeyboardEvent('ev' + index, {
				key: (this.updateFront ? this.charsRefs[index] : this.charsRefs[index + 4]).toLowerCase()
			});
			this.handleKeyboardEvent(event);
		}
	}

	updateProgress(progress: string) {
		const curWord = this.sentenceWords[this.curWordIndex];
		const progressedWord = this.curProgressedWord(curWord.allCharacters, curWord.fullWord);

		if (progress === 'correct_guess') {
			this.hintsClicks > 0 ? this.hintsClicks-- : this.curStats().correctAnswers++;
			if (progressedWord) {
				progressedWord.index++;
			} else {
				this.globals.progressedWords.push({
					fullWord: curWord.fullWord,
					characters: curWord.allCharacters,
					index: 1
				});
			}
			this.refreshCharBoxes();
		} else if (progress === 'full_guess') {
			this.hintsClicks > 0 ? this.hintsClicks-- : this.curStats().correctAnswers++;
			this.sentenceWords[this.curWordIndex].guessChar = null;
			if (progressedWord) {
				progressedWord.index++;
			} else {
				this.globals.progressedWords.push({
					fullWord: curWord.fullWord,
					characters: curWord.allCharacters,
					index: 1
				});
			}

			let sentenceIsGuessed: boolean = false;

			const globalsProgressedWords = this.globals.progressedWords
				.filter(word => this.sentenceWords
					.findIndex(sentenceWord => sentenceWord.fullWord === word.fullWord &&
						_.isEqual(sentenceWord.allCharacters, word.characters)) > -1);

			if (globalsProgressedWords.length === this.sentenceWords.length) {
				let counter = 0;

				for (const word of globalsProgressedWords) {
					if (word.index === word.characters.length) {
						counter++;
					}
				}
				if (counter === this.sentenceWords.length) {
					sentenceIsGuessed = true;
				}
			}

			if (!sentenceIsGuessed) {
				do {
					this.curWordIndex++;
					if (this.curWordIndex >= this.sentenceWords.length) {
						this.curWordIndex = 0;
					}
				} while (this.sentenceWords[this.curWordIndex].index ===
					this.sentenceWords[this.curWordIndex].allCharacters.length);
				this.makeActive(this.curWordIndex);
				this.refreshCharBoxes();
			} else {
				this.sentenceWords[this.curWordIndex].isActive = false;
				this.isSolved = true;
				this.hideBottomControls();
				this.showAlert();
			}
		} else {
			this.curStats().wrongAnswers++;
			this.setRedHighlight(progress.toUpperCase());
		}

		this.updateChart();
	}

	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.isSolved || this.sentenceTranslateIsPlayed || this.charactersRotationIsPlayed) {
			return;
		}
		const activeWord = this.sentenceWords.find(word => word.isActive);
		activeWord.guessChar = event.key;
		this.cdRef.detectChanges();  // This will cause word-view component redraw,
		activeWord.guessChar = null; // if word has equal sequenced characters 
	}

	private correctCharEvent(): KeyboardEvent {
		return new KeyboardEvent('evHint', { key: this.curCorrectChar() });
	}

	private randomAlphabetChar(): string {
		return this.alphabet.charAt(Math.random() * this.alphabet.length);
	}

	private curCorrectChar(): string {
		const curWord = this.sentenceWords[this.curWordIndex];
		const progressedWord = this.curProgressedWord(curWord.allCharacters, curWord.fullWord);
		if (progressedWord) {
			return progressedWord.characters[progressedWord.index];
		}
		return curWord.allCharacters[0];
	}

	private curProgressedWord(allCharacters: string[], fullWord: string): ProgressedWord {
		return this.globals.progressedWords.find(word =>
			word.fullWord === fullWord && _.isEqual(word.characters, allCharacters));
	}

	private generateRandomCharacters() {
		if (this.charactersRotationIsPlayed) {
			return;
		}

		const correctChar = this.curCorrectChar().toUpperCase();
		const charsToSelectFrom = this.randCharsOrGroup(correctChar);

		this.updateFront = !this.updateFront;
		const srand = Math.floor(Math.random() * 4);

		this.charsRefs[this.updateFront ? 0 : 4] = charsToSelectFrom.charAt(0);
		this.charsRefs[this.updateFront ? 1 : 5] = charsToSelectFrom.charAt(1);
		this.charsRefs[this.updateFront ? 2 : 6] = charsToSelectFrom.charAt(2);
		this.charsRefs[this.updateFront ? 3 : 7] = charsToSelectFrom.charAt(3);
		if (this.correctIsNotPresent(
			this.charsRefs[this.updateFront ? 0 : 4],
			this.charsRefs[this.updateFront ? 1 : 5],
			this.charsRefs[this.updateFront ? 2 : 6],
			this.charsRefs[this.updateFront ? 3 : 7], correctChar)) {
			this.charsRefs[this.updateFront ? srand : srand + 4] = correctChar;
		}

		this.animateFlip();
	}

	correctIsNotPresent(first, second, third, fourth, correct): boolean {
		return first !== correct && second !== correct && third !== correct && fourth !== correct;
	}

	randCharsOrGroup(correctChar: string): string {
		if (!this.utils.isEnglishChar(correctChar)) {
			return this.unknownCharGroup;
		}

		for (const arr of this.groups) {
			if (arr.indexOf(correctChar) > -1) {
				return arr;
			}
		}

		const vowelsPositions = [0, 4, 8, 14, 20, 24];
		const vowelIsGuessed = vowelsPositions.indexOf(this.alphabet.indexOf(correctChar)) !== -1;
		let firstChar: string, secondChar: string, thirdChar: string, fourthChar: string;

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

	refreshCharBoxes() {
		const boxesIds = ['char-box-1', 'char-box-2', 'char-box-3', 'char-box-4'];
		for (const id of boxesIds) {
			document.getElementById(id).style.boxShadow = 'none';
		}
		this.generateRandomCharacters();
	}

	setRedHighlight(char: string) {
		for (let i = 0; i < 4; i++) {
			if (char === (this.updateFront ? this.charsRefs[i] : this.charsRefs[i + 4])) {
				this.buttonsHighlights[i] = true;
				this.cdRef.detectChanges();
				return;
			}
		}
	}

	async animateFlip() {
		if (this.charactersRotationIsPlayed) {
			return;
		}

		this.charactersRotationIsPlayed = true;

		this.buttonsHighlights = [false, false, false, false];
		this.cdRef.detectChanges();

		await anime({
			targets: [
				document.querySelector('#char-box-1'),
				document.querySelector('#char-box-2'),
				document.querySelector('#char-box-3'),
				document.querySelector('#char-box-4')
			],
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
		], footer = document.getElementById('footer').style;
		if (this.isSolved) {
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

		const textShown = document.querySelector('#sentence-content');
		await anime({
			targets: [textShown],
			translateX: forward ? '-=40vw' : '+=40vw',
			opacity: 0,
			easing: 'easeInOutBack',
			duration: 400
		}).finished;

		await anime({
			targets: [textShown],
			translateX: forward ? '+=80vw' : '-=80vw',
			duration: 0
		}).finished;

		this.sentenceWords = [];
		this.cdRef.detectChanges();
		this.removeAllTextNodes(document.getElementById('sentence-content'));
		await this.getData();

		this.hideBottomControls();

		await anime({
			targets: [textShown],
			translateX: forward ? '-=40vw' : '+=40vw',
			opacity: 1,
			easing: 'easeInOutBack',
			duration: 400
		}).finished;

		this.sentenceTranslateIsPlayed = false;
	}
}