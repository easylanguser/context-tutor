import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { NavController, AlertController } from '@ionic/angular';

@Component({
	selector: 'page-login',
	templateUrl: 'login.page.html',
	styleUrls: ['login.page.scss']
})
export class LoginPage implements OnInit {
	credentialsForm: FormGroup;
	submitted: boolean;

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private navCtrl: NavController,
		private alertCtrl: AlertController) { }

	get formData() {
		return this.credentialsForm.controls;
	}

	ngOnInit() {
		this.credentialsForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
			password: ['', [Validators.required, Validators.minLength(6)]]
		});
	}

	ionViewDidEnter() {
		this.toggleMenu();
	}

	toggleMenu() {
		const div = document.getElementById('sign-div');
		if (div) {
			div.focus();
		}
	}

	onSubmit() {
		this.submitted = true;
		if (this.credentialsForm.valid) {
			this.authService.register(this.credentialsForm.value).subscribe(async res => {
				if (res['already_signed_up']) {
					this.authService.login(this.credentialsForm.value).subscribe();
				} else {
					const alert = await this.alertCtrl.create({
						message: 'We have sent an email with a confirmation link to <b>' + this.credentialsForm.value.email + '</b>',
						header: 'Email confirmation',
						buttons: [{
							text: 'OK',
							handler: () => {
								this.authService.login(this.credentialsForm.value).subscribe();
							}
						}]
					});
					await alert.present();
				}
			});
		}
	}

	toForget() {
		this.navCtrl.navigateForward(['forget']);
	}
}
