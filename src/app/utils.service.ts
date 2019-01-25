import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class UtilsService {

	constructor() { }

	// Get new text from inputText with underscores at indexes and 
	// fill array with indexes of hidden characters for each sentence
	replaceLettersWithUnderscore(inputText: string, indexes: number[]): string {
		let textWithHiddenCharacters = inputText.substr(0, indexes[0]);
		let currentSentenceHiddenIndexes: Array<string> = [];
		for (var i = 0; i < indexes.length; i++) {
			currentSentenceHiddenIndexes.push(inputText.charAt(indexes[i]));
			textWithHiddenCharacters += '_';
			textWithHiddenCharacters += inputText.substr(
				indexes[i] + 1, indexes[i + 1] - indexes[i] - 1);
		}
		textWithHiddenCharacters += inputText.substr(indexes[indexes.length - 1] + 1,
			inputText.length - indexes[indexes.length - 1] - 1);
		return textWithHiddenCharacters;
	}

	// Show one guessed letter
	showTextWithGuessedCharacter(input, replacement, index): string {
		return input.substr(0, index) + replacement + input.substr(index + replacement.length);
	}
}
