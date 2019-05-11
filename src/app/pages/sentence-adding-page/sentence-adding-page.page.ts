import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { sharedText } from 'src/app/app.component';
import { LessonsService } from 'src/app/services/lessons/lessons.service';

@Component({
	selector: 'app-sentence-adding-page',
	templateUrl: './sentence-adding-page.page.html',
	styleUrls: ['./sentence-adding-page.page.scss'],
})
export class SentenceAddingPagePage implements OnInit {

	indexesArray: Array<[number, number]> = [];
	title: string;
	sentence: string;

	constructor(
		private route: ActivatedRoute,
		private lessonsService: LessonsService) {
		document.addEventListener('mouseup', this.showSelectionButton);
		document.addEventListener('touchstart', this.showSelectionButton);
	}

	showSelectionButton(event?: any) {
		setTimeout(() => {
			if (window.getSelection().toString() === "") return;
			if (document.getElementById('select-btn')) {
				document.getElementById('select-btn').remove();
			}
			const selection: any = window.getSelection().getRangeAt(0).getClientRects()[0];
			const selectBtn = document.createElement('div');
			const style = selectBtn.style;
			selectBtn.id = 'select-btn';
			selectBtn.innerHTML = '<ion-icon name="add"></ion-icon>';
			style.cursor = 'pointer';
			style.textAlign = 'center';
			style.fontSize = '50px';
			style.color = 'white';
			style.backgroundColor = '#7dddff';
			style.height = '50px';
			style.width = '50px';
			style.borderRadius = '25px';
			style.outline = 'none';
			style.position = 'absolute';
			style.marginLeft = String(selection.x) + 'px';
			style.marginTop = String(selection.y + 50) + 'px';
			selectBtn.addEventListener('click', this.addSelectedWord, false);
			document.body.appendChild(selectBtn);
		}, 700);
	}

	addSelectedWord() {
		const area = <HTMLTextAreaElement>document.getElementById("selectable-sentence-div").lastChild;
		const start = area.selectionStart;
		const finish = area.selectionEnd;
		const sel = area.value.substring(start, finish);

		if (finish <= start) {
			return;
		}

		for (const char of sel) {
			const charAtPos = char.charCodeAt(0);
			if (!((charAtPos > 64 && charAtPos < 91) || (charAtPos > 96 && charAtPos < 123))) {
				return;
			}
		}

		for (let i = 0; i < this.indexesArray.length; i++) {
			if ((this.indexesArray[i][0] <= start && this.indexesArray[i][0] + this.indexesArray[i][1] >= start) ||
				(this.indexesArray[i][0] <= finish && this.indexesArray[i][0] + this.indexesArray[i][1] >= finish)) {
				return;
			}
		}
		this.indexesArray.push([start, finish - start]);
	}

	ngOnInit() {
		const lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));
		if (lessonId) {
			this.title = this.lessonsService.getLessonByID(lessonId).name;
		} else {
			this.title = new Date().toJSON().slice(0, 10).replace(/-/g, '/') + ' ' + sharedText[0].substr(0, 10);
		}
		this.sentence = sharedText[0];
	}
}
