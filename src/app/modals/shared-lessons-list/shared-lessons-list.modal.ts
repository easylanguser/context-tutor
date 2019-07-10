import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { LessonHttpService } from 'src/app/services/http/lessons/lesson-http.service';

@Component({
	selector: 'app-shared-lessons-list',
	templateUrl: './shared-lessons-list.modal.html',
	styleUrls: ['./shared-lessons-list.modal.scss']
})
export class SharedLessonsListModal implements OnInit {

	sharedLesson: any[];
	shownSharedLessons: any[] = [];

	constructor(
		private navParams: NavParams,
		private lessonHttpService: LessonHttpService) {
		this.sharedLesson = navParams.get('sharedLessons');
		for (let lesson of this.sharedLesson) {
			this.lessonHttpService.getLessonAndUserInfoByLessonId(lesson[0]).then(info => {
				this.shownSharedLessons.push(info);
			});
		}
	}

	ngOnInit() {
	}

}
