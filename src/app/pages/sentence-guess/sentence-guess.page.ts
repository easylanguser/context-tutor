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

	private numberOfSentencesGuesses: number = 0;
	private numberOfWordGuesses: number = 0;
	private lessonId: number = 0;
	private sentenceIndex: number = 1;
	private toastIsShown: boolean;
	private alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	private sentenceToShow: string;
	private hiddenCharacters: Array<string[]>;
	private lessonLength: number;

	private firstCharacter: string;
	private secondCharacter: string;
	private thirdCharacter: string;
	private fourthCharacter: string;

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
		this.sentenceToShow = this.getCurrentSentence().textUnderscored;
		this.getData();
	};

	private getCurrentSentence(): Sentence {
		return this.lessonsData.getLessonByID(this.lessonId).sentences[this.sentenceIndex - 1];
	}

	nextSentence() {
		if (this.sentenceIndex === this.lessonsData.getLessonByID(this.lessonId).sentences.length) {
			this.sentenceIndex = 1;
		} else {
			++this.sentenceIndex;
		}
		this.numberOfSentencesGuesses = 0;
		this.numberOfWordGuesses = 0;
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

		this.hiddenCharacters = [];

		for (let i = 0; i < this.getCurrentSentence().hiddenWord.length; i++) {
			const chars: string[] = [];
			for (let j = 0; j < this.getCurrentSentence().hiddenWord[i][1]; j++) {
				chars.push(this.getCurrentSentence().text.charAt(this.getCurrentSentence().hiddenWord[i][0] + j));
			}
			this.hiddenCharacters.push(chars);
		}

		this.sentenceToShow = this.util.showTextWithGuessedCharacter(
			this.getCurrentSentence().textUnderscored,
			'?',
			this.getCurrentSentence().hiddenWord[this.numberOfSentencesGuesses][0] + this.numberOfWordGuesses);

		this.refreshLetters();

		loading.dismiss();
	}

	giveUp() {
		//this.sentenceToShow = this.getCurrentSentence().text + '<mark class="yellow-box-black-border">Marked</mark>';
		document.getElementById('next-sentence-button').style.boxShadow = '0px 3px 10px 1px rgba(245, 229, 27, 1)';
		this.numberOfSentencesGuesses = this.hiddenCharacters.length;
		this.resetColors();
		this.sentenceToShow = this.getCurrentSentence().text;

		this.firstCharacter = 'D';
		this.secondCharacter = 'O';
		this.thirdCharacter = 'N';
		this.fourthCharacter = 'E';
	}

	hint() {
		if (this.numberOfSentencesGuesses !== this.hiddenCharacters.length) {
			const event = new KeyboardEvent('CustomEvent0', {
				key: this.hiddenCharacters[this.numberOfSentencesGuesses][this.numberOfWordGuesses]
			});
			this.handleKeyboardEvent(event);
		}
	}

	private refreshLetters() {
		this.resetColors();

		if (this.numberOfSentencesGuesses === this.getCurrentSentence().hiddenWord.length) {
			document.getElementById('next-sentence-button').style.boxShadow = '0px 1px 4px 1px #139c0d';
			this.firstCharacter = 'D';
			this.secondCharacter = 'O';
			this.thirdCharacter = 'N';
			this.fourthCharacter = 'E';
			return;
		}

		const correctLetterIndex = Math.floor(Math.random() * 4) + 1;
		const correctLetter = this.hiddenCharacters[this.numberOfSentencesGuesses][this.numberOfWordGuesses].toUpperCase();
		const firstRandom = Math.floor(Math.random() * this.alphabet.length);
		let secondRandom, thirdRandom, fourthRandom;

		do {
			secondRandom = Math.floor(Math.random() * this.alphabet.length);
		} while (secondRandom === firstRandom ||
			secondRandom === this.alphabet.indexOf(correctLetter));

		do {
			thirdRandom = Math.floor(Math.random() * this.alphabet.length);
		} while (thirdRandom === firstRandom || thirdRandom === secondRandom ||
			thirdRandom === this.alphabet.indexOf(correctLetter));

		do {
			fourthRandom = Math.floor(Math.random() * this.alphabet.length);
		} while (fourthRandom === firstRandom || fourthRandom === secondRandom || fourthRandom === thirdRandom ||
			fourthRandom === this.alphabet.indexOf(correctLetter));

		this.firstCharacter = correctLetterIndex === 1
			? correctLetter
			: this.alphabet[firstRandom];
		this.secondCharacter = correctLetterIndex === 2
			? correctLetter
			: this.alphabet[secondRandom];
		this.thirdCharacter = correctLetterIndex === 3
			? correctLetter
			: this.alphabet[thirdRandom];
		this.fourthCharacter = correctLetterIndex === 4
			? correctLetter
			: this.alphabet[fourthRandom];
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
		const event = new KeyboardEvent('CustomEvent1', { key: this.firstCharacter.toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	secondLetterClick() {
		const event = new KeyboardEvent('CustomEvent2', { key: this.secondCharacter.toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	thirdLetterClick() {
		const event = new KeyboardEvent('CustomEvent3', { key: this.thirdCharacter.toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	fourthLetterClick() {
		const event = new KeyboardEvent('CustomEvent4', { key: this.fourthCharacter.toLowerCase() });
		this.handleKeyboardEvent(event);
	}

	private setColor(letterBoxNumber: number) {
		let letterId: string;
		if (letterBoxNumber === 1) { letterId = 'first-letter-guessed' }
		else if (letterBoxNumber === 2) { letterId = 'second-letter-guessed' }
		else if (letterBoxNumber === 3) { letterId = 'third-letter-guessed' }
		else if (letterBoxNumber === 4) { letterId = 'fourth-letter-guessed' }
		else { return }
		document.getElementById(letterId).style.boxShadow = '0px 3px 10px 1px rgba(58,130,42,0.9)';
	}

	// Filling in characters into underscores by keyboard
	// If input is wrong - replace with sentence with underscores
	// If lesson is over - show info
	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.numberOfSentencesGuesses === this.hiddenCharacters.length) {
			if (!this.toastIsShown) {
				this.showToast();
			}
			return;
		}

		if (event.key.toUpperCase() === this.hiddenCharacters[this.numberOfSentencesGuesses][this.numberOfWordGuesses].toUpperCase()) {
			this.sentenceToShow = this.util.showTextWithGuessedCharacter(
				this.sentenceToShow,
				this.hiddenCharacters[this.numberOfSentencesGuesses][this.numberOfWordGuesses],
				this.getCurrentSentence().hiddenWord[this.numberOfSentencesGuesses][0] + this.numberOfWordGuesses);

			if (this.numberOfWordGuesses !== this.getCurrentSentence().hiddenWord[this.numberOfSentencesGuesses][1] - 1) {
				this.sentenceToShow = this.util.showTextWithGuessedCharacter(
					this.sentenceToShow,
					'?',
					this.getCurrentSentence().hiddenWord[this.numberOfSentencesGuesses][0] + this.numberOfWordGuesses + 1);
			} else {
				if (this.numberOfSentencesGuesses !== this.getCurrentSentence().hiddenWord.length - 1) {
					this.sentenceToShow = this.util.showTextWithGuessedCharacter(
						this.sentenceToShow,
						'?',
						this.getCurrentSentence().hiddenWord[this.numberOfSentencesGuesses + 1][0]);
				}
			}

			++this.numberOfWordGuesses;
			if (this.numberOfWordGuesses === this.getCurrentSentence().hiddenWord[this.numberOfSentencesGuesses][1]) {
				++this.numberOfSentencesGuesses;
				this.numberOfWordGuesses = 0;
			}
			this.refreshLetters();
		} else {
			this.vibration.vibrate([300, 300]);
			if (event.key === this.firstCharacter.toLowerCase()) {
				this.setColor(1);
			}
			else if (event.key === this.secondCharacter.toLowerCase()) {
				this.setColor(2);
			}
			else if (event.key === this.thirdCharacter.toLowerCase()) {
				this.setColor(3);
			}
			else if (event.key === this.fourthCharacter.toLowerCase()) {
				this.setColor(4);
			}
			// UNCOMMENT TO RESET SENTENCE IN CASE OF WRONG CHAR
			//this.sentenceToShow = this.sentencesWithUnderscores;
			//this.numberOfGuesses = 0;
		}
	}
}
