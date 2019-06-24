import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { sharedText, updateIsRequired } from 'src/app/app.component';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { AddSentenceService } from 'src/app/services/http/add-sentence/add-sentence.service';
import { AddLessonService } from 'src/app/services/http/add-lesson/add-lesson.service';
import { StorageService } from 'src/app/services/storage/storage-service';
import { USER_ID_KEY } from 'src/app/services/auth/auth.service';
import { NavController, Platform } from '@ionic/angular';
import { SentenceResetService } from 'src/app/services/http/sentence-reset/sentence-reset.service';
import { Sentence } from 'src/app/models/sentence';
import { UtilsService, charForHiding, blueCharForHiding } from 'src/app/services/utils/utils.service';
import { Statistics } from 'src/app/models/statistics';

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

	constructor(
		private platform: Platform,
		private navCtrl: NavController,
		private storageService: StorageService,
		private addSentenceService: AddSentenceService,
		private addLessonService: AddLessonService,
		private route: ActivatedRoute,
		private lessonsDataService: LessonsDataService,
		private sentenceResetService: SentenceResetService,
		private utils: UtilsService) {
		platform.ready().then(() => {
			if (platform.is('android') || platform.is('ios')) {
				selectionDelay = 700;
			}
		})
		document.addEventListener('mouseup', this.showSelectionButton);
		document.addEventListener('touchstart', this.showSelectionButton);
	}

	ngOnInit() {
		document.getElementById("selectable-sentence-div").focus();
		document.getElementById("selectable-sentence-div").addEventListener("paste", (e: ClipboardEvent) => {
			e.preventDefault();
			var text = e.clipboardData.getData("text/plain");
			document.execCommand("insertText", false, text.replace(/^\s+|\s+$|\s+(?=\s)/g, ""));
		});

		this.sentenceToEditId = this.route.snapshot.queryParamMap.get('toEdit');
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));

		indexesArray = [];
		this.sentence = this.sentenceToEditId ?
			this.lessonsDataService.getSentenceByIDs(this.lessonId, Number(this.sentenceToEditId)).text :
			sharedText[0];

		this.updateTitle();

		document.getElementById("selectable-sentence-div").addEventListener("input", () => {
			indexesArray = [];
			lastSelOffsets = [0, 0];
			lastSelCoords = [0, 0];
			const allHighlights = document.getElementsByClassName('border');
			for (let i = allHighlights.length - 1; i >= 0; i--) {
				allHighlights[i].parentNode.removeChild(allHighlights[i]);
			}
		});
	}

	goBack() {
		this.navCtrl.navigateBack(['sentences-list'], { queryParams: { lessonID: this.lessonId } });
	}

	ionViewDidEnter() {
		this.updateTitle();
	}

	updateTitle() {
		this.lessonId ?
			this.title = this.lessonsDataService.getLessonByID(this.lessonId).name :
			this.title = new Date().toJSON().slice(0, 10).replace(/-/g, '/') + ' ' + sharedText[0].substr(0, 10);
	}

	editTitle() {
		this.navCtrl.navigateForward(['edit-lesson-title'], { queryParams: { lessonId: this.lessonId } });
	}

	submitSelections() {
		if (indexesArray.length === 0)
			return;

		indexesArray.sort((el1, el2) => el1[0] - el2[0]);

		const textAreaValue = document.getElementById("selectable-sentence-div").innerText;
		if (this.lessonId) { // Sentence is added to an existing lesson
			if (this.sentenceToEditId) { // Existing sentence is being edited
				this.sentenceResetService.updateData(this.sentenceToEditId, indexesArray);

				const hiddenSentence = this.utils.hideChars(textAreaValue, indexesArray, charForHiding);
				const sentencesListSentence = this.utils.hideChars(textAreaValue, indexesArray, blueCharForHiding);
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
				const text = document.getElementById("selectable-sentence-div").innerText;
				this.addSentenceService.postNewSentence({
					lessonId: this.lessonId,
					words: indexesArray,
					text: text
				}).then(newSentence => {
					this.storageService.get(USER_ID_KEY).then(userId => {
						this.createNewStatisticRecord(newSentence.id, this.lessonId, userId, indexesArray, text)
					});
				});
			}
		} else { // Sentence is added to a new lesson
			this.storageService.get(USER_ID_KEY).then(userId => {
				this.addLessonService.postNewLesson({
					userId: userId,
					name: this.title,
					url: 'someurl@url.com'
				}).then(res => {
					const newLessonId = res.id;
					this.addSentenceService.postNewSentence({
						lessonId: newLessonId,
						words: indexesArray,
						text: this.sentence
					}).then(newSentence => {
						this.createNewStatisticRecord(newSentence.id, newLessonId,
							userId, indexesArray, this.sentence);
					})
				});
			});
		}

		sharedText[0] = undefined;
		updateIsRequired[0] = true;

		this.navCtrl.navigateBack(['sentences-list'], {
			queryParams: {
				lessonID: this.lessonId
			}
		});
	}

	createNewStatisticRecord(sentenceId: number, lessonId: number,
			userId: number, words: [number, number][], text: string) {
		const charsIndexes = [];
		for (let i = 0; i < words.length; i++) {
			charsIndexes.push(0);
		}

		this.lessonsDataService.getLessonByID(lessonId).statistics.push(new Statistics(
			sentenceId, sentenceId, lessonId, userId, charsIndexes, 0,
			false, 0, 0, 0, 0, new Date().toISOString(), new Date().toISOString()
		));
	}

	showSelectionButton() {
		setTimeout(function () {
			if (window.getSelection().toString() === "") return;
			const selection: any = window.getSelection().getRangeAt(0).getClientRects()[0];
			const leftMargin: string = String(selection.x) + 'px';
			const selectBtn = <HTMLDivElement>document.getElementsByClassName("select-btn")[0];
			const btnStyle = selectBtn.style;
			btnStyle.position = 'absolute';
			btnStyle.display = 'block';
			btnStyle.marginLeft = window.innerWidth < 992 ?
				leftMargin :
				'calc(' + leftMargin + ' - 28vw)';
			btnStyle.marginTop = String(selection.y + 60) + 'px';
			selectBtn.id = btnStyle.marginTop;

			lastSelOffsets[0] = window.getSelection().getRangeAt(0).startOffset;
			lastSelOffsets[1] = window.getSelection().getRangeAt(0).endOffset;

			if (document.getElementById("selectable-sentence-div").innerText.substring(lastSelOffsets[0], lastSelOffsets[1]) !== window.getSelection().toString()) {
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
		const textArea = document.getElementById("selectable-sentence-div");
		const start = lastSelOffsets[0];
		const finish = lastSelOffsets[1];
		const sel = textArea.innerText.substring(start, finish);

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

		this.generateBorderForSelectedWord(textArea);
	}

	private generateBorderForSelectedWord(textArea: HTMLElement) {
		const border = document.createElement('div');
		const brdrStyle = border.style;
		const topMargin = String(lastSelCoords[1]) + 'px';
		brdrStyle.marginLeft = window.innerWidth < 992 ?
			String(lastSelCoords[0] - 3) + 'px' :
			'calc(' + String(lastSelCoords[0] - 3) + 'px - 28vw)';
		border.id = 'calc(' + topMargin + ' + ' + String(textArea.scrollTop) + 'px)'
		border.className = 'border';
		brdrStyle.marginTop = topMargin;
		brdrStyle.width = String(lastSelCoords[2] + 7) + 'px';
		brdrStyle.height = String(lastSelCoords[3] + 3) + 'px';
		brdrStyle.position = 'absolute';
		brdrStyle.background = 'rgba(0, 0, 255, 0.6)';
		brdrStyle.opacity = '0.4';
		brdrStyle.borderRadius = '10px';
		const borders = document.getElementsByClassName('border');
		const textAreaBonds = document.getElementById('selectable-sentence-div').getBoundingClientRect();
		document.getElementById('selectable-sentence-div').onscroll = () => {
			Array.from(borders).forEach((brdr: HTMLDivElement) => {
				brdr.style.marginTop = 'calc(' + brdr.id + ' - ' + String(textArea.scrollTop) + 'px)';
				const scrollPos = Number(brdr.style.marginTop.substr(5, brdr.style.marginTop.length - 8));
				(scrollPos > textAreaBonds.bottom - Number(brdr.style.height.substr(0, brdr.style.height.length - 2)) || scrollPos < textAreaBonds.top) ?
					brdr.style.background = 'none' :
					brdr.style.background = 'blue';
			});
			const selBtn = <HTMLDivElement>document.getElementsByClassName("select-btn")[0];
			selBtn.style.marginTop = 'calc(' + selBtn.id + ' - ' + String(textArea.scrollTop) + 'px)';
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
