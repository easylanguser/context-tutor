import { Component } from '@angular/core';
import { AlertController, NavController, NavParams } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { LessonByNameService } from '../lesson-by-name.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'page-lessons-editing',
	templateUrl: 'lessons-editing.html',
	styleUrls: ['lessons-editing.scss'],
	host: {
		'(document:keypress)': 'handleKeyboardEvent($event)'
	}
})

export class LessonsEditingPage {

	private guessedNumber: number = 0;
	private indexes: Array<number[]> = [];
	private sentences: Array<string> = [];
	private sentencesWithUnderscores: Array<string> = [];
	private hiddenCharacters: Array<Array<string>> = [];
	private newText: string;
	private selectedIndex = 0;
	private sentencesToShow: Array<string> = [];
	private lineNumber: Array<string> = [];

	constructor(private api: LessonByNameService,
		private loadingController: LoadingController,
		private route: ActivatedRoute) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			this.getData(params['name']);
		});
	}

	// Get sentences by certain lesson
	private async getData(lessonName) {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();
		this.api.getData(lessonName)
			.subscribe(res => {
				let lesson = (res[0]).response;
				var i = 0;
				for (i; i < lesson.length; i++) {
					this.sentences.push(lesson[i][0].text);
					this.indexes.push(lesson[i][0].hidenWords);
					this.lineNumber.push(lesson[i][0].lineNumber);
				}

				for (i = 0; i < this.sentences.length; i++) {
					this.sentencesWithUnderscores.push(
						this.replaceLettersWithUnderscore(this.sentences[i], this.indexes[i], i))
				}
				this.sentencesToShow = this.sentencesWithUnderscores;
				this.changeCurrentHighlightedText();
				loading.dismiss();
			}, err => {
				console.log(err);
				loading.dismiss();
			});
	}

	// Change current active text 
	changeHighlight(i) {
		this.selectedIndex = i;
		this.changeCurrentHighlightedText();
	}

	// Set certain sentence to sentence with underscores.
	private changeCurrentHighlightedText() {
		this.newText = this.sentencesWithUnderscores[this.selectedIndex];
	}

	// Get new text from inputText with underscores at indexes and 
	// fill array with indexes of hidden characters for each sentence
	private replaceLettersWithUnderscore(inputText: string, indexes: number[], sentenceNumber: number): string {
		let textWithHiddenCharacters = inputText.substr(0, indexes[0]);
		let currentSentenceHiddenIndexes: Array<string> = [];
		for (var i = 0; i < indexes.length; i++) {
			currentSentenceHiddenIndexes.push(inputText.charAt(indexes[i]));
			textWithHiddenCharacters += '_';
			textWithHiddenCharacters += inputText.substr(indexes[i] + 1, indexes[i + 1] - indexes[i] - 1);
		}
		textWithHiddenCharacters += inputText.substr(indexes[indexes.length - 1] + 1,
			inputText.length - indexes[indexes.length - 1] - 1);
		this.hiddenCharacters.push(currentSentenceHiddenIndexes);
		return textWithHiddenCharacters;
	}

	// Filling in characters into underscores by keyboard
	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.selectedIndex === this.sentencesWithUnderscores.length) {
			this.presentLoadingDefault();
			return;
		}

		if (event.key === this.hiddenCharacters[this.selectedIndex][this.guessedNumber]) {
			this.newText = this.showTextWithGuessedCharacter(this.newText,
				this.hiddenCharacters[this.selectedIndex][this.guessedNumber],
				this.indexes[this.selectedIndex][this.guessedNumber]);
			this.sentencesToShow[this.selectedIndex] = this.newText;
			++this.guessedNumber;
			if (this.guessedNumber === this.indexes[this.selectedIndex].length) {
				++this.selectedIndex;
				this.changeCurrentHighlightedText();
				this.guessedNumber = 0;
			}
		} else {
			this.changeCurrentHighlightedText();
			this.sentencesToShow[this.selectedIndex] = this.showTextWithGuessedCharacter(
				this.sentencesWithUnderscores[this.selectedIndex],
				"_", this.indexes[this.selectedIndex][0]);

			this.guessedNumber = 0;
		}
	}

	// Show if lesson if over
	private async presentLoadingDefault() {
		const loading = await this.loadingController.create({
			message: 'Lesson is over'
		});
		await loading.present();

		setTimeout(() => {
			loading.dismiss();
		}, 5e00);
	}

	// Show one guessed letter
	private showTextWithGuessedCharacter(input, replacement, index): string {
		return input.substr(0, index) + replacement + input.substr(index + replacement.length);
	}
}
