import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class UtilsService {

	constructor() { }

	hideChars(inputText: string, indexes: Array<[number, number]>): string {
		let textWithHiddenCharacters = inputText.substr(0, indexes[0][0]);
		for (let i = 0; i < indexes.length - 1; i++) {
			for (let j = 0; j < indexes[i][1]; j++) {
				textWithHiddenCharacters += '_';
			}
			textWithHiddenCharacters += inputText.substr(
				indexes[i][0] + indexes[i][1], 
				indexes[i + 1][0] - (indexes[i][0] + indexes[i][1]));
		}
		for (let i = 0; i < indexes[indexes.length - 1][1]; i++) {
			textWithHiddenCharacters += '_';
		}
		textWithHiddenCharacters += inputText.substr(
			indexes[indexes.length - 1][0] + indexes[indexes.length - 1][1],
			inputText.length - indexes[indexes.length - 1][0] + indexes[indexes.length - 1][1]);
		return textWithHiddenCharacters;
	}

	addCharByIndex(input: string, replacement: string, index: number): string {
		return input.substr(0, index) + replacement + input.substr(index + replacement.length);
	}
}
