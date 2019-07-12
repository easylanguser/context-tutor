import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserHttpService } from 'src/app/services/http/users/user-http.service';
import { Globals } from 'src/app/services/globals/globals';

@Component({
	selector: 'app-shared-lessons-list',
	templateUrl: './shared-lessons-list.modal.html',
	styleUrls: ['./shared-lessons-list.modal.scss']
})
export class SharedLessonsListModal {

	sharesToUnmark: number = 0;

	constructor(
		private userHttpService: UserHttpService,
		private modalController: ModalController,
		private globals: Globals) {	}

	updateShare(lessonId: number, status: number) {
		const index = this.globals.unmarkedSharedLessons.findIndex(
			lesson => lesson.lessonId === lessonId
		);
		this.globals.unmarkedSharedLessons.splice(index, 1);
		this.globals.sharesToUnmark++;
		this.userHttpService.updateShareStatus(lessonId, status).then(() => {
			if (!this.globals.unmarkedSharedLessons.length) {
				this.dismissModal();
			}
		});
	}

	dismissModal() {
		this.modalController.dismiss();
	}
}
