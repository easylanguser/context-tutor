import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UtilsService } from '../../services/utils/utils.service';
import { ToastController } from '@ionic/angular';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Sentence } from 'src/app/models/sentence';

@Component({
	selector: 'app-sentence-guess',
	templateUrl: './sentence-guess.page.html',
	styleUrls: ['./sentence-guess.page.scss'],
	host: {
		'(document:keypress)': 'handleKeyboardEvent($event)'
	}
})

export class SentenceGuessPage implements OnInit {

	private numberOfGuesses: number = 0;
	private lessonId: number = 0;
	private sentenceIndex: number = 1;
	private toastIsBeingShown: boolean;
	private alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	private sentenceToShow: string;
	private hiddenCharacters: string[];
	private lessonLength: number;

	private firstCharacter: string;
	private secondCharacter: string;
	private thirdCharacter: string;
	private fourthCharacter: string;

	constructor(private route: ActivatedRoute,
		private loadingController: LoadingController,
		private util: UtilsService,
		private toastController: ToastController,
		private lessonsData: LessonsDataService) { }

	ngOnInit() {
		this.sentenceIndex = Number(this.route.snapshot.queryParamMap.get('current')) + 1;
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lesson'));
		this.lessonLength = Number(this.getCurrentSentences().length);
		this.sentenceToShow = this.getCurrentSentences()[this.sentenceIndex - 1].text;
		this.getData();
	};

	private getCurrentSentences(): Sentence[] {
		return this.lessonsData.lessons[this.lessonId].sentences;
	}

	previousSentence() {
		if (this.sentenceIndex === 1) {
			return;
		}
		--this.sentenceIndex;
		this.getData();
	}

	nextSentence() {
		if (this.sentenceIndex === this.getCurrentSentences.length) {
			return;
		}
		++this.sentenceIndex;
		this.getData();
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
	private async getData() {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();

		this.hiddenCharacters = [];
		for (let idx of this.getCurrentSentences()[this.sentenceIndex - 1].hiddenWord) {
			this.hiddenCharacters.push(this.getCurrentSentences()[this.sentenceIndex - 1].text.charAt(Number(idx)));
		}

		this.sentenceToShow = this.util.replaceLettersWithUnderscore(
			this.getCurrentSentences()[this.sentenceIndex - 1].text,
			this.getCurrentSentences()[this.sentenceIndex - 1].hiddenWord);

		this.refreshLetters();

		loading.dismiss();
	}

	private refreshLetters() {
		if (this.numberOfGuesses == this.getCurrentSentences()[this.sentenceIndex - 1].hiddenWord.length) {
			this.resetColors('green');
			this.firstCharacter = 'D';
			this.secondCharacter = 'O';
			this.thirdCharacter = 'N';
			this.fourthCharacter = 'E';
			return;
		}

		this.resetColors('black');

		const correctLetterIndex = Math.floor(Math.random() * 4) + 1;
		const correctLetter = this.hiddenCharacters[this.numberOfGuesses].toUpperCase();
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
				this.lessonsData.lessons[this.lessonId].sentences[this.sentenceIndex - 1].hiddenWord[this.numberOfGuesses]);
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
	}
}
