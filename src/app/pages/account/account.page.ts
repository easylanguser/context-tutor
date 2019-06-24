import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { HttpService } from '../../services/http/rest/http.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/http/user/user-service';

@Component({
	selector: 'app-account',
	templateUrl: './account.page.html',
	styleUrls: ['./account.page.scss'],
})

export class AccountPage implements OnInit {

	userEmail: string;

	constructor(
		private userService: UserService,
		private authService: AuthService,
		private httpService: HttpService,
		private alertController: AlertController,
		private router: Router) { }

	ngOnInit() {
		if (this.authService.token) {
			this.getInfo();
		} else {
			this.authService.checkToken().then(() => {
				this.getInfo();
			});
		}
	}

	async getInfo(token?: any) {
		const userInfo = await this.userService.getUserInfo();
		this.userEmail = userInfo.email;
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
							.subscribe(res => {
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
