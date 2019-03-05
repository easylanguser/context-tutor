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
				const charAscii = inputText.charAt(indexes[i][0] + j).toUpperCase().charCodeAt(0);
				if (charAscii > 64 && charAscii < 91) {
					textWithHiddenCharacters += '_';
				} else {
					textWithHiddenCharacters += inputText.charAt(indexes[i][0] + j);
				}
			}
			textWithHiddenCharacters += inputText.substr(
				indexes[i][0] + indexes[i][1], 
				indexes[i + 1][0] - (indexes[i][0] + indexes[i][1]));
		}
		for (let i = 0; i < indexes[indexes.length - 1][1]; i++) {
			const charAscii = inputText.charAt(indexes[indexes.length - 1][0] + i).toUpperCase().charCodeAt(0);
			if (charAscii > 64 && charAscii < 91) {
				textWithHiddenCharacters += '_';
			} else {
				textWithHiddenCharacters += inputText.charAt(indexes[indexes.length - 1][0] + i);
			}
		}
		textWithHiddenCharacters += inputText.substr(
			indexes[indexes.length - 1][0] + indexes[indexes.length - 1][1],
			inputText.length - indexes[indexes.length - 1][0] + indexes[indexes.length - 1][1]);
		return textWithHiddenCharacters;
	}

	addChar(input: string, replacement: string): string {
		let firstUnderScoreIndex;
		if (replacement.charAt(0) === '?') {
			firstUnderScoreIndex = input.indexOf('_');
		} else {
			firstUnderScoreIndex = input.indexOf('?')
		}
		return input.substr(0, firstUnderScoreIndex) + replacement + input.substr(firstUnderScoreIndex + 1);
	}
}
