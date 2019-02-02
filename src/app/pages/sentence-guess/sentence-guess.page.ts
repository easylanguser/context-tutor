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
	private lessonLength: number;

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
		this.lessonLength = Number(this.lessonsData.getLessonByID(this.lessonId).sentences.length);
		this.sentenceShown = this.getCurrentSentence().textUnderscored;
		this.getData();
	};

	private getCurrentSentence(): Sentence {
		return this.lessonsData.getLessonByID(this.lessonId).sentences[this.sentenceIndex - 1];
	}

	nextWord() {
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
			this.sentenceShown = this.util.showTextWithGuessedCharacter(
				this.sentenceShown,
				'_',
				this.getCurrentSentence().hiddenWord[this.currentWord - 1][0] + 
					this.currentChars[this.currentWord - 1]);
			if (this.currentWord !== this.hiddenChars.length) {
				this.sentenceShown = this.util.showTextWithGuessedCharacter(
					this.sentenceShown,
					'?',
					this.getCurrentSentence().hiddenWord[this.currentWord][0] +
						this.currentChars[this.currentWord]);
			}

			this.refreshLetters();
		}
	}

	previousWord() {
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
			this.sentenceShown = this.util.showTextWithGuessedCharacter(
				this.sentenceShown,
				'_',
				this.getCurrentSentence().hiddenWord[savedNum][0] +
					this.currentChars[savedNum]);
			this.sentenceShown = this.util.showTextWithGuessedCharacter(
				this.sentenceShown,
				'?',
				this.getCurrentSentence().hiddenWord[this.currentWord][0] +
					this.currentChars[this.currentWord]);
			this.refreshLetters();
		}
	}

	nextSentence() {
		if (this.sentenceIndex === this.lessonsData.getLessonByID(this.lessonId).sentences.length) {
			this.sentenceIndex = 1;
		} else {
			++this.sentenceIndex;
		}
		this.currentWord = 0;
		this.currentChars = [];
		this.getData();
	}
 
	private resetColors() {
		document.getElementById('first-letter-guessed').style.boxShadow = 'none';
		document.getElementById('second-letter-guessed').style.boxShadow = 'none';
		document.getElementById('third-letter-guessed').style.boxShadow = 'none';
		document.getElementById('fourth-letter-guessed').style.boxShadow = 'none';
	}

	// Get selected lesson from API
	private async getData() {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();

		document.getElementById('next-sentence-button').style.boxShadow = 'none';

		this.hiddenChars = [];

		for (let i = 0; i < this.getCurrentSentence().hiddenWord.length; i++) {
			const chars: string[] = [];
			for (let j = 0; j < this.getCurrentSentence().hiddenWord[i][1]; j++) {
				chars.push(this.getCurrentSentence().text.charAt(this.getCurrentSentence().hiddenWord[i][0] + j));
			}
			this.hiddenChars.push(chars);
		}

		for (let i = 0; i < this.hiddenChars.length; i++) {
			this.currentChars.push(0);
		}

		this.sentenceShown = this.util.showTextWithGuessedCharacter(
			this.getCurrentSentence().textUnderscored,
			'?',
			this.getCurrentSentence().hiddenWord[this.currentWord][0] + 
				this.currentChars[this.currentWord]);

		this.refreshLetters();

		loading.dismiss();
	}

	giveUp() {
		//this.sentenceShown = this.getCurrentSentence().text + '<mark class="yellow-box-black-border">Marked</mark>';
		document.getElementById('next-sentence-button').style.boxShadow = '0px 3px 10px 1px rgba(245, 229, 27, 1)';
		this.currentWord = this.hiddenChars.length;
		this.resetColors();
		this.sentenceShown = this.getCurrentSentence().text;

		this.firstChar = 'D';
		this.secondChar = 'O';
		this.thirdChar = 'N';
		this.fourthChar = 'E';
	}

	hint() {
		if (this.currentWord !== this.hiddenChars.length) {
			const event = new KeyboardEvent('CustomEvent0', {
				key: this.hiddenChars[this.currentWord][this.currentChars[this.currentWord]]
			});
			this.handleKeyboardEvent(event);
		}
	}

	private refreshLetters() {
		this.resetColors();

		if (this.currentWord === this.getCurrentSentence().hiddenWord.length) {
			document.getElementById('next-sentence-button').style.boxShadow = '0px 1px 4px 1px #139c0d';
			this.firstChar = 'D';
			this.secondChar = 'O';
			this.thirdChar = 'N';
			this.fourthChar = 'E';
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

	// Show toast if sentence is fully filled
	async showToast() {
		this.toastIsShown = true;
		const toast = await this.toastController.create({
			message: 'Sentence is over',
			position: 'middle',
			duration: 500,
			cssClass: 'toast-container'
		});
		toast.present();
		await new Promise(resolve => setTimeout(resolve, 800));
		this.toastIsShown = false;
	}

	firstLetterClick() {
		const event = new KeyboardEvent('CustomEvent1', { key: this.firstChar.toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	secondLetterClick() {
		const event = new KeyboardEvent('CustomEvent2', { key: this.secondChar.toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	thirdLetterClick() {
		const event = new KeyboardEvent('CustomEvent3', { key: this.thirdChar.toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	fourthLetterClick() {
		const event = new KeyboardEvent('CustomEvent4', { key: this.fourthChar.toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	private setColor(letterBoxNumber: number) {
		let letterId: string;
		if (letterBoxNumber === 1) { letterId = 'first-letter-guessed' }
		else if (letterBoxNumber === 2) { letterId = 'second-letter-guessed' }
		else if (letterBoxNumber === 3) { letterId = 'third-letter-guessed' }
		else if (letterBoxNumber === 4) { letterId = 'fourth-letter-guessed' }
		else { return }
		document.getElementById(letterId).style.boxShadow = '0px 3px 10px 1px rgba(167, 1, 6, 1)';
	}

	// Filling in characters into underscores by keyboard
	// If input is wrong - replace with sentence with underscores
	// If lesson is over - show info
	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.currentWord === this.hiddenChars.length) {
			if (!this.toastIsShown) {
				this.showToast();
			}
			return;
		}

		if (event.key.toUpperCase() === this.hiddenChars[this.currentWord][this.currentChars[this.currentWord]].toUpperCase()) {
			this.sentenceShown = this.util.showTextWithGuessedCharacter(
				this.sentenceShown,
				this.hiddenChars[this.currentWord][this.currentChars[this.currentWord]],
				this.getCurrentSentence().hiddenWord[this.currentWord][0] + this.currentChars[this.currentWord]);

			if (this.currentChars[this.currentWord] !== 
					this.getCurrentSentence().hiddenWord[this.currentWord][1] - 1) {
				this.sentenceShown = this.util.showTextWithGuessedCharacter(
					this.sentenceShown,
					'?',
					this.getCurrentSentence().hiddenWord[this.currentWord][0] + 
						this.currentChars[this.currentWord] + 1);
			} else {
				if (this.currentWord !== this.getCurrentSentence().hiddenWord.length - 1) {
					++this.currentChars[this.currentWord];
					do {
						++this.currentWord;
					} while (this.currentChars[this.currentWord] === 
						this.hiddenChars[this.currentWord].length 
						&& this.currentWord < this.hiddenChars.length)
					this.sentenceShown = this.util.showTextWithGuessedCharacter(
						this.sentenceShown,
						'?',
						this.getCurrentSentence().hiddenWord[this.currentWord][0] + 
							this.currentChars[this.currentWord]);
					this.refreshLetters();
					return;
				}
			}

			++this.currentChars[this.currentWord];
			if (this.currentChars[this.currentWord] === 
				this.getCurrentSentence().hiddenWord[this.currentWord][1]) {
				++this.currentWord;
			}
			this.refreshLetters();
		} else {
			this.vibration.vibrate([300, 300]);
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
