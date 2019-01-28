import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UtilsService } from '../utils.service';
import { LessonByNameService } from '../lesson-by-name.service';
import { Storage } from '@ionic/storage';

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

	private firstCharacter: string = 'V';
	private secondCharacter: string = 'D';
	private thirdCharacter: string = 'L';

	constructor(private api: LessonByNameService,
		private route: ActivatedRoute,
		private loadingController: LoadingController,
		private util: UtilsService,
		private storage: Storage) { }

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
							this.numberOfGuesses = val
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
		console.log('a');
	}

	// Show if lesson if over
	private async presentLoadingDefault() {
		const loading = await this.loadingController.create({
			message: 'Lesson is over'
		});
		await loading.present();

		setTimeout(() => {
			loading.dismiss();
		}, 1000);
	}

	// Filling in characters into underscores by keyboard
	// If input is wrong - replace with sentence with underscores
	// If lesson is over - show info
	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.numberOfGuesses === this.hiddenCharacters.length) {
			this.presentLoadingDefault();
			return;
		}
		if (event.key === this.hiddenCharacters[this.numberOfGuesses]) {
			this.sentenceToShow = this.util.showTextWithGuessedCharacter(this.sentenceToShow,
				this.hiddenCharacters[this.numberOfGuesses],
				this.indexes[this.numberOfGuesses]);
			++this.numberOfGuesses;
		} else {
			this.sentenceToShow = this.sentencesWithUnderscores;
			this.numberOfGuesses = 0;
		}
		this.storage.set(this.lessonId + 's' + (this.sentenceIndex - 1) + 'guesses', this.numberOfGuesses)
	}
}
