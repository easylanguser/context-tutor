import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { UserHttpService } from 'src/app/services/http/users/user-http.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: 'share-lesson-modal',
	templateUrl: './share-lesson.modal.html',
	styleUrls: ['./share-lesson.modal.scss']
})
export class ShareLessonModal implements OnInit {

	lessonId: number;
	usersAreLoaded: boolean = false;
	allUsers: { email: string }[];
	users: { email: string }[];

	constructor(
		private navParams: NavParams,
		private userHttpService: UserHttpService,
		private utils: UtilsService,
		private modalController: ModalController) {
		this.lessonId = Number(navParams.get('lessonId'));
	}

	ngOnInit() {
		this.userHttpService.getAllUsers()
			.then(res => {
				this.users = res;
				this.allUsers = [...this.users];
				this.usersAreLoaded = true;
			})
			.catch(error => {
				this.utils.showToast('Failed to load users list');
				this.usersAreLoaded = true;
			});
	}

	filterUsers(event: CustomEvent) {
		const filter = event.detail.value.toLowerCase();
		this.users = this.allUsers.filter(user => user.email.toLowerCase().indexOf(filter) >= 0);
	}

	dismissModal() {
		this.modalController.dismiss(/* params to return */);
	}
}
