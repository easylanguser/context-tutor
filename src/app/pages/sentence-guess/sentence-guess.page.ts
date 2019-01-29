import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UtilsService } from '../../services/utils/utils.service';
import { LessonByNameService } from '../../services/lesson-by-name/lesson-by-name.service';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';

@Component({
	selector: 'app-sentence-guess',
	templateUrl: './sentence-guess.page.html',
	styleUrls: ['./sentence-guess.page.scss'],
	host: {
		'(document:keypress)': 'handleKeyboardEvent($event)'
	}
})

export class SentenceGuessPage implements OnInit {

	private hiddenCharacters: string[] = [];
	private sentenceToShow: string;
	private fullSentence: string;
	private numberOfGuesses: number = 0;
	private indexes: number[];
	private sentenceIndex: number;
	private lessonLength: number;
	private lessonId: number;
	private sentencesWithUnderscores: string;

	private toastIsBeingShown: boolean;

	private alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	private firstCharacter: string;
	private secondCharacter: string;
	private thirdCharacter: string;
	private fourthCharacter: string;

	constructor(private api: LessonByNameService,
		private route: ActivatedRoute,
		private loadingController: LoadingController,
		private util: UtilsService,
		private storage: Storage,
		private toastController: ToastController) { }

	ngOnInit() {
		this.sentenceIndex = Number(this.route.snapshot.queryParamMap.get('current')) + 1;
		this.getData(this.route.snapshot.queryParamMap.get('lesson'));
	};

	previousSentence() {
		if (this.sentenceIndex === 1) {
			return;
		}
		this.hiddenCharacters = [];
		--this.sentenceIndex;
		this.getData(this.lessonId);
	}

	nextSentence() {
		if (this.sentenceIndex === this.lessonLength) {
			return;
		}
		this.hiddenCharacters = [];
		++this.sentenceIndex;
		this.getData(this.lessonId);
	}

	private setColor(letterBoxNumber: number) {
		let letterId: string;
		if (letterBoxNumber === 1) { letterId = 'first-letter-guessed' }
		else if (letterBoxNumber === 2) { letterId = 'second-letter-guessed' }
		else if (letterBoxNumber === 3) { letterId = 'third-letter-guessed' }
		else if (letterBoxNumber === 4) { letterId = 'fourth-letter-guessed' }
		else { return }
		document.getElementById(letterId).style.borderColor = '#f04141';
	}

	private resetColors(color: string) {
		document.getElementById('first-letter-guessed').style.borderColor = color;
		document.getElementById('second-letter-guessed').style.borderColor = color;
		document.getElementById('third-letter-guessed').style.borderColor = color;
		document.getElementById('fourth-letter-guessed').style.borderColor = color;
	}

	// Get selected lesson from API
	private async getData(lesson) {
		this.lessonId = lesson;
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();
		this.storage.get(lesson + 'length').then((length) => {
			if (length !== null) {
				this.lessonLength = length;
				this.storage.get(lesson + 's' + (this.sentenceIndex - 1) + 'idxs')
					.then((val) => { this.indexes = val })
				this.storage.get(lesson + 's' + (this.sentenceIndex - 1) + 'textunderscored')
					.then((val) => { this.sentencesWithUnderscores = val })
				this.storage.get(this.lessonId + 's' + (this.sentenceIndex - 1) + 'hiddenchars')
					.then((val) => { this.hiddenCharacters = val })
				this.storage.get(this.lessonId + 's' + (this.sentenceIndex - 1) + 'guesses')
					.then((val) => {
						if (val !== null) {
							this.numberOfGuesses = val;
						} else {
							this.numberOfGuesses = 0;
						}
						const restoreIndexes = this.indexes.slice(0, this.numberOfGuesses);
						const restoreCharacters = this.hiddenCharacters.slice(0, this.numberOfGuesses);
						this.sentenceToShow = this.sentencesWithUnderscores;
						for (var i = 0; i < restoreIndexes.length; i++) {
							this.sentenceToShow = this.util.showTextWithGuessedCharacter(
								this.sentenceToShow, restoreCharacters[i], restoreIndexes[i]);
						}
						this.refreshLetters()
					})
				loading.dismiss();
			} else {
				this.api.getData(lesson)
					.subscribe(res => {
						this.processLesson((res[0]));
						loading.dismiss();
					}, err => {
						console.log(err);
						loading.dismiss();
					});
			}
		})
	}

	private refreshLetters() {
		if (this.numberOfGuesses == this.indexes.length) {
			this.resetColors('green')
			this.firstCharacter = 'D';
			this.secondCharacter = 'O';
			this.thirdCharacter = 'N';
			this.fourthCharacter = 'E';
			return;
		}

		this.resetColors('black');

		const correctLetterIndex = Math.floor(Math.random() * 4) + 1;

		const firstRandom = Math.floor(Math.random() * this.alphabet.length);
		let secondRandom, thirdRandom;

		do {
			secondRandom = Math.floor(Math.random() * this.alphabet.length);
		} while (secondRandom === firstRandom ||
			secondRandom === this.alphabet.indexOf(this.hiddenCharacters[this.numberOfGuesses].toUpperCase()));

		do {
			thirdRandom = Math.floor(Math.random() * this.alphabet.length);
		} while (thirdRandom === firstRandom || thirdRandom === secondRandom ||
			thirdRandom === this.alphabet.indexOf(this.hiddenCharacters[this.numberOfGuesses].toUpperCase()));

		switch (correctLetterIndex) {
			case 1: {
				this.firstCharacter = this.hiddenCharacters[this.numberOfGuesses].toUpperCase();
				this.secondCharacter = this.alphabet[firstRandom]
				this.thirdCharacter = this.alphabet[secondRandom]
				this.fourthCharacter = this.alphabet[thirdRandom]
				break;
			}
			case 2: {
				this.secondCharacter = this.hiddenCharacters[this.numberOfGuesses].toUpperCase();
				this.firstCharacter = this.alphabet[firstRandom]
				this.thirdCharacter = this.alphabet[secondRandom]
				this.fourthCharacter = this.alphabet[thirdRandom]
				break;
			}
			case 3: {
				this.thirdCharacter = this.hiddenCharacters[this.numberOfGuesses].toUpperCase();
				this.secondCharacter = this.alphabet[firstRandom]
				this.firstCharacter = this.alphabet[secondRandom]
				this.fourthCharacter = this.alphabet[thirdRandom]
				break;
			}
			case 4: {
				this.fourthCharacter = this.hiddenCharacters[this.numberOfGuesses].toUpperCase();
				this.secondCharacter = this.alphabet[firstRandom]
				this.thirdCharacter = this.alphabet[secondRandom]
				this.firstCharacter = this.alphabet[thirdRandom]
				break;
			}
		}
	}

	// Get hidden characters of the lesson, their 
	// indexes and create sentence with underscores
	private processLesson(lesson: any) {
		this.lessonLength = lesson.length;
		this.indexes = lesson[this.sentenceIndex - 1].hiddenWord;
		this.fullSentence = lesson[this.sentenceIndex - 1].text;
		this.sentenceToShow = this.util.replaceLettersWithUnderscore(
			this.fullSentence, this.indexes);

		for (var i = 0; i < this.indexes.length; i++) {
			this.hiddenCharacters.push(
				(<string>(this.fullSentence)).charAt(this.indexes[i]))
		}
	}

	// Show toast if sentence is fully filled
	async presentToastWithOptions() {
		this.toastIsBeingShown = true;
		const toast = await this.toastController.create({
			message: 'Sentence is over',
			position: 'bottom',
			duration: 1500
		});
		toast.present();
		await new Promise(resolve => setTimeout(resolve, 2000));
		this.toastIsBeingShown = false;
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
	// Filling in characters into underscores by keyboard
	// If input is wrong - replace with sentence with underscores
	// If lesson is over - show info
	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.numberOfGuesses === this.hiddenCharacters.length) {
			if (!this.toastIsBeingShown) {
				this.presentToastWithOptions();
			}
			return;
		}

		if (event.key === this.hiddenCharacters[this.numberOfGuesses]) {
			this.sentenceToShow = this.util.showTextWithGuessedCharacter(this.sentenceToShow,
				this.hiddenCharacters[this.numberOfGuesses],
				this.indexes[this.numberOfGuesses]);
			++this.numberOfGuesses;
			this.refreshLetters();
		} else {
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
		this.storage.set(this.lessonId + 's' + (this.sentenceIndex - 1) + 'guesses', this.numberOfGuesses);
	}
}
