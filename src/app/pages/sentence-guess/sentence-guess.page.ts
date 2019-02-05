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

	private currentWord: number = 0;
	private currentChars: number[] = [];
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
		this.sentenceShown = this.currentSentence().textUnderscored;
		this.getData();
	};

	private currentSentence(): Sentence {
		return this.lessonsData.getLessonByID(this.lessonId).sentences[this.sentenceIndex - 1];
	}

	private resetColors() {
		document.getElementById('first-char-box').style.boxShadow = 'none';
		document.getElementById('second-char-box').style.boxShadow = 'none';
		document.getElementById('third-char-box').style.boxShadow = 'none';
		document.getElementById('fourth-char-box').style.boxShadow = 'none';
	}

	private async getData() {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();

		document.getElementById('next-sentence-button').style.boxShadow = 'none';

		this.hiddenChars = [];

		for (let i in this.currentSentence().hiddenWord) {
			const chars: string[] = [];
			for (let j = 0; j < this.currentSentence().hiddenWord[i][1]; j++) {
				chars.push(this.currentSentence().text.charAt(this.currentSentence().hiddenWord[i][0] + j));
			}
			this.hiddenChars.push(chars);
		}

		for (let i in this.hiddenChars) {
			this.currentChars.push(Number(i));
		}

		this.sentenceShown = this.util.addCharByIndex(
			this.currentSentence().textUnderscored,
			'?',
			this.currentSentence().hiddenWord[this.currentWord][0] +
				this.currentChars[this.currentWord]);

		this.refreshCharBoxes();

		loading.dismiss();
	}

	nextWordClick() {
		if (this.currentWord < this.hiddenChars.length - 1) {
			const savedNum = this.currentWord;
			do {
				++this.currentWord;
			} while (this.currentChars[this.currentWord] ===
			this.hiddenChars[this.currentWord].length
				&& this.currentWord < this.hiddenChars.length)
			if (this.currentWord === this.hiddenChars.length) {
				this.currentWord = savedNum;
				return;
			}
			this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
				'_',
				this.currentSentence().hiddenWord[this.currentWord - 1][0] +
				this.currentChars[this.currentWord - 1]);
			if (this.currentWord !== this.hiddenChars.length) {
				this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
					'?',
					this.currentSentence().hiddenWord[this.currentWord][0] +
					this.currentChars[this.currentWord]);
			}

			this.refreshCharBoxes();
		}
	}

	previousWordClick() {
		if (this.currentWord > 0) {
			const savedNum = this.currentWord;
			do {
				--this.currentWord;
			} while (this.currentChars[this.currentWord] ===
			this.hiddenChars[this.currentWord].length
				&& this.currentWord > 0)
			if (this.currentWord === -1) {
				this.currentWord = savedNum;
				return;
			}
			this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
				'_',
				this.currentSentence().hiddenWord[savedNum][0] +
				this.currentChars[savedNum]);
			this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
				'?',
				this.currentSentence().hiddenWord[this.currentWord][0] +
				this.currentChars[this.currentWord]);
			this.refreshCharBoxes();
		}
	}

	nextSentenceClick() {
		if (this.sentenceIndex === this.lessonsData.getLessonByID(this.lessonId).sentences.length) {
			this.sentenceIndex = 1;
		} else {
			++this.sentenceIndex;
		}
		this.currentWord = 0;
		this.currentChars = [];
		this.getData();
	}

	giveUpClick() {
		document.getElementById('next-sentence-button').style.boxShadow = '0px 3px 10px 1px rgba(245, 229, 27, 1)';
		this.currentWord = this.hiddenChars.length;
		this.resetColors();
		this.sentenceShown = this.currentSentence().text;

		this.printDoneWord();
	}

	hintClick() {
		if (this.currentWord !== this.hiddenChars.length) {
			const event = new KeyboardEvent('ev0', {
				key: this.hiddenChars[this.currentWord][this.currentChars[this.currentWord]]
			});
			this.handleKeyboardEvent(event);
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

	private printDoneWord() {
		this.firstChar = 'D';
		this.secondChar = 'O';
		this.thirdChar = 'N';
		this.fourthChar = 'E';
	}

	private refreshCharBoxes() {
		this.resetColors();

		if (this.currentWord === this.currentSentence().hiddenWord.length) {
			document.getElementById('next-sentence-button').style.boxShadow = '0px 1px 4px 1px #139c0d';
			this.printDoneWord();
			return;
		}

		const correctCharIndex = Math.floor(Math.random() * 4) + 1;
		const correctChar = this.hiddenChars[this.currentWord][this.currentChars[this.currentWord]].toUpperCase();
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
			message: 'Sentence is filled completely',
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

	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.currentWord === this.hiddenChars.length) {
			if (!this.toastIsShown) {
				this.showToast();
			}
			return;
		}

		if (event.key.toUpperCase() === this.hiddenChars[this.currentWord][this.currentChars[this.currentWord]].toUpperCase()) {
			this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
				this.hiddenChars[this.currentWord][this.currentChars[this.currentWord]],
				this.currentSentence().hiddenWord[this.currentWord][0] + this.currentChars[this.currentWord]);

			if (this.currentChars[this.currentWord] !==
				this.currentSentence().hiddenWord[this.currentWord][1] - 1) {
				this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
					'?',
					this.currentSentence().hiddenWord[this.currentWord][0] +
					this.currentChars[this.currentWord] + 1);
			} else {
				if (this.currentWord !== this.currentSentence().hiddenWord.length - 1) {
					++this.currentChars[this.currentWord];
					do {
						++this.currentWord;
					} while (this.currentChars[this.currentWord] ===
					this.hiddenChars[this.currentWord].length
						&& this.currentWord < this.hiddenChars.length)
					this.sentenceShown = this.util.addCharByIndex(this.sentenceShown,
						'?',
						this.currentSentence().hiddenWord[this.currentWord][0] +
						this.currentChars[this.currentWord]);
					this.refreshCharBoxes();
					return;
				}
			}

			++this.currentChars[this.currentWord];
			if (this.currentChars[this.currentWord] ===
				this.currentSentence().hiddenWord[this.currentWord][1]) {
				++this.currentWord;
			}
			this.refreshCharBoxes();
		} else {
			this.vibration.vibrate(300);
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
