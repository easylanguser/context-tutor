import { Component, OnInit } from '@angular/core';
import { Sentence } from 'src/app/models/sentence';
import { UtilsService } from 'src/app/services/utils/utils.service';
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

	alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

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
		private util: UtilsService,
		public lessonsData: LessonsService,
		public guessPage: SentenceGuessPage) { }

	ngOnInit() {
		this.getData();
	}

	async getData() {

		if (this.curSentence().solvedStatus) { // Display filled sentence, if it has already been solved
			this.guessPage.sentenceShown = this.curSentence().sentenceShown;
		} else {
			this.hintIsClicked = false;

			// Restore user progress 
			this.guessPage.curWordIndex = this.curSentence().curWordIndex;
			this.guessPage.curCharsIndexes = this.curSentence().curCharsIndexes;
			this.guessPage.sentenceShown = this.curSentence().sentenceShown;

			this.refreshCharBoxes();
		}
	}

	curSentence(): Sentence {
		return this.guessPage.curSentence();
	}

	private updateChart() {
		this.guessPage.updateChart();
	}

	// Get current character to be filled
	private curCorrectChar(): string {
		return this.curSentence().hiddenChars[this.guessPage.curWordIndex][this.guessPage.curCharsIndexes[this.guessPage.curWordIndex]];
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
		this.changeSentence(true);
	}

	// Go to the previous sentence of the lesson
	prevSentenceClick() {
		this.changeSentence(false);
	}

	changeSentence(forward: boolean) {
		if (this.sentenceTranslateIsPlayed) {
			return;
		}

		this.guessPage.saveData();

		const lastSentenceNumber = this.lessonsData.getLessonByID(this.guessPage.lessonId).sentences.length;
		if (forward) {
			this.guessPage.sentenceIndex = (this.guessPage.sentenceIndex === lastSentenceNumber)
				? 1
				: this.guessPage.sentenceIndex + 1;
		} else {
			this.guessPage.sentenceIndex = (this.guessPage.sentenceIndex === 1)
				? lastSentenceNumber
				: this.guessPage.sentenceIndex - 1;
		}

		this.guessPage.curWordIndex = 0;
		this.guessPage.curCharsIndexes = [];

		this.animateSwipe();
		this.updateChart();

		if (!this.curSentence().solvedStatus) {
			++this.curSentence().statistics.sentenceSkips; // Statistics
		}
	}

	// Give up and show full sentence
	giveUpClick() {
		if (!this.curSentence().solvedStatus) {
			++this.curSentence().statistics.giveUps; // Statistics

			do {
				do {
					this.guessPage.sentenceShown = this.util.addChar(this.guessPage.sentenceShown,
						'<span class=\'yellow\'>' + this.curCorrectChar() + '</span>');
					if (this.guessPage.curCharsIndexes[this.guessPage.curWordIndex] !==
						this.curSentence().hiddenChars[this.guessPage.curWordIndex].length - 1 ||
						this.guessPage.curWordIndex !== this.curSentence().hiddenChars.length - 1) {
						this.guessPage.sentenceShown = this.util.addChar(this.guessPage.sentenceShown, '?');
					}
					++this.guessPage.curCharsIndexes[this.guessPage.curWordIndex];
				} while (this.guessPage.curCharsIndexes[this.guessPage.curWordIndex] <
					this.curSentence().hiddenChars[this.guessPage.curWordIndex].length);
				++this.guessPage.curWordIndex;
			} while (this.guessPage.curWordIndex < this.curSentence().hiddenChars.length);

			this.updateChart();
			this.resetColors();
			this.curSentence().solvedStatus = true;
		}
	}

	// Show user one current character
	hintClick() {
		if (!this.curSentence().solvedStatus) {
			++this.curSentence().statistics.hintUsages; // Statistics
			this.updateChart();
			this.hintIsClicked = true;

			const event = new KeyboardEvent('evHint', 
			{
				key: this.curCorrectChar()
			});
			this.handleKeyboardEvent(event);
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
		let firstRand: number,
			secondRand: number,
			thirdRand: number,
			fourthRand: number;
		const vowelIsGuessed: boolean = vowelsPositions.indexOf(correctCharIndexInAlphabet) !== -1;

		this.updateFront = !this.updateFront;

		do {
			firstRand = this.randomAlphabetIndex();
		} while (firstRand === correctCharIndexInAlphabet ||
			(vowelIsGuessed ? !vowelsPositions.includes(firstRand) : vowelsPositions.includes(firstRand)));

		do {
			secondRand = this.randomAlphabetIndex();
		} while (secondRand === firstRand || secondRand === correctCharIndexInAlphabet ||
			(vowelIsGuessed ? !vowelsPositions.includes(secondRand) : vowelsPositions.includes(secondRand)));

		do {
			thirdRand = this.randomAlphabetIndex();
		} while (thirdRand === firstRand || thirdRand === secondRand || thirdRand === correctCharIndexInAlphabet ||
			(vowelIsGuessed ? !vowelsPositions.includes(thirdRand) : vowelsPositions.includes(thirdRand)));

		do {
			fourthRand = this.randomAlphabetIndex();
		} while (fourthRand === firstRand || fourthRand === secondRand || fourthRand === thirdRand || fourthRand === correctCharIndexInAlphabet ||
			(vowelIsGuessed ? !vowelsPositions.includes(fourthRand) : vowelsPositions.includes(fourthRand)));

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
		if (this.guessPage.curCharsIndexes[this.guessPage.curWordIndex] === this.curSentence().hiddenChars[this.guessPage.curWordIndex].length) {
			if (this.guessPage.curWordIndex === this.curSentence().hiddenChars.length - 1) {
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
		if (this.curSentence().solvedStatus) {
			if (!this.guessPage.toastIsShown) {
				this.guessPage.showToast();
			}
			return;
		}

		if (event.key.toUpperCase() === this.curCorrectChar().toUpperCase()) {
			let spanColor;
			if (this.hintIsClicked) {
				this.hintIsClicked = false;
				spanColor = '<span class=\'yellow\'>';
			} else {
				++this.curSentence().statistics.correctAnswers; // Statistics
				spanColor = '<span class=\'green\'>';
			}

			// Fill guessed character
			this.guessPage.sentenceShown = this.util.addChar(this.guessPage.sentenceShown, spanColor + this.curCorrectChar() + '</span>');
			++this.guessPage.curCharsIndexes[this.guessPage.curWordIndex];

			const status = this.status();
			if (status === 1) {
				++this.guessPage.curWordIndex;
			} else if (status === 2) {
				this.curSentence().solvedStatus = true;
				return;
			}

			this.guessPage.sentenceShown = this.util.addChar(this.guessPage.sentenceShown, '?');

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
			translateX: '+=30vw',
			opacity: 0,
			easing: 'easeInQuart',
			duration: 400
		}).finished;

		await this.getData();

		await anime({
			targets: [document.querySelector(textShownId)],
			translateX: '-=30vw',
			opacity: 1,
			easing: 'easeInQuart',
			duration: 500
		}).finished;

		this.sentenceTranslateIsPlayed = false;
	}
}
