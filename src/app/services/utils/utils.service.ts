import { Injectable } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { Statistics } from 'src/app/models/statistics';
import { ToastController, LoadingController } from '@ionic/angular';
import { Globals } from '../globals/globals';

@Injectable({
	providedIn: 'root'
})
export class UtilsService {

	toast: HTMLIonToastElement;
	loader: HTMLIonLoadingElement;

	constructor(
		private toastController: ToastController,
		private loadingController: LoadingController,
		private globals: Globals) { }

	public async showToast(message: string) {
		if (!this.toast) {
			this.toast = await this.toastController.create({
				message: message,
				duration: 2500
			});
			this.toast.present();
			setTimeout(() => { this.toast = null }, 2800);
		}
	}

	public async createAndShowLoader(message: string): Promise<void> {
		if (!this.loader) {
			this.loader = await this.loadingController.create({
				message: message,
				backdropDismiss: true
			});
			return this.loader.present();
		}
	}

	public async dismissLoader(): Promise<void> {
		if (this.loader) {
			await this.loader.dismiss();
			this.loader = null;
		}
	}

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

	calculatePeriod(diff: number): [string, string] {
		let label: string, flooredValue: string;

		if (diff < 60) {
			flooredValue = '';
			label = 'A moment ago';
		} else if (diff >= 60 && diff < 3600) {
			flooredValue = String(Math.floor(diff / 60));
			label = ' minutes ago';
			if (flooredValue === '1') { label = ' minute ago'; }
		} else if (diff >= 3600 && diff < 86400) {
			flooredValue = String(Math.floor(diff / 3600));
			label = ' hours ago';
			if (flooredValue === '1') { label = ' hour ago'; }
		} else if (diff >= 86400 && diff < 1209600) {
			flooredValue = String(Math.floor(diff / 86400));
			label = ' days ago';
			if (flooredValue === '1') { label = ' day ago'; }
		} else if (diff >= 1209600 && diff < 2678400) {
			flooredValue = String(Math.floor(diff / 604800));
			label = ' weeks ago';
		} else {
			flooredValue = String(Math.floor(diff / 2678400));
			label = ' months ago';
			if (flooredValue === '1') { label = ' month ago'; }
		}

		return [flooredValue, label];
	}

	hideChars(inputText: string, indexes: Array<[number, number]>, hiddenChar): string {
		let textWithHiddenCharacters = inputText.substr(0, indexes[0][0]);
		for (let i = 0; i < indexes.length - 1; i++) {
			for (let j = 0; j < indexes[i][1]; j++) {
				if (this.isEnglishChar(inputText.charAt(indexes[i][0] + j))) {
					textWithHiddenCharacters += hiddenChar;
				} else {
					textWithHiddenCharacters += inputText.charAt(indexes[i][0] + j);
				}
			}
			textWithHiddenCharacters += inputText.substr(
				indexes[i][0] + indexes[i][1],
				indexes[i + 1][0] - (indexes[i][0] + indexes[i][1]));
		}
		for (let i = 0; i < indexes[indexes.length - 1][1]; i++) {
			if (this.isEnglishChar(inputText.charAt(indexes[indexes.length - 1][0] + i))) {
				textWithHiddenCharacters += hiddenChar;
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
		let firstUnderScoreIndex = input.indexOf(this.globals.charForHiding);
		let length = 1;
		if (input.charAt(firstUnderScoreIndex - 3) === 't' && input.charAt(firstUnderScoreIndex - 1) === '>') {
			firstUnderScoreIndex -= 23;
			length = 31;
		}
		return input.substr(0, firstUnderScoreIndex) + replacement + input.substr(firstUnderScoreIndex + length);
	}

	redAndYellowFilterSentence(stat: Statistics) {
		return stat.wrongAnswers > 0 && (stat.hintUsages > 0 || stat.giveUps > 0);
	}

	redAndYellowFilterLesson(val: Lesson) {
		let redIsPresent: boolean = false;
		let yellowIsPresent: boolean = false;

		for (const stat of val.statistics) {
			if (stat.wrongAnswers > 0) {
				redIsPresent = true;
			}
			if (stat.hintUsages > 0 || stat.giveUps > 0) {
				yellowIsPresent = true;
			}
		}

		return redIsPresent && yellowIsPresent;
	}

	isEnglishChar(char: string): boolean {
		const ascii = char.toUpperCase().charCodeAt(0);
		return ascii > 64 && ascii < 91;
	}
}
