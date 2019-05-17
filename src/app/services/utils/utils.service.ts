import { Injectable } from '@angular/core';
import { Sentence } from 'src/app/models/sentence';
import { Lesson } from 'src/app/models/lesson';
import { AlertController, NavController } from '@ionic/angular';
import { sharedText } from 'src/app/app.component';

@Injectable({
	providedIn: 'root'
})
export class UtilsService {

	constructor(
		private alertCtrl: AlertController,
		private navCtrl: NavController) { }

	public getNewChartObject(): Object {
		return new Object({
			type: 'doughnut',
			data: {
				datasets: [
					{
						backgroundColor: []
					}
				],
			},
			options: {
				legend: {
					display: false
				},
				tooltips: {
					enabled: false
				},
				events: [],
				cutoutPercentage: 0,
				elements: {
					arc: {
						borderWidth: 0
					}
				}
			}
		});
	}

	hideChars(inputText: string, indexes: Array<[number, number]>): string {
		let textWithHiddenCharacters = inputText.substr(0, indexes[0][0]);
		for (let i = 0; i < indexes.length - 1; i++) {
			for (let j = 0; j < indexes[i][1]; j++) {
				const charAscii = inputText.charAt(indexes[i][0] + j).toUpperCase().charCodeAt(0);
				if (charAscii > 64 && charAscii < 91) {
					textWithHiddenCharacters += '*';
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
				textWithHiddenCharacters += '*';
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
		let firstUnderScoreIndex = input.indexOf('*');
		return input.substr(0, firstUnderScoreIndex) + replacement + input.substr(firstUnderScoreIndex + 1);
	}

	redAndYellowFilterSentence(val: Sentence) {
		let redIsPresent: boolean = false;
		let yellowIsPresent: boolean = false;

		const stat = val.statistics;
		if (stat.wrongAnswers > 0 && (stat.hintUsages > 0 || stat.giveUps > 0)) {
			redIsPresent = true;
			yellowIsPresent = true;
		}

		return redIsPresent && yellowIsPresent;
	}

	redAndYellowFilterLesson(val: Lesson) {
		let redIsPresent: boolean = false;
		let yellowIsPresent: boolean = false;

		for (const sentence of val.sentences) {
			const stat = sentence.statistics;
			if (stat.wrongAnswers > 0) {
				redIsPresent = true;
			}
			if (stat.hintUsages > 0 || stat.giveUps > 0) {
				yellowIsPresent = true;
			}
		}

		return redIsPresent && yellowIsPresent;
	}
}
