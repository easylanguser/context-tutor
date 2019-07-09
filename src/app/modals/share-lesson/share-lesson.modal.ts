import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { UserHttpService } from 'src/app/services/http/users/user-http.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
	selector: 'share-lesson-modal',
	templateUrl: './share-lesson.modal.html',
	styleUrls: ['./share-lesson.modal.scss']
})
export class ShareLessonModal implements OnInit {

	lessonId: number;
	usersAreLoaded: boolean = false;
	allUsers: { email: string, avatar: SafeUrl }[] = [];
	users: { email: string, avatar: SafeUrl }[] = [];

	constructor(
		private navParams: NavParams,
		private userHttpService: UserHttpService,
		private utils: UtilsService,
		private modalController: ModalController,
		private sanitizer : DomSanitizer) {
		this.lessonId = Number(navParams.get('lessonId'));
	}

	ngOnInit() {
		this.userHttpService.getAllUsers()
			.then(async res => {
				const resLength = res.length;
				var reader = new FileReader();
				for (let user of res) {
					let avatar;
					if (user.has_avatar) {
						avatar = await this.userHttpService.getAvatar(user.id);
					}
					if (!avatar || avatar.size <= 19) {
						avatar = 'assets/img/account_icon.svg';
						this.pushUsers(user.email, avatar, resLength);
					} else {
						reader.readAsDataURL(avatar);
						reader.onloadend = () => {
							avatar = this.sanitizer.bypassSecurityTrustUrl(String(reader.result));
							this.pushUsers(user.email, avatar, resLength);
						}
					}
				}
			})
			.catch(error => {
				this.utils.showToast('Failed to load users list');
				this.usersAreLoaded = true;
			});
	}

	private pushUsers(email: string, avatar: SafeUrl, resLength: number) {
		this.users.push({
			email: email,
			avatar: avatar
		});
		this.allUsers.push({
			email: email,
			avatar: avatar
		});

		if (this.users.length === resLength && this.allUsers.length === resLength) {
			this.users.sort((user1, user2) => user1.email.localeCompare(user2.email));
			this.allUsers.sort((user1, user2) => user1.email.localeCompare(user2.email));
			this.usersAreLoaded = true;
		}
	}

	filterUsers(event: CustomEvent) {
		const filter = event.detail.value.toLowerCase();
		this.users = this.allUsers.filter(user => {
			return user.email.toLowerCase().indexOf(filter) >= 0;
		});
	}

	dismissModal() {
		this.modalController.dismiss(/* params to return */);
	}
}
