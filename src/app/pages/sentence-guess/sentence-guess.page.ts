import { Component, OnInit } from '@angular/core';
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
	}
})

export class SentenceGuessPage implements OnInit {

	private curWordIndex: number = 0;
	private curCharsIndexes: number[] = [];
	private lessonId: number = 0;
	private sentenceIndex: number = 1;
	private toastIsShown: boolean;
	private alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	private sentenceShown: string;
	private hiddenChars: Array<string[]>;

	private firstChar: string;
	private secondChar: string;
	private thirdChar: string;
	private fourthChar: string;

	constructor(private route: ActivatedRoute,
		private loadingController: LoadingController,
		private util: UtilsService,
		private toastController: ToastController,
		private lessonsData: LessonsDataService,
		private vibration: Vibration) { }

	ngOnInit() {
		this.sentenceIndex = Number(this.route.snapshot.queryParamMap.get('current')) + 1;
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lesson'));
		this.sentenceShown = this.curSentence().textUnderscored;
		this.getData();
	};

	logStat() {
		console.log(this.curSentence().statistics);
	}

	private curSentence(): Sentence {
		return this.lessonsData.getLessonByID(this.lessonId).sentences[this.sentenceIndex - 1];
	}

	private resetColors() {
		document.getElementById('first-char-box').style.boxShadow = 'none';
		document.getElementById('second-char-box').style.boxShadow = 'none';
		document.getElementById('third-char-box').style.boxShadow = 'none';
		document.getElementById('fourth-char-box').style.boxShadow = 'none';
	}

	private async getData() {
		const loading = await this.loadingController.create({ message: 'Loading' });
		await loading.present();

		if (this.curSentence().isSolved) {
			this.sentenceShown = this.curSentence().text;
			document.getElementById('next-sentence-button').style.boxShadow = '0px 1px 4px 1px #139c0d';
			loading.dismiss();
			return;
		}
		document.getElementById('next-sentence-button').style.boxShadow = 'none';

		this.curWordIndex = this.curSentence().curWordIndex;
		this.curCharsIndexes = this.curSentence().curCharsIndexes;

		this.hiddenChars = [];

		for (let i in this.curSentence().hiddenWord) {
			const chars: string[] = [];
			for (let j = 0; j < this.curSentence().hiddenWord[i][1]; j++) {
				chars.push(this.curSentence().text.charAt(this.curSentence().hiddenWord[i][0] + j));
			}
			this.hiddenChars.push(chars);
		}

		this.sentenceShown = this.curSentence().textUnderscored;

		if (this.curCharsIndexes.length === 0) {
			for (let i in this.hiddenChars) {
				this.curCharsIndexes.push(0);
			}
		} else {
			for (let i in this.curCharsIndexes) {
				for (let j = 0; j < this.curCharsIndexes[i]; j++) {
					this.sentenceShown = this.util.addCharByIndex(
						this.sentenceShown,
						this.hiddenChars[i][j],
						this.curSentence().hiddenWord[i][0] + j);
				}
			}
		}

		this.sentenceShown = this.util.addCharByIndex(
			this.sentenceShown,
			'?',
			this.curSentence().hiddenWord[this.curWordIndex][0] + this.curCharsIndexes[this.curWordIndex]);

		this.refreshCharBoxes();

		loading.dismiss();
	}

	nextWordClick() {
		if (!this.curSentence().isSolved && this.curWordIndex < this.hiddenChars.length - 1) {
			const savedNum = this.curWordIndex;
			do {
				++this.curWordIndex;
			} while (this.curWordIndex < this.hiddenChars.length && this.curCharsIndexes[this.curWordIndex] ===
			this.hiddenChars[this.curWordIndex].length - 1)
			if (this.curWordIndex === this.hiddenChars.length) {
				this.curWordIndex = savedNum;
				return;
			}
			this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
				'_',
				this.curSentence().hiddenWord[this.curWordIndex - 1][0] +
				this.curCharsIndexes[this.curWordIndex - 1]);
			if (this.curWordIndex !== this.hiddenChars.length) {
				this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
					'?',
					this.curSentence().hiddenWord[this.curWordIndex][0] +
					this.curCharsIndexes[this.curWordIndex]);
			}

			this.refreshCharBoxes();

			++this.curSentence().statistics.wordSkips; // Statistics
		}
	}

	previousWordClick() {
		if (!this.curSentence().isSolved && this.curWordIndex > 0) {
			const savedNum = this.curWordIndex;
			do {
				--this.curWordIndex;
			} while (this.curWordIndex > 0 && this.curCharsIndexes[this.curWordIndex] ===
			this.hiddenChars[this.curWordIndex].length - 1)
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

			++this.curSentence().statistics.wordSkips; // Statistics
		}
	}

	nextSentenceClick() {
		if (this.sentenceIndex === this.lessonsData.getLessonByID(this.lessonId).sentences.length) {
			this.sentenceIndex = 1;
		} else {
			++this.sentenceIndex;
		}
		this.curWordIndex = 0;
		this.curCharsIndexes = [];
		this.getData();
	}

	giveUpClick() {
		if (!this.curSentence().isSolved) {
			++this.curSentence().statistics.giveUps; // Statistics

			document.getElementById('next-sentence-button').style.boxShadow = '0px 3px 10px 1px rgba(245, 229, 27, 1)';
			this.curWordIndex = this.hiddenChars.length;
			this.resetColors();
			this.sentenceShown = this.curSentence().text;
			this.curSentence().isSolved = true;
		}
	}

	hintClick() {
		if (!this.curSentence().isSolved) {
			const event = new KeyboardEvent('ev0', { key: this.curCorrectChar() });
			this.handleKeyboardEvent(event);

			++this.curSentence().statistics.hintUsages; // Statistics
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

	leaveLesson() {
		if (this.curSentence().text !== this.sentenceShown) {
			++this.curSentence().statistics.lessonLeaves; // Statistics
		}
		this.curSentence().curWordIndex = this.curWordIndex;
		this.curSentence().curCharsIndexes = this.curCharsIndexes;
	}

	private refreshCharBoxes() {
		this.resetColors();

		if (this.curWordIndex === this.curSentence().hiddenWord.length) {
			document.getElementById('next-sentence-button').style.boxShadow = '0px 1px 4px 1px #139c0d';
			this.curSentence().isSolved = true;
			return;
		}

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

	private setColor(charBoxNumber: number) {
		let charBoxId: string;
		if (charBoxNumber === 1) { charBoxId = 'first-char-box' }
		else if (charBoxNumber === 2) { charBoxId = 'second-char-box' }
		else if (charBoxNumber === 3) { charBoxId = 'third-char-box' }
		else if (charBoxNumber === 4) { charBoxId = 'fourth-char-box' }
		else { return }
		document.getElementById(charBoxId).style.boxShadow = '0px 3px 10px 1px rgba(167, 1, 6, 1)';
	}

	private curCorrectChar(): string {
		return this.hiddenChars[this.curWordIndex][this.curCharsIndexes[this.curWordIndex]];
	}

	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.curSentence().isSolved) {
			if (!this.toastIsShown) {
				this.showToast();
			}
			return;
		}

		if (event.key.toUpperCase() === this.curCorrectChar().toUpperCase()) {

			if (event.type !== 'ev0') {
				++this.curSentence().statistics.correctAnswers; // Statistics
			}

			this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
				this.curCorrectChar(),
				this.curSentence().hiddenWord[this.curWordIndex][0] + this.curCharsIndexes[this.curWordIndex]);

			if (this.curCharsIndexes[this.curWordIndex] !== this.curSentence().hiddenWord[this.curWordIndex][1] - 1) {
				// If current word is not filled -> replace following char with '?'
				this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
					'?',
					this.curSentence().hiddenWord[this.curWordIndex][0] +
					this.curCharsIndexes[this.curWordIndex] + 1);
			} else {
				// If current word is filled -> find first word, that is not filled
				do {
					++this.curWordIndex;
					if (this.curWordIndex === this.hiddenChars.length) {
						if (this.sentenceShown !== this.curSentence().text) {
							this.curWordIndex = 0;
						} else {
							document.getElementById('next-sentence-button').style.boxShadow = '0px 1px 4px 1px #139c0d';
							this.curSentence().isSolved = true;
							return;
						}
					}
				} while (this.curCharsIndexes[this.curWordIndex] === this.hiddenChars[this.curWordIndex].length - 1);

				this.sentenceShown = this.util.addCharByIndex(
					this.sentenceShown,
					'?',
					this.curSentence().hiddenWord[this.curWordIndex][0] + this.curCharsIndexes[this.curWordIndex]);

				this.refreshCharBoxes();

				return;
			}

			++this.curCharsIndexes[this.curWordIndex];
			if (this.curCharsIndexes[this.curWordIndex] ===
				this.curSentence().hiddenWord[this.curWordIndex][1]) {
				++this.curWordIndex;
			}
			this.refreshCharBoxes();
		} else {

			++this.curSentence().statistics.wrongAnswers; // Statistics

			this.vibration.vibrate(200);
			if (event.key === this.firstChar.toLowerCase()) {
				this.setColor(1);
			}
			else if (event.key === this.secondChar.toLowerCase()) {
				this.setColor(2);
			}
			else if (event.key === this.thirdChar.toLowerCase()) {
				this.setColor(3);
			}
			else if (event.key === this.fourthChar.toLowerCase()) {
				this.setColor(4);
			}
		}
	}
}
