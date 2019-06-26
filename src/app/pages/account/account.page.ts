import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { HttpService } from '../../services/http/rest/http.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/http/user/user-service';
import { StorageService } from 'src/app/services/storage/storage-service';
import { UploadAvatarService } from 'src/app/services/http/upload-avatar/upload-avatar.service';

interface HTMLInputEvent extends Event {
	target: HTMLInputElement & EventTarget;
}

export const USER_AVATAR_KEY = 'user-avatar';
export const USER_EMAIL_KEY = 'user-email';

@Component({
	selector: 'app-account',
	templateUrl: './account.page.html',
	styleUrls: ['./account.page.scss'],
})

export class AccountPage implements OnInit {

	avatars: HTMLCollectionOf<HTMLImageElement>;
	userEmail: string;

	constructor(
		private userService: UserService,
		private authService: AuthService,
		private httpService: HttpService,
		private alertController: AlertController,
		private router: Router,
		private storage: StorageService,
		private uploadAvatarService: UploadAvatarService) { }

	ngOnInit() {
		this.avatars = <HTMLCollectionOf<HTMLImageElement>>(document.getElementsByClassName('avatar'));

		this.checkTokenAndGetInfo();
		this.addAvatarClickHandler();
	}

	private async checkTokenAndGetInfo() {
		if (!this.authService.token) {
			await this.authService.checkToken()
		}
		this.getInfo();
	}

	private addAvatarClickHandler() {
		document.getElementById('file-input').onchange = (event: HTMLInputEvent) => {
			this.uploadAvatarService.postNewAvatar(event.target.files);
			var reader = new FileReader();
			reader.readAsDataURL(event.target.files[0]);
			reader.onloadend = () => {
				const image = String(reader.result);
				this.storage.set(USER_AVATAR_KEY, image);
				this.avatars[0].src = image;
				this.avatars[1].src = image;
			}
		}
	}

	openChooser() {
		document.getElementById('file-input').click();
	}

	async getInfo() {
		const email = await this.storage.get(USER_EMAIL_KEY);
		if (email) {
			this.userEmail = email;
		} else {
			const userInfo = await this.userService.getUserInfo();
			this.userEmail = userInfo.email;
			this.storage.set(USER_EMAIL_KEY, userInfo.email);
		}

		const avatar = await this.storage.get(USER_AVATAR_KEY);
		if (avatar) {
			this.avatars[1].src = avatar;
		}
	}

	async deleteAccount() {
		const alert = await this.alertController.create({
			message: 'Are you sure you want to delete your account?',
			inputs: [
				{

					placeholder: 'You password',
					name: 'password',

				}],
			buttons: [
				{
					text: 'Delete',
					handler: (data) => {
						alert.dismiss(true);
						this.httpService.doPost(environment.url + '/api/user/deleteAccount', data)
							.subscribe(() => {
								return this.authService.logout();
							}, err => {
								this.showAlert(err.error)
							})
					}
				}, {
					text: 'Cancel',
					handler: () => {
						alert.dismiss(false);
						return false;
					}
				}
			]
		}
		)
		return await alert.present();
	}

	changePassword() {
		this.router.navigate(['change']);
	}


	logout() {
		this.authService.logout();
	}

	showAlert(res) {
		const alert = this.alertController.create({
			message: res.msg
		});
		alert.then(alert => alert.present());
	}
}
