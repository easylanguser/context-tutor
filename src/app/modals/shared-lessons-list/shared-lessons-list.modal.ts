import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { LessonHttpService } from 'src/app/services/http/lessons/lesson-http.service';
import { UserHttpService } from 'src/app/services/http/users/user-http.service';

 

@Component({
	selector: 'app-shared-lessons-list',
	templateUrl: './shared-lessons-list.modal.html',
	styleUrls: ['./shared-lessons-list.modal.scss']
})
export class SharedLessonsListModal implements OnInit {

	shownSharedLessons: { userEmail: string, lessonName: string, lessonId: number }[] = [];

	constructor(
		private navParams: NavParams,
		private lessonHttpService: LessonHttpService,
		private userHttpService: UserHttpService,
		private modalController: ModalController) { }

	ngOnInit() {
		for (let lesson of this.navParams.get('sharedLessons')) {
			this.lessonHttpService.getLessonAndUserInfoByLessonId(lesson[0]).then(info => {
				this.shownSharedLessons.push({
					userEmail: info.userEmail,
					lessonName: info.lessonTitle,
					lessonId: lesson[0]
				});
			});
		}
	}

	updateShare(lessonId: number, status: number) {
		this.userHttpService.updateShareStatus(lessonId, status);
		const index = this.shownSharedLessons.findIndex(lesson => lesson.lessonId === lessonId);
		this.shownSharedLessons.splice(index, 1);
	}

	dismissModal() {
		this.modalController.dismiss(/* params to return */);
	}
}
