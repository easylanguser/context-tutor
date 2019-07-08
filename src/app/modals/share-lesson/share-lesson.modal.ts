import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
	selector: 'share-lesson-modal',
	templateUrl: './share-lesson.modal.html',
	styleUrls: ['./share-lesson.modal.scss']
})
export class ShareLessonModal {

	lessonId: number;
	usersAreLoaded: boolean = false;

	constructor(navParams: NavParams) {
		this.lessonId = Number(navParams.get('lessonId'));
	}
}
