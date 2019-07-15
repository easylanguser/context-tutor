import { Component, ErrorHandler } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { HttpService } from '../../services/http/rest/http.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserHttpService } from 'src/app/services/http/users/user-http.service';
import { Storage } from '@ionic/storage';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Globals } from 'src/app/services/globals/globals';

interface HTMLInputEvent extends Event {
	target: HTMLInputElement & EventTarget;
}

@Component({
	selector: 'app-account',
	templateUrl: './account.page.html',
	styleUrls: ['./account.page.scss'],
})

export class AccountPage {

	avatars: HTMLCollectionOf<HTMLImageElement>;
	userEmail: string;

	constructor(
		private userHttpService: UserHttpService,
		private authService: AuthService,
		private httpService: HttpService,
		private alertController: AlertController,
		private utils: UtilsService,
		private globals: Globals,
		private router: Router,
		private storage: Storage) { }

	ionViewDidEnter() {
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
			this.utils.createAndShowLoader('Avatar is being updated, please wait...');
			this.userHttpService.postNewAvatar(event.target.files)
				.then(_ => {
					const reader = new FileReader();
					reader.readAsDataURL(event.target.files[0]);
					reader.onloadend = () => {
						const image = String(reader.result);
						this.storage.set(this.globals.USER_AVATAR_KEY, image);
						this.avatars[0].src = image;
						this.avatars[1].src = image;
						this.utils.dismissLoader();
					}
				})
				.catch(error => {
					this.utils.showToast((error.status === 0 || error.status === 413) ?
						'Please choose picture of smaller size(< 4 Mb).' :
						error.error.msg);
					this.utils.dismissLoader();
				});
		}
	}

	openChooser() {
		document.getElementById('file-input').click();
	}

	async getInfo() {
		const avatar = await this.storage.get(this.globals.USER_AVATAR_KEY);
		if (avatar) {
			this.avatars[1].src = avatar;
		}
		
		const email = await this.storage.get(this.globals.USER_EMAIL_KEY);
		if (email) {
			this.userEmail = email;
		} else {
			const userInfo = await this.userHttpService.getUserInfo();
			this.userEmail = userInfo.email;
			this.storage.set(this.globals.USER_EMAIL_KEY, userInfo.email);
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
							.subscribe(async () => {
								return await this.authService.logout();
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
		this.authService.logout().then(() => {
			window.location.reload();
		});
	}

	showAlert(res) {
		const alert = this.alertController.create({
			message: res.msg
		});
		alert.then(alert => alert.present());
	}
}
