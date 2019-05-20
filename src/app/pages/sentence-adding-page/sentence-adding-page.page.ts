import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { sharedText } from 'src/app/app.component';
import { LessonsService } from 'src/app/services/lessons/lessons.service';
import { AddSentenceService } from 'src/app/services/http/add-sentence/add-sentence.service';
import { AddLessonService } from 'src/app/services/http/add-lesson/add-lesson.service';
import { StorageService } from 'src/app/services/storage/storage-service';
import { USER_ID_KEY } from 'src/app/services/auth/auth.service';
import { NavController, Platform } from '@ionic/angular';
import { SentenceResetService } from 'src/app/services/http/sentence-reset/sentence-reset.service';

let lastSelOffsets: Array<number> = [];
let lastSelCoords: Array<number> = [];
let indexesArray: Array<[number, number]> = [];
let selectionDelay: number = 0;

@Component({
	selector: 'app-sentence-adding-page',
	templateUrl: './sentence-adding-page.page.html',
	styleUrls: ['./sentence-adding-page.page.scss'],
})
export class SentenceAddingPagePage implements OnInit {

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
		private lessonsService: LessonsService,
		private sentenceResetService: SentenceResetService) {
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

		this.sentence = this.sentenceToEditId ?
			this.lessonsService.getSentenceByIDs(this.lessonId, Number(this.sentenceToEditId)).text :
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
		this.navCtrl.pop();
	}

	ionViewDidEnter() {
		this.updateTitle();
	}

	updateTitle() {
		this.lessonId ?
			this.title = this.lessonsService.getLessonByID(this.lessonId).name :
			this.title = new Date().toJSON().slice(0, 10).replace(/-/g, '/') + ' ' + sharedText[0].substr(0, 10);
	}

	editTitle() {
		this.navCtrl.navigateForward(['edit-lesson-title'], { queryParams: { lessonId: this.lessonId } });
	}

	submitSelections() {
		if (indexesArray.length === 0)
			return;

		indexesArray.sort((el1, el2) => el1[0] - el2[0]);

		if (this.lessonId) {
			if (this.sentenceToEditId) {
				this.sentenceResetService.updateData(this.sentenceToEditId, indexesArray);
			} else {
				this.addSentenceService.postNewSentence({
					lessonId: this.lessonId,
					words: indexesArray,
					text: document.getElementById("selectable-sentence-div").innerText
				});
			}
		} else {
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
					});
				});
			});
		}
		sharedText[0] = undefined;
		this.navCtrl.navigateForward(['lessons-list']);
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
			const charAtPos = char.charCodeAt(0);
			if (!((charAtPos > 64 && charAtPos < 91) || (charAtPos > 96 && charAtPos < 123) || charAtPos === 39)) {
				return;
			}
		}

		for (let i = 0; i < indexesArray.length; i++) {
			if ((indexesArray[i][0] <= start &&
				indexesArray[i][0] + indexesArray[i][1] >= start) ||
				(indexesArray[i][0] <= finish &&
					indexesArray[i][0] + indexesArray[i][1] >= finish)) {
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
		brdrStyle.width = String(lastSelCoords[2] + 6) + 'px';
		brdrStyle.height = String(lastSelCoords[3] + 3) + 'px';
		brdrStyle.position = 'absolute';
		brdrStyle.background = 'blue';
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
		document.getElementsByTagName('app-sentence-adding-page')[0].appendChild(border);
	}
}
