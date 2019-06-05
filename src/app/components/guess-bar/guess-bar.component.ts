import { Component, OnInit } from '@angular/core';
import { Sentence } from 'src/app/models/sentence';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
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

	groups = ['QWSD', 'RTFG', 'EAIO'];
	unknownCharGroup = '!@#&';

	constructor(
		private util: UtilsService,
		public lessonsDataService: LessonsDataService,
		public guessPage: SentenceGuessPage) { }

	ngOnInit() {
		this.getData();
		if (this.lessonsDataService.getLessonByID(this.guessPage.lessonId).sentences.length === 1) {
			document.getElementById('next-sentence-button').style.visibility = 'hidden';
			document.getElementById('prev-sentence-button').style.visibility = 'hidden';
		}
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

		const lessonSentences = this.lessonsDataService.getLessonByID(this.guessPage.lessonId).sentences;
		const currentLessonIndex = this.lessonsDataService
			.getSentenceNumberByIDs(this.guessPage.lessonId, this.guessPage.sentenceId);
		const firstSentenceId = lessonSentences[0].id
		const lastSentenceId = lessonSentences[lessonSentences.length - 1].id;

		if (forward) {
			this.guessPage.sentenceId = (this.guessPage.sentenceId === lastSentenceId)
				? firstSentenceId
				: lessonSentences[currentLessonIndex + 1].id;
		} else {
			this.guessPage.sentenceId = (this.guessPage.sentenceId === firstSentenceId)
				? lastSentenceId
				: lessonSentences[currentLessonIndex - 1].id;
		}

		this.guessPage.curWordIndex = 0;
		this.guessPage.curCharsIndexes = [];

		this.animateSwipe(forward);
		this.updateChart();

		if (!this.curSentence().solvedStatus) {
			++this.curSentence().statistics.sentenceSkips; // Statistics
		}
	}

	giveUpClick() { // Give up and show full sentence
		if (!this.curSentence().solvedStatus) {
			++this.curSentence().statistics.giveUps; // Statistics

			let i = 0;

			do {
				do {
					this.guessPage.sentenceShown = this.util.addChar(this.guessPage.sentenceShown,
						'<span class=\'yellow\'>' + this.curCorrectChar() + '</span>');
					if (this.guessPage.curCharsIndexes[this.guessPage.curWordIndex] !==
						this.curSentence().hiddenChars[this.guessPage.curWordIndex].length - 1 ||
						this.guessPage.curWordIndex !== this.curSentence().hiddenChars.length - 1) {
						this.guessPage.sentenceShown = this.util.addChar(this.guessPage.sentenceShown, '•');
					}
					++i;
					++this.guessPage.curCharsIndexes[this.guessPage.curWordIndex];
				} while (this.status() === 0 && i < 3);
				if (this.status() === 1) {
					++this.guessPage.curWordIndex;
				}
			} while (this.status() === 1 && i < 3);

			this.updateChart();
			this.resetColors();
			if (this.status() === 2) {
			this.curSentence().solvedStatus = true;
				if (!this.guessPage.toastIsShown) {
					this.guessPage.showToast();
				}
			}
		}
	}

	// Show user one current character
	hintClick() {
		if (!this.curSentence().solvedStatus) {
			++this.curSentence().statistics.hintUsages; // Statistics
			this.updateChart();
			this.hintIsClicked = true;
			const event = new KeyboardEvent('evHint', { key: this.curCorrectChar() });
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
				switch(srand) {
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
				switch(srand) {
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
				if (!this.guessPage.toastIsShown) {
					this.guessPage.showToast();
				}
				return;
			}

			this.guessPage.sentenceShown = this.util.addChar(this.guessPage.sentenceShown, '<span class=\'red-text\'>•</span>');

			if (!this.util.isEnglishChar(this.curCorrectChar())) {
				++this.guessPage.curCharsIndexes[this.guessPage.curWordIndex];
				const status = this.status();
				if (status === 1) {
					++this.guessPage.curWordIndex;
				} else if (status === 2) {
					this.curSentence().solvedStatus = true;
					if (!this.guessPage.toastIsShown) {
						this.guessPage.showToast();
					}
					return;
				}
			}

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

	async animateSwipe(forward: boolean) {
		if (this.sentenceTranslateIsPlayed) {
			return;
		}

		this.sentenceTranslateIsPlayed = true;

		const textShownId = '#sentence-to-show';
		await anime({
			targets: [document.querySelector(textShownId)],
			translateX: forward ? '-=40vw' : '+=40vw',
			opacity: 0,
			easing: 'easeInOutBack',
			duration: 500
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
			duration: 500
		}).finished;

		this.sentenceTranslateIsPlayed = false;
	}
}
