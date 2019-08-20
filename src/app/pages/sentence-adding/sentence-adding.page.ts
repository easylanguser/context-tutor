import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { NavController } from '@ionic/angular';
import { Sentence } from 'src/app/models/sentence';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { SentenceHttpService } from 'src/app/services/http/sentences/sentence-http.service';
import { LessonHttpService } from 'src/app/services/http/lessons/lesson-http.service';
import { Globals } from 'src/app/services/globals/globals';

let lastSelOffsets: Array<number> = [];
let lastSelCoords: Array<number> = [];
let indexesArray: Array<[number, number]> = [];
let selectionDelay: number = 0;

@Component({
	selector: 'app-sentence-adding',
	templateUrl: './sentence-adding.page.html',
	styleUrls: ['./sentence-adding.page.scss'],
})
export class SentenceAddingPage implements OnInit {

	title: string;
	sentence: string;
	lessonId: number;
	sentenceToEditId: string;
	textArea: HTMLElement;

	constructor(
		private navController: NavController,
		private sentenceHttpService: SentenceHttpService,
		private lessonHttpService: LessonHttpService,
		private route: ActivatedRoute,
		private lessonsDataService: LessonsDataService,
		private utils: UtilsService,
		public globals: Globals) {
		if (this.globals.platformName === 'android' ||
			this.globals.platformName === 'ios') {
			selectionDelay = 700;
		}
	}

	ngOnInit() {
		this.textArea = document.getElementById('selectable-sentence-div');
		this.sentenceToEditId = this.route.snapshot.queryParamMap.get('toEdit');
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));

		indexesArray = [];
		this.sentence = this.sentenceToEditId ?
			this.lessonsDataService.getSentenceByIds(this.lessonId, Number(this.sentenceToEditId)).text :
			this.globals.sharedText;

		this.updateTitle();
	}

	goBack() {
		this.navController.navigateBack(['sentences-list'], { queryParams: { lessonId: this.lessonId } });
	}

	ionViewDidEnter() {
		this.updateTitle();
	}

	formatInsertedText(event: ClipboardEvent) {
		event.preventDefault();
		const text = event.clipboardData.getData("text/plain");
		document.execCommand("insertText", false, text.replace(/^\s+|\s+$|\s+(?=\s)/g, ""));
	}

	removeHighlights() {
		indexesArray = [];
		lastSelOffsets = [0, 0];
		lastSelCoords = [0, 0];
		const allHighlights = document.getElementsByClassName('border');
		for (let i = allHighlights.length - 1; i >= 0; i--) {
			allHighlights[i].parentNode.removeChild(allHighlights[i]);
		}
	}

	updateTitle() {
		this.lessonId ?
			this.title = this.lessonsDataService.getLessonById(this.lessonId).name :
			this.title = new Date().toJSON().slice(0, 10).replace(/-/g, '/') +
			' ' + this.globals.sharedText.substr(0, 10);
	}

	editTitle() {
		this.navController.navigateForward(['edit-lesson-title'], { queryParams: { lessonId: this.lessonId } });
	}

	async submitSelections() {
		if (indexesArray.length === 0)
			return;

		indexesArray.sort((el1, el2) => el1[0] - el2[0]);

		const textAreaValue = this.textArea.innerText;
		if (this.lessonId) { // Sentence is added to an existing lesson
			if (this.sentenceToEditId) { // Existing sentence is being edited
				this.sentenceHttpService.updateSentenceWords(this.sentenceToEditId, indexesArray, textAreaValue);

				const hiddenSentence = this.utils.hideChars(textAreaValue, indexesArray, this.globals.charForHiding);
				const sentencesListSentence = this.utils.hideChars(textAreaValue, indexesArray, this.globals.blueCharForHiding);
				const hiddenChars: Array<string[]> = [];
				const curCharsIndexes: number[] = [];
				for (const j in indexesArray) {
					const chars: string[] = [];
					for (let k = 0; k < indexesArray[j][1]; k++) {
						chars.push(textAreaValue.charAt(indexesArray[j][0] + k));
					}
					hiddenChars.push(chars);
					curCharsIndexes.push(0);
				}
				this.lessonsDataService.editSentence(this.lessonId,
					new Sentence(
						Number(this.sentenceToEditId),
						this.lessonId,
						indexesArray,
						textAreaValue,
						hiddenSentence,
						hiddenChars,
						sentencesListSentence,
						new Date().toISOString(),
						new Date().toISOString()));
			} else {
				const newSentence = await this.sentenceHttpService.postNewSentence({
					lessonId: this.lessonId,
					words: indexesArray,
					text: this.textArea.innerText
				});
				this.lessonsDataService.createNewStatisticRecord(
					newSentence.id,
					this.lessonId,
					this.globals.userId
				);
			}
		} else { // Sentence is added to a new lesson
			const res = await this.lessonHttpService.postNewLesson({
				userId: this.globals.userId,
				name: this.title,
				url: 'http://easy4learn.com/tutor'
			});
			const newLessonId = res.id;
			const newSentence = await this.sentenceHttpService.postNewSentence({
				lessonId: newLessonId,
				words: indexesArray,
				text: this.sentence
			});
			this.lessonsDataService.createNewStatisticRecord(
				newSentence.id,
				newLessonId,
				this.globals.userId
			);
		}

		this.globals.sharedText = null;
		this.globals.updateIsRequired = true;

		this.navController.navigateBack(['sentences-list'], {
			queryParams: {
				lessonId: this.lessonId
			}
		});
	}

	showSelectionButton() {
		setTimeout(() => {
			if (window.getSelection().toString() === "") return;
			const selection: any = window.getSelection().getRangeAt(0).getClientRects()[0];
			const left: string = String(selection.x) + 'px';
			const selectBtn = <HTMLDivElement>document.getElementsByClassName("select-btn")[0];
			const btnStyle = selectBtn.style;
			btnStyle.position = 'absolute';
			btnStyle.display = 'block';
			btnStyle.left = window.innerWidth < 992 ?
				left :
				'calc(' + left + ' - 28vw)';
			btnStyle.top = String(selection.y + 60) + 'px';
			selectBtn.id = btnStyle.top;

			lastSelOffsets[0] = window.getSelection().getRangeAt(0).startOffset;
			lastSelOffsets[1] = window.getSelection().getRangeAt(0).endOffset;

			if (this.textArea.innerText.substring(lastSelOffsets[0], lastSelOffsets[1]) !== window.getSelection().toString()) {
				--lastSelOffsets[0];
				--lastSelOffsets[1];
			}

			lastSelCoords[0] = selection.x;
			lastSelCoords[1] = selection.y;
			lastSelCoords[2] = selection.width;
			lastSelCoords[3] = selection.height;
		}, selectionDelay);
	}

	addSelectedWord() {
		const start = lastSelOffsets[0];
		const finish = lastSelOffsets[1];
		const sel = this.textArea.innerText.substring(start, finish);

		if (finish <= start) {
			return;
		}

		for (const char of sel) {
			if (!(this.utils.isEnglishChar(char))) {
				return;
			}
		}

		for (let i = 0; i < indexesArray.length; i++) {
			if ((indexesArray[i][0] <= start && indexesArray[i][0] + indexesArray[i][1] >= start) ||
				(indexesArray[i][0] <= finish && indexesArray[i][0] + indexesArray[i][1] >= finish)) {
				return;
			}
		}
		indexesArray.push([start, finish - start]);

		this.generateBorderForSelectedWord();
	}

	private generateBorderForSelectedWord() {
		const border = document.createElement('div');
		const brdrStyle = border.style;
		const topMargin = String(lastSelCoords[1]) + 'px';
		brdrStyle.marginLeft = window.innerWidth < 992 ?
			String(lastSelCoords[0] - 3) + 'px' :
			'calc(' + String(lastSelCoords[0] - 3) + 'px - 28vw)';
		border.id = 'calc(' + topMargin + ' + ' + String(this.textArea.scrollTop) + 'px)'
		border.className = 'border';
		brdrStyle.marginTop = topMargin;
		brdrStyle.width = String(lastSelCoords[2] + 7) + 'px';
		brdrStyle.height = String(lastSelCoords[3] + 3) + 'px';
		brdrStyle.position = 'absolute';
		brdrStyle.background = 'rgba(0, 0, 255, 0.6)';
		brdrStyle.opacity = '0.4';
		brdrStyle.borderRadius = '10px';
		const borders = document.getElementsByClassName('border');
		const textAreaBonds = this.textArea.getBoundingClientRect();
		this.textArea.onscroll = () => {
			Array.from(borders).forEach((brdr: HTMLDivElement) => {
				brdr.style.marginTop = 'calc(' + brdr.id + ' - ' + String(this.textArea.scrollTop) + 'px)';
				const scrollPos = Number(brdr.style.marginTop.substr(5, brdr.style.marginTop.length - 8));
				(scrollPos > textAreaBonds.bottom - Number(brdr.style.height.substr(0, brdr.style.height.length - 2)) || scrollPos < textAreaBonds.top) ?
					brdr.style.background = 'none' :
					brdr.style.background = 'blue';
			});
			const selBtn = <HTMLDivElement>document.getElementsByClassName("select-btn")[0];
			selBtn.style.marginTop = 'calc(' + selBtn.id + ' - ' + String(this.textArea.scrollTop) + 'px)';
			const scrollPos = Number(selBtn.style.marginTop.substr(5, selBtn.style.marginTop.length - 8));
			(scrollPos > textAreaBonds.bottom || scrollPos < textAreaBonds.top) ?
				selBtn.style.display = 'none' :
				selBtn.style.display = 'block';
		};
		document.getElementsByTagName('app-sentence-adding')[0].appendChild(border);
	}

	ngOnDestroy() {
		document.removeEventListener('mouseup', this.showSelectionButton);
		document.removeEventListener('touchstart', this.showSelectionButton);
	}
}
