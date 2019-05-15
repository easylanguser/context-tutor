import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { sharedText } from 'src/app/app.component';
import { LessonsService } from 'src/app/services/lessons/lessons.service';
import { AddSentenceService } from 'src/app/services/http/add-sentence/add-sentence.service';
import { AddLessonService } from 'src/app/services/http/add-lesson/add-lesson.service';
import { StorageService } from 'src/app/services/storage/storage-service';
import { USER_ID_KEY } from 'src/app/services/auth/auth.service';
import { NavController } from '@ionic/angular';

const lastSelOffsets: Array<number> = [0, 0];
const lastSelCoords: Array<number> = [0, 0];

@Component({
	selector: 'app-sentence-adding-page',
	templateUrl: './sentence-adding-page.page.html',
	styleUrls: ['./sentence-adding-page.page.scss'],
})
export class SentenceAddingPagePage implements OnInit {

	indexesArray: Array<[number, number]> = [];
	title: string;
	sentence: string;
	lessonId: number;

	constructor(
		private navCtrl: NavController,
		private storageService: StorageService,
		private addSentenceService: AddSentenceService,
		private addLessonService: AddLessonService,
		private route: ActivatedRoute,
		private lessonsService: LessonsService) {
		document.addEventListener('mouseup', this.showSelectionButton);
		document.addEventListener('touchstart', this.showSelectionButton);
	}

	ngOnInit() {
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));
		this.updateTitle();
		this.sentence = sharedText[0];
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
		if (this.indexesArray.length === 0)
			return;
		
		this.indexesArray.sort((el1, el2) => el1[0] - el2[0]);

		if (this.lessonId) {
			this.addSentenceService.postNewSentence({
				lessonId: this.lessonId,
				words: this.indexesArray,
				text: this.sentence
			});
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
						words: this.indexesArray,
						text: this.sentence
					});
				});
			});
		}
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
			btnStyle.marginTop = String(selection.y + 50) + 'px';
			selectBtn.id = btnStyle.marginTop;

			lastSelOffsets[0] = window.getSelection().getRangeAt(0).startOffset;
			lastSelOffsets[1] = window.getSelection().getRangeAt(0).endOffset;

			lastSelCoords[0] = selection.x;
			lastSelCoords[1] = selection.y;
			lastSelCoords[2] = selection.width;
			lastSelCoords[3] = selection.height;
		}, 700);
	}

	addSelectedWord() {
		const textArea = document.getElementById("selectable-sentence-div");
		const start = lastSelOffsets[0] - 1;
		const finish = lastSelOffsets[1] - 1;
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

		for (let i = 0; i < this.indexesArray.length; i++) {
			if ((this.indexesArray[i][0] <= start &&
				this.indexesArray[i][0] + this.indexesArray[i][1] >= start) ||
				(this.indexesArray[i][0] <= finish &&
					this.indexesArray[i][0] + this.indexesArray[i][1] >= finish)) {
				return;
			}
		}
		this.indexesArray.push([start, finish - start]);

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
