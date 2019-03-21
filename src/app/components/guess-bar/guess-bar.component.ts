import { Component, OnInit } from '@angular/core';
import { Sentence } from 'src/app/models/sentence';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { LoadingController } from '@ionic/angular';
import { LessonsService } from 'src/app/services/lessons/lessons.service';
import { SentenceGuessPage } from 'src/app/pages/sentence-guess/sentence-guess.page';
import * as anime from 'animejs';

@Component({
	selector: 'app-guess-bar',
	templateUrl: './guess-bar.component.html',
	styleUrls: ['./guess-bar.component.scss'],
	host: {
		'(document:keypress)': 'handleKeyboardEvent($event)'
	}
})
export class GuessBarComponent implements OnInit {

	curWordIndex: number = 0; // Number of word, that user is currently at
	curCharsIndexes: number[] = []; // Number of character for each word, that user is currently at

	alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	sentenceShown: string; // Current displayed sentence

	hintIsClicked: boolean = false;
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

	// Highlights colors
	yellowHighlight = '0 0 5px 1px #E0E306';
	greenHighlight = '0 0 5px 1px #50C878';
	redHighlight = '0px 0px 8px 0px rgba(167, 1, 6, 1)';
	none = 'none';

	constructor(
		private loadingController: LoadingController,
		private util: UtilsService,
		public lessonsData: LessonsService,
		private guessPage: SentenceGuessPage) { }

	ngOnInit() {
		this.getData(true);
	}

	ionViewWillLeave() {
		this.saveData();
	}

	async getData(showLoader: boolean) {
		let loading: any;
		if (showLoader) { // Show loader if sentence is loaded first time
			loading = await this.loadingController.create({ message: 'Loading' });
			await loading.present();
		}

		if (this.curSentence().isSolved) { // Display filled sentence, if it has already been solved
			this.sentenceShown = this.curSentence().sentenceShown;
			if (showLoader) {
				loading.dismiss();
			}
		} else {
			this.hintIsClicked = false;

			// Restore user progress
			this.curWordIndex = this.curSentence().curWordIndex;
			this.curCharsIndexes = this.curSentence().curCharsIndexes;
			this.sentenceShown = this.curSentence().sentenceShown;

			this.refreshCharBoxes();
		}

		if (showLoader) {
			loading.dismiss();
		}
	}

	curSentence(): Sentence {
		return this.guessPage.curSentence();
	}

	private updateChart() {
		this.guessPage.updateChart();
	}

	private saveData() {
		this.curSentence().curWordIndex = this.curWordIndex;
		this.curSentence().curCharsIndexes = this.curCharsIndexes;
		this.curSentence().sentenceShown = this.sentenceShown;
	}

	// Get current character to be filled
	private curCorrectChar(): string {
		return this.curSentence().hiddenChars[this.curWordIndex][this.curCharsIndexes[this.curWordIndex]];
	}

	// Remove characters boxes highlighting
	private resetColors() {
		const boxesIDs = ['first-char-box', 'second-char-box', 'third-char-box', 'fourth-char-box'];
		for (const id of boxesIDs) {
			document.getElementById(id).style.boxShadow = 'none';
		}
	}

	// Go to following sentence of the lesson
	nextSentenceClick() {
		if (this.sentenceTranslateIsPlayed) {
			return;
		}

		this.saveData();

		this.guessPage.saveStatistics(this.curSentence());

		this.guessPage.sentenceIndex = this.guessPage.sentenceIndex ===
			this.lessonsData.getLessonByID(this.guessPage.lessonId).sentences.length
			? 1
			: this.guessPage.sentenceIndex + 1;

		this.curWordIndex = 0;
		this.curCharsIndexes = [];

		this.animateSwipe();
		this.updateChart();

		if (!this.curSentence().isSolved) {
			++this.curSentence().statistics.sentenceSkips; // Statistics
		}
	}

	// Give up and show full sentence
	giveUpClick() {
		if (!this.curSentence().isSolved) {
			++this.curSentence().statistics.giveUps; // Statistics

			do {
				do {
					this.sentenceShown = this.util.addChar(this.sentenceShown,
						'<span class=\'yellow\'>' + this.curCorrectChar() + '</span>');
					if (this.curCharsIndexes[this.curWordIndex] !==
						this.curSentence().hiddenChars[this.curWordIndex].length - 1 ||
						this.curWordIndex !== this.curSentence().hiddenChars.length - 1) {
						this.sentenceShown = this.util.addChar(this.sentenceShown, '?');
					}
					++this.curCharsIndexes[this.curWordIndex];
				} while (this.curCharsIndexes[this.curWordIndex] <
					this.curSentence().hiddenChars[this.curWordIndex].length);
				++this.curWordIndex;
			} while (this.curWordIndex < this.curSentence().hiddenChars.length);

			this.updateChart();
			this.resetColors();
			this.curSentence().isSolved = true;
		}
	}

	// Show user one current character
	hintClick() {
		if (!this.curSentence().isSolved && !this.hintIsClicked) {
			++this.curSentence().statistics.hintUsages; // Statistics
			this.updateChart();

			if (this.curCorrectChar().toUpperCase() === (this.updateFront ? this.firstChar : this.firstCharBack)) {
				this.highlightClickedCharBox(1, this.yellowHighlight);
			} else if (this.curCorrectChar().toUpperCase() === (this.updateFront ? this.secondChar : this.secondCharBack)) {
				this.highlightClickedCharBox(2, this.yellowHighlight);
			} else if (this.curCorrectChar().toUpperCase() === (this.updateFront ? this.thirdChar : this.thirdCharBack)) {
				this.highlightClickedCharBox(3, this.yellowHighlight);
			} else {
				this.highlightClickedCharBox(4, this.yellowHighlight);
			}
			this.hintIsClicked = true;
		}
	}

	firstCharBoxClick() {
		const event = new KeyboardEvent('ev1', { key: (this.updateFront ? this.firstChar : this.firstCharBack).toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	secondCharBoxClick() {
		const event = new KeyboardEvent('ev2', { key: (this.updateFront ? this.secondChar : this.secondCharBack).toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	thirdCharBoxClick() {
		const event = new KeyboardEvent('ev3', { key: (this.updateFront ? this.thirdChar : this.thirdCharBack).toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	fourthCharBoxClick() {
		const event = new KeyboardEvent('ev4', { key: (this.updateFront ? this.fourthChar : this.fourthCharBack).toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	// Save user progress and leave lesson
	leaveLessonClick() {
		if (this.curSentence().text !== this.sentenceShown) {
			++this.curSentence().statistics.lessonLeaves; // Statistics
		}
	}

	private randomAlphabetIndex(): number {
		return Math.floor(Math.random() * this.alphabet.length);
	}

	// Generate 3 random characters from alphabet and random position for correct character
	private generateRandomCharacters() {
		if (this.charactersRotationIsPlayed) {
			return;
		}

		const correctCharBoxIndex = Math.floor(Math.random() * 4) + 1;
		const correctChar = this.curCorrectChar().toUpperCase();
		const correctCharIndexInAlphabet = this.alphabet.indexOf(correctChar);
		const vowelsPositions = [0, 4, 8, 14, 20, 24];
		let firstRand: number, secondRand: number, thirdRand: number, fourthRand: number;
		const vowelIsGuessed: boolean = vowelsPositions.indexOf(correctCharIndexInAlphabet) !== -1;

		this.updateFront = !this.updateFront;

		do {
			firstRand = this.randomAlphabetIndex();
		} while (firstRand === correctCharIndexInAlphabet || (vowelIsGuessed ? false : vowelsPositions.indexOf(firstRand) !== -1));

		do {
			secondRand = this.randomAlphabetIndex();
		} while (secondRand === firstRand || secondRand === correctCharIndexInAlphabet ||
			(vowelIsGuessed ? false : vowelsPositions.indexOf(secondRand) !== -1));

		do {
			thirdRand = this.randomAlphabetIndex();
		} while (thirdRand === firstRand || thirdRand === secondRand || thirdRand === correctCharIndexInAlphabet ||
			(vowelIsGuessed ? false : vowelsPositions.indexOf(thirdRand) !== -1));

		do {
			fourthRand = this.randomAlphabetIndex();
		} while (fourthRand === firstRand || fourthRand === secondRand || fourthRand === thirdRand ||
		fourthRand === correctCharIndexInAlphabet || (vowelIsGuessed ? false : vowelsPositions.indexOf(fourthRand) !== -1));

		if (this.updateFront) {
			this.firstChar = correctCharBoxIndex === 1 ? correctChar : this.alphabet[firstRand];
			this.secondChar = correctCharBoxIndex === 2 ? correctChar : this.alphabet[secondRand];
			this.thirdChar = correctCharBoxIndex === 3 ? correctChar : this.alphabet[thirdRand];
			this.fourthChar = correctCharBoxIndex === 4 ? correctChar : this.alphabet[fourthRand];
		} else {
			this.firstCharBack = correctCharBoxIndex === 1 ? correctChar : this.alphabet[firstRand];
			this.secondCharBack = correctCharBoxIndex === 2 ? correctChar : this.alphabet[secondRand];
			this.thirdCharBack = correctCharBoxIndex === 3 ? correctChar : this.alphabet[thirdRand];
			this.fourthCharBack = correctCharBoxIndex === 4 ? correctChar : this.alphabet[fourthRand];
		}

		this.animateFlip();
	}

	// Reset characters boxes highlighting and generate random characters
	refreshCharBoxes() {
		this.resetColors();
		this.generateRandomCharacters();
	}

	private highlightClickedCharBox(charBoxNumber: number, color: string) {
		let charBoxId: string;
		if (charBoxNumber === 1) { charBoxId = 'first-char-box'; }
		else if (charBoxNumber === 2) { charBoxId = 'second-char-box'; }
		else if (charBoxNumber === 3) { charBoxId = 'third-char-box'; }
		else if (charBoxNumber === 4) { charBoxId = 'fourth-char-box'; }
		else { return; }
		document.getElementById(charBoxId).style.boxShadow = color;
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

	// Handle keyboard event from desktop and clicks on char boxes from mobiles and desktop
	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.sentenceTranslateIsPlayed || this.charactersRotationIsPlayed) {
			return;
		}
		if (this.curSentence().isSolved) {
			if (!this.guessPage.toastIsShown) {
				this.guessPage.showToast();
			}
			return;
		}

		if (event.key.toUpperCase() === this.curCorrectChar().toUpperCase()) {
			++this.curSentence().statistics.correctAnswers; // Statistics

			let spanColor = '<span class=\'green\'>';

			if (this.hintIsClicked) {
				this.hintIsClicked = false;
				spanColor = '<span class=\'yellow\'>';
			}

			// Fill guessed character
			this.sentenceShown = this.util.addChar(this.sentenceShown, spanColor + this.curCorrectChar() + '</span>');
			++this.curCharsIndexes[this.curWordIndex];

			const status = this.status();
			if (status === 1) {
				++this.curWordIndex;
			} else if (status === 2) {
				this.curSentence().isSolved = true;
				return;
			}

			this.sentenceShown = this.util.addChar(this.sentenceShown, '?');

			this.refreshCharBoxes();
		} else {
			++this.curSentence().statistics.wrongAnswers; // Statistics

			switch (event.key) {
				case (this.updateFront ? this.firstChar : this.firstCharBack).toLowerCase(): {
					this.highlightClickedCharBox(1, this.redHighlight);
					break;
				}
				case (this.updateFront ? this.secondChar : this.secondCharBack).toLowerCase(): {
					this.highlightClickedCharBox(2, this.redHighlight);
					break;
				}
				case (this.updateFront ? this.thirdChar : this.thirdCharBack).toLowerCase(): {
					this.highlightClickedCharBox(3, this.redHighlight);
					break;
				}
				case (this.updateFront ? this.fourthChar : this.fourthCharBack).toLowerCase(): {
					this.highlightClickedCharBox(4, this.redHighlight);
					break;
				}
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
			targets: [document.querySelector('#first-char-box'),
			document.querySelector('#second-char-box'),
			document.querySelector('#third-char-box'),
			document.querySelector('#fourth-char-box')],
			rotateY: '+=180',
			easing: 'easeInOutSine',
			duration: 300
		}).finished;

		this.charactersRotationIsPlayed = false;
	}

	async animateSwipe() {
		if (this.sentenceTranslateIsPlayed) {
			return;
		}

		this.sentenceTranslateIsPlayed = true;

		const textShownId = '#sentence-to-show';
		await anime({
			targets: [document.querySelector(textShownId)],
			translateX: '+=105vw',
			easing: 'easeInOutCirc',
			duration: 300
		}).finished;

		await this.getData(false);

		await anime({
			targets: [document.querySelector(textShownId)],
			translateX: '-=105vw',
			easing: 'easeInOutCirc',
			duration: 300
		}).finished;

		this.sentenceTranslateIsPlayed = false;
	}
}
