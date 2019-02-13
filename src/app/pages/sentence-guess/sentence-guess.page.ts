import { Component, OnInit } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UtilsService } from '../../services/utils/utils.service';
import { ToastController } from '@ionic/angular';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Sentence } from 'src/app/models/sentence';
import { Vibration } from '@ionic-native/vibration/ngx';

@Component({
	selector: 'app-sentence-guess',
	templateUrl: './sentence-guess.page.html',
	styleUrls: ['./sentence-guess.page.scss'],
	host: {
		'(document:keypress)': 'handleKeyboardEvent($event)'
	},
	animations: [
		trigger('fade', [
			transition(':enter', [
				style({ opacity: '0' }),
				animate('200ms 400ms ease-out', style({ opacity: '1' }))
			]),
			transition(':leave', [
				animate('200ms ease-in', style({ opacity: '0' }))
			])
		])
	]
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
	
	// 3 random characters with one correct one 
	firstChar: string;
	secondChar: string;
	thirdChar: string;
	fourthChar: string;

	constructor(private route: ActivatedRoute,
		private loadingController: LoadingController,
		private util: UtilsService,
		private toastController: ToastController,
		public lessonsData: LessonsDataService,
		private vibration: Vibration) { }

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
		document.getElementById('first-char-box').style.boxShadow = 'none';
		document.getElementById('second-char-box').style.boxShadow = 'none';
		document.getElementById('third-char-box').style.boxShadow = 'none';
		document.getElementById('fourth-char-box').style.boxShadow = 'none';
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
		if (!this.curSentence().isSolved && this.curWordIndex < this.curSentence().hiddenChars.length - 1) {
			const savedNum = this.curWordIndex; // Save current word number in case switching cannot be done
			do {
				++this.curWordIndex;
			} while (this.curWordIndex < this.curSentence().hiddenChars.length &&
				this.curCharsIndexes[this.curWordIndex] === this.curSentence().hiddenChars[this.curWordIndex].length - 1);

			// If end of sentence was reached
			if (this.curWordIndex === this.curSentence().hiddenChars.length) {
				this.curWordIndex = savedNum;
				return;
			}

			this.sentenceShown = this.util.addCharByIndex(
				this.sentenceShown,
				'_',
				this.curSentence().hiddenWord[this.curWordIndex - 1][0] + this.curCharsIndexes[this.curWordIndex - 1]);

			this.sentenceShown = this.util.addCharByIndex(
				this.sentenceShown,
				'?',
				this.curSentence().hiddenWord[this.curWordIndex][0] + this.curCharsIndexes[this.curWordIndex]);

			this.refreshCharBoxes();
			this.makeHintButtonActive();

			++this.curSentence().statistics.wordSkips; // Statistics
		}
	}

	// Go to first previous unfilled word
	previousWordClick() {
		if (!this.curSentence().isSolved && this.curWordIndex > 0) {
			const savedNum = this.curWordIndex; // Save current word number in case switching cannot be done
			do {
				--this.curWordIndex;
			} while (this.curWordIndex > 0 && this.curCharsIndexes[this.curWordIndex] ===
			this.curSentence().hiddenChars[this.curWordIndex].length - 1);

			// If end of sentence was reached
			if (this.curWordIndex === -1) {
				this.curWordIndex = savedNum;
				return;
			}

			this.sentenceShown = this.util.addCharByIndex(
				this.sentenceShown,
				'_',
				this.curSentence().hiddenWord[savedNum][0] + this.curCharsIndexes[savedNum]);

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
			if (this.curCorrectChar().toUpperCase() === this.firstChar) {
				this.highlightClickedCharBox(1, '0px 0px 8px 0px rgba(254, 241, 96, 1)');
			} else if (this.curCorrectChar().toUpperCase() === this.secondChar) {
				this.highlightClickedCharBox(2, '0px 0px 8px 0px rgba(254, 241, 96, 1)');
			} else if (this.curCorrectChar().toUpperCase() === this.thirdChar) {
				this.highlightClickedCharBox(3, '0px 0px 8px 0px rgba(254, 241, 96, 1)');
			} else {
				this.highlightClickedCharBox(4, '0px 0px 8px 0px rgba(254, 241, 96, 1)');
			}
			document.getElementById('hint-button').style.opacity = '0.5';
			this.hintIsClicked = true;
		}
	}

	firstCharBoxClick() {
		const event = new KeyboardEvent('ev1', { key: this.firstChar.toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	secondCharBoxClick() {
		const event = new KeyboardEvent('ev2', { key: this.secondChar.toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	thirdCharBoxClick() {
		const event = new KeyboardEvent('ev3', { key: this.thirdChar.toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	fourthCharBoxClick() {
		const event = new KeyboardEvent('ev4', { key: this.fourthChar.toLowerCase() });
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

	// Generate 3 random characters from alphabet and random position for correct character  
	private generateRandomCharacters() {
		const correctCharIndex = Math.floor(Math.random() * 4) + 1;
		const correctChar = this.curCorrectChar().toUpperCase();
		const firstRand = Math.floor(Math.random() * this.alphabet.length);
		let secondRand, thirdRand, fourthRand;

		do {
			secondRand = Math.floor(Math.random() * this.alphabet.length);
		} while (secondRand === firstRand ||
			secondRand === this.alphabet.indexOf(correctChar));

		do {
			thirdRand = Math.floor(Math.random() * this.alphabet.length);
		} while (thirdRand === firstRand || thirdRand === secondRand ||
			thirdRand === this.alphabet.indexOf(correctChar));

		do {
			fourthRand = Math.floor(Math.random() * this.alphabet.length);
		} while (fourthRand === firstRand || fourthRand === secondRand || fourthRand === thirdRand ||
			fourthRand === this.alphabet.indexOf(correctChar));

		this.firstChar = correctCharIndex === 1
			? correctChar
			: this.alphabet[firstRand];
		this.secondChar = correctCharIndex === 2
			? correctChar
			: this.alphabet[secondRand];
		this.thirdChar = correctCharIndex === 3
			? correctChar
			: this.alphabet[thirdRand];
		this.fourthChar = correctCharIndex === 4
			? correctChar
			: this.alphabet[fourthRand];
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

	private showHideControls(isVisible) {
		document.getElementById('navigation-and-hint-buttons').style.visibility = isVisible ? 'visible' : 'hidden';
		document.getElementById('footer').style.visibility = isVisible ? 'visible' : 'hidden';
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
			this.displayButtons = false;
			setTimeout(() => this.displayButtons = true, 300);

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
				// If current word is filled -> find first word, that is not filled
				do {
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

			this.vibration.vibrate(200);

			switch (event.key) {
				case this.firstChar.toLowerCase(): {
					this.highlightClickedCharBox(1, '0px 0px 8px 0px rgba(167, 1, 6, 1)');
					break;
				}
				case this.secondChar.toLowerCase(): {
					this.highlightClickedCharBox(2, '0px 0px 8px 0px rgba(167, 1, 6, 1)');
					break;
				}
				case this.thirdChar.toLowerCase(): {
					this.highlightClickedCharBox(3, '0px 0px 8px 0px rgba(167, 1, 6, 1)');
					break;
				}
				case this.fourthChar.toLowerCase(): {
					this.highlightClickedCharBox(4, '0px 0px 8px 0px rgba(167, 1, 6, 1)');
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
