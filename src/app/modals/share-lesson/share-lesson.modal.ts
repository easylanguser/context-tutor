import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { UserHttpService } from 'src/app/services/http/users/user-http.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
	selector: 'share-lesson-modal',
	animations: [
		trigger(
			'enterAnimation', [
				transition(':enter', [
					style({ opacity: 0 }),
					animate('700ms', style({ opacity: 1 }))
				]),
				transition(':leave', [
					style({ opacity: 1 }),
					animate('700ms', style({ opacity: 0 }))
				])
			]
		)
	],
	templateUrl: './share-lesson.modal.html',
	styleUrls: ['./share-lesson.modal.scss']
})
export class ShareLessonModal implements OnInit {

	lessonId: number;
	usersAreLoaded: boolean = false;
	allUsers: { id: number, email: string, avatar: SafeUrl }[] = [];
	users: { id: number, email: string, avatar: SafeUrl }[] = [];

	constructor(
		private navParams: NavParams,
		private userHttpService: UserHttpService,
		private utils: UtilsService,
		private modalController: ModalController,
		private sanitizer: DomSanitizer) {
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
						this.pushUsers(user, avatar, resLength);
					} else {
						reader.readAsDataURL(avatar);
						reader.onloadend = () => {
							avatar = this.sanitizer.bypassSecurityTrustUrl(String(reader.result));
							this.pushUsers(user, avatar, resLength);
						}
					}
				}
			})
			.catch(error => {
				this.utils.showToast('Failed to load users list');
				this.usersAreLoaded = true;
			});
	}

	private pushUsers(user: any, avatar: SafeUrl, resLength: number) {
		this.users.push({
			id: user.id,
			email: user.email,
			avatar: avatar
		});
		this.allUsers.push({
			id: user.id,
			email: user.email,
			avatar: avatar
		});

		if (this.users.length === resLength && this.allUsers.length === resLength) {
			this.users.sort((user1, user2) => user1.email.localeCompare(user2.email));
			this.allUsers.sort((user1, user2) => user1.email.localeCompare(user2.email));
			this.usersAreLoaded = true;
		}
	}

	sendShareRequest (user: any) {
		this.userHttpService.sendShareRequest(user.id, this.lessonId);
		this.dismissModal();
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
