import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UtilsService } from '../../services/utils/utils.service';
import { ToastController } from '@ionic/angular';
import { Sentence } from 'src/app/models/sentence';
import { LessonsService } from "src/app/services/lessons-data/lessons-data.service";
import * as anime from 'animejs';

@Component({
	selector: 'app-sentence-guess',
	templateUrl: './sentence-guess.page.html',
	styleUrls: ['./sentence-guess.page.scss'],
	host: {
		'(document:keypress)': 'handleKeyboardEvent($event)'
	}
})

export class SentenceGuessPage implements OnInit {

	curWordIndex: number = 0; // Number of word, that user is currently at
	curCharsIndexes: number[] = []; // Number of character for each word, that user is currently at
	lessonId: number = 0; // Id of current lesson
	sentenceIndex: number = 1; // Number of current sentence in lesson
	alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	sentenceShown: string; // Current displayed sentence

	private toastIsShown: boolean; // Single toast flag
	private hintIsClicked: boolean = false;
	displayButtons: boolean = true;
	updateFront: boolean = false;

	// 3 random characters with one correct one
	firstChar: string;
	secondChar: string;
	thirdChar: string;
	fourthChar: string;

	firstCharBack: string;
	secondCharBack: string;
	thirdCharBack: string;
	fourthCharBack: string;

	constructor(private route: ActivatedRoute,
		private loadingController: LoadingController,
		private util: UtilsService,
		private toastController: ToastController,
		public lessonsData: LessonsService) { }

	// Get number of sentence and id of the lesson from previous page
	ngOnInit() {
		this.sentenceIndex = Number(this.route.snapshot.queryParamMap.get('current')) + 1;
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lesson'));
		this.getData(true);
	};

	// TODO: change statistics manipulation
	logStat() {
		console.log(this.curSentence().statistics);
	}

	animateFlip() {
		anime({
			targets: [document.querySelector("#first-char-box"),
			document.querySelector("#second-char-box"),
			document.querySelector("#third-char-box"),
			document.querySelector("#fourth-char-box")],
			rotateY: { value: '+=180', delay: 0 },
			easing: 'easeInOutSine',
			duration: 500
		});
	}

	// Get current Sentence object from service
	private curSentence(): Sentence {
		return this.lessonsData.getLessonByID(this.lessonId).sentences[this.sentenceIndex - 1];
	}

	// Get current character, to be filled
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

	private async getData(showLoader: boolean) {
		let loading: any;
		if (showLoader) { // Show loader if sentence is loaded first time
			loading = await this.loadingController.create({ message: 'Loading' });
			await loading.present();
		}

		if (this.curSentence().isSolved) { // Display filled sentence, if it has already been solved
			this.showHideControls(false);
			this.sentenceShown = this.curSentence().text;
			if (showLoader) {
				loading.dismiss();
			}
			return;
		}

		this.makeHintButtonActive();
		this.showHideControls(true);

		// Restore user progress
		this.curWordIndex = this.curSentence().curWordIndex;
		this.curCharsIndexes = this.curSentence().curCharsIndexes;

		this.sentenceShown = this.curSentence().textUnderscored;

		if (this.curCharsIndexes.length === 0) { // If user has no progress -> set current characters indexes to zeroes
			for (let i in this.curSentence().hiddenChars) {
				this.curCharsIndexes.push(0);
			}
		} else { // Else restore sentence guessed words
			for (let i in this.curCharsIndexes) {
				for (let j = 0; j < this.curCharsIndexes[i]; j++) {
					this.sentenceShown = this.util.addCharByIndex(
						this.sentenceShown,
						this.curSentence().hiddenChars[i][j],
						this.curSentence().hiddenWord[i][0] + j);
				}
			}
		}

		this.sentenceShown = this.util.addCharByIndex(
			this.sentenceShown,
			'?',
			this.curSentence().hiddenWord[this.curWordIndex][0] + this.curCharsIndexes[this.curWordIndex]);

		this.refreshCharBoxes();

		if (showLoader) {
			loading.dismiss();
		}
	}

	// Go to following unfilled word
	nextWordClick() {
		this.nextOrPreviousWordsHandle(true);
	}

	// Go to first previous unfilled word
	previousWordClick() {
		this.nextOrPreviousWordsHandle(false);
	}

	nextOrPreviousWordsHandle(isNext: boolean) {
		if (!this.curSentence().isSolved && (isNext ?
			this.curWordIndex < this.curSentence().hiddenChars.length - 1 :
			this.curWordIndex > 0)) {
			const savedNum = this.curWordIndex; // Save current word number in case switching cannot be done
			do {
				isNext ? ++this.curWordIndex : --this.curWordIndex;
			} while ((isNext ? this.curWordIndex < this.curSentence().hiddenChars.length : this.curWordIndex > 0) &&
				this.curCharsIndexes[this.curWordIndex] === this.curSentence().hiddenChars[this.curWordIndex].length - 1);

			if (this.curWordIndex === (isNext ? this.curSentence().hiddenChars.length : -1)) {
				this.curWordIndex = savedNum;
				return;
			}

			this.sentenceShown = this.util.addCharByIndex(
				this.sentenceShown,
				'_',
				this.curSentence().hiddenWord[isNext ? this.curWordIndex - 1 : savedNum][0] +
					this.curCharsIndexes[isNext ? this.curWordIndex - 1 : savedNum]);

			this.sentenceShown = this.util.addCharByIndex(
				this.sentenceShown,
				'?',
				this.curSentence().hiddenWord[this.curWordIndex][0] + this.curCharsIndexes[this.curWordIndex]);

			this.refreshCharBoxes();
			this.makeHintButtonActive();

			++this.curSentence().statistics.wordSkips; // Statistics
		}
	}

	// Go to following sentence of the lesson
	nextSentenceClick() {
		this.sentenceIndex =
			this.sentenceIndex === this.lessonsData.getLessonByID(this.lessonId).sentences.length
				? 1
				: this.sentenceIndex + 1;

		this.curWordIndex = 0;
		this.curCharsIndexes = [];

		this.getData(false);

		if (!this.curSentence().isSolved) {
			++this.curSentence().statistics.sentenceSkips; // Statistics
			this.displayButtons = true;
		}
	}

	// Give up and show full sentence
	giveUpClick() {
		if (!this.curSentence().isSolved) {
			++this.curSentence().statistics.giveUps; // Statistics

			this.curWordIndex = this.curSentence().hiddenChars.length;
			this.resetColors();
			this.sentenceShown = this.curSentence().text;
			this.curSentence().isSolved = true;
			this.showHideControls(false);
		}
	}

	// Show user one current character
	hintClick() {
		if (!this.curSentence().isSolved && !this.hintIsClicked) {
			++this.curSentence().statistics.hintUsages; // Statistics
			const yellowHighlight = '0px 0px 8px 0px rgba(254, 241, 96, 1)';
			if (this.curCorrectChar().toUpperCase() === (this.updateFront ? this.firstChar : this.firstCharBack)) {
				this.highlightClickedCharBox(1, yellowHighlight);
			} else if (this.curCorrectChar().toUpperCase() === (this.updateFront ? this.secondChar : this.secondCharBack)) {
				this.highlightClickedCharBox(2, yellowHighlight);
			} else if (this.curCorrectChar().toUpperCase() === (this.updateFront ? this.thirdChar : this.thirdCharBack)) {
				this.highlightClickedCharBox(3, yellowHighlight);
			} else {
				this.highlightClickedCharBox(4, yellowHighlight);
			}
			document.getElementById('hint-button').style.opacity = '0.5';
			this.hintIsClicked = true;
		}
	}

	firstCharBoxClick() {
		const event = new KeyboardEvent('ev1',
			{ key: (this.updateFront ? this.firstChar : this.firstCharBack).toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	secondCharBoxClick() {
		const event = new KeyboardEvent('ev2',
			{ key: (this.updateFront ? this.secondChar : this.secondCharBack).toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	thirdCharBoxClick() {
		const event = new KeyboardEvent('ev3',
			{ key: (this.updateFront ? this.thirdChar : this.thirdCharBack).toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	fourthCharBoxClick() {
		const event = new KeyboardEvent('ev4',
			{ key: (this.updateFront ? this.fourthChar : this.fourthCharBack).toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	// Save user progress and leave lesson
	leaveLessonClick() {
		if (this.curSentence().text !== this.sentenceShown) {
			++this.curSentence().statistics.lessonLeaves; // Statistics
		}
		this.curSentence().curWordIndex = this.curWordIndex;
		this.curSentence().curCharsIndexes = this.curCharsIndexes;
	}

	private randomAlphabetIndex(): number {
		return Math.floor(Math.random() * this.alphabet.length);
	}

	// Generate 3 random characters from alphabet and random position for correct character
	private generateRandomCharacters() {
		const correctCharBoxIndex = Math.floor(Math.random() * 4) + 1;
		const correctChar = this.curCorrectChar().toUpperCase();
		const correctCharIndexInAlphabet = this.alphabet.indexOf(correctChar);
		let vowelsPositions = [0, 4, 8, 14, 20, 24];
		let firstRand: number, secondRand: number, thirdRand: number, fourthRand: number;
		let vowelIsGuessed: boolean = vowelsPositions.indexOf(correctCharIndexInAlphabet) !== -1;

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
			this.firstChar = correctCharBoxIndex === 1
				? correctChar
				: this.alphabet[firstRand];
			this.secondChar = correctCharBoxIndex === 2
				? correctChar
				: this.alphabet[secondRand];
			this.thirdChar = correctCharBoxIndex === 3
				? correctChar
				: this.alphabet[thirdRand];
			this.fourthChar = correctCharBoxIndex === 4
				? correctChar
				: this.alphabet[fourthRand];
		} else {
			this.firstCharBack = correctCharBoxIndex === 1
				? correctChar
				: this.alphabet[firstRand];
			this.secondCharBack = correctCharBoxIndex === 2
				? correctChar
				: this.alphabet[secondRand];
			this.thirdCharBack = correctCharBoxIndex === 3
				? correctChar
				: this.alphabet[thirdRand];
			this.fourthCharBack = correctCharBoxIndex === 4
				? correctChar
				: this.alphabet[fourthRand];
		}

		this.animateFlip();
	}

	// Reset characters boxes highlighting and generate random characters
	private refreshCharBoxes() {
		this.resetColors();

		if (this.curWordIndex === this.curSentence().hiddenWord.length) {
			this.curSentence().isSolved = true;
			return;
		}

		this.generateRandomCharacters();
	}

	private highlightClickedCharBox(charBoxNumber: number, color: string) {
		let charBoxId: string;
		if (charBoxNumber === 1) { charBoxId = 'first-char-box' }
		else if (charBoxNumber === 2) { charBoxId = 'second-char-box' }
		else if (charBoxNumber === 3) { charBoxId = 'third-char-box' }
		else if (charBoxNumber === 4) { charBoxId = 'fourth-char-box' }
		else { return }
		document.getElementById(charBoxId).style.boxShadow = color;
	}

	private makeHintButtonActive() {
		document.getElementById('hint-button').style.opacity = '1';
		this.hintIsClicked = false;
	}

	private showHideControls(isVisible: boolean) {
		document.getElementById('navigation-and-hint-buttons').style.visibility = isVisible ? 'visible' : 'hidden';
		document.getElementById('footer').style.visibility = isVisible ? 'visible' : 'hidden';
		this.displayButtons = isVisible;
	}

	// Handle keyboard event from desktop and clicks on char boxes from mobiles and desktop
	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.curSentence().isSolved) {
			if (!this.toastIsShown) {
				this.showToast();
			}
			return;
		}

		if (event.key.toUpperCase() === this.curCorrectChar().toUpperCase()) {
			this.makeHintButtonActive();

			// Fill guessed character
			this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
				this.curCorrectChar(),
				this.curSentence().hiddenWord[this.curWordIndex][0] + this.curCharsIndexes[this.curWordIndex]);

			if (this.curCharsIndexes[this.curWordIndex] !== this.curSentence().hiddenWord[this.curWordIndex][1] - 1) {
				// If current word is not filled -> replace following char with '?'
				this.sentenceShown = this.util.addCharByIndex(
					this.sentenceShown,
					'?',
					this.curSentence().hiddenWord[this.curWordIndex][0] + this.curCharsIndexes[this.curWordIndex] + 1);
			} else {
				do { // If current word is filled -> find first word, that is not filled
					++this.curWordIndex;
					if (this.curWordIndex === this.curSentence().hiddenChars.length) {
						if (this.sentenceShown !== this.curSentence().text) {
							this.curWordIndex = 0;
						} else {
							this.curSentence().isSolved = true;
							return;
						}
					}
				} while (this.curCharsIndexes[this.curWordIndex] ===
					this.curSentence().hiddenChars[this.curWordIndex].length - 1);

				this.sentenceShown = this.util.addCharByIndex(
					this.sentenceShown,
					'?',
					this.curSentence().hiddenWord[this.curWordIndex][0] + this.curCharsIndexes[this.curWordIndex]);

				this.refreshCharBoxes();

				return;
			}

			++this.curCharsIndexes[this.curWordIndex];

			if (this.curCharsIndexes[this.curWordIndex] === this.curSentence().hiddenWord[this.curWordIndex][1]) {
				++this.curWordIndex;
			}

			this.refreshCharBoxes();
		} else {
			++this.curSentence().statistics.wrongAnswers; // Statistics

			const redHighlight = '0px 0px 8px 0px rgba(167, 1, 6, 1)';
			switch (event.key) {
				case (this.updateFront ? this.firstChar : this.firstCharBack).toLowerCase(): {
					this.highlightClickedCharBox(1, redHighlight);
					break;
				}
				case (this.updateFront ? this.secondChar : this.secondCharBack).toLowerCase(): {
					this.highlightClickedCharBox(2, redHighlight);
					break;
				}
				case (this.updateFront ? this.thirdChar : this.thirdCharBack).toLowerCase(): {
					this.highlightClickedCharBox(3, redHighlight);
					break;
				}
				case (this.updateFront ? this.fourthChar : this.fourthCharBack).toLowerCase(): {
					this.highlightClickedCharBox(4, redHighlight);
					break;
				}
			}
		}
	}

	private async showToast() {
		this.toastIsShown = true;
		const toast = await this.toastController.create({
			message: 'Sentence is filled',
			position: 'middle',
			duration: 600,
			cssClass: 'toast-container'
		});
		toast.present();
		await new Promise(resolve => setTimeout(resolve, 900));
		this.toastIsShown = false;
	}
}
