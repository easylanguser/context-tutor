import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { HttpService } from '../../services/http/rest/http.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserHttpService } from 'src/app/services/http/users/user-http.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Globals } from 'src/app/services/globals/globals';
import { DomSanitizer } from '@angular/platform-browser';
import { StorageService } from 'src/app/services/storage/storage.service';

interface HTMLInputEvent extends Event {
	target: HTMLInputElement & EventTarget;
}

@Component({
	selector: 'app-account',
	templateUrl: './account.page.html',
	styleUrls: ['./account.page.scss'],
})

export class AccountPage {


	constructor(
		private userHttpService: UserHttpService,
		private authService: AuthService,
		private httpService: HttpService,
		private alertController: AlertController,
		private utils: UtilsService,
		private sanitizer: DomSanitizer,
		private router: Router,
		private storage: StorageService,
		public globals: Globals) { }

	ngOnInit() {
		this.checkTokenAndGetInfo();
	}

	private async checkTokenAndGetInfo() {
		if (!this.authService.token) {
			await this.authService.checkToken()
		}
	}

	avatarClickHandler(event: HTMLInputEvent) {
		this.utils.createAndShowLoader('Avatar is being updated, please wait...');
		this.userHttpService.postNewAvatar(event.target.files)
			.then(() => {
				const reader = new FileReader();
				reader.readAsDataURL(event.target.files[0]);
				reader.onloadend = () => {
					const image = String(reader.result);
					this.storage.set(this.globals.USER_AVATAR_KEY, image);
					this.globals.userAvatar = this.sanitizer.bypassSecurityTrustUrl(image);
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
								this.authService.authenticationState.next(false);
							}, err => {
								this.showAlert(err.error);
							});
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
		this.authService.authenticationState.next(false);
	}

	showAlert(res) {
		const alert = this.alertController.create({
			message: res.msg
		});
		alert.then(alert => alert.present());
	}
}
