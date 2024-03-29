import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { NavController, AlertController } from '@ionic/angular';
import { trigger, transition, style, animate } from '@angular/animations';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: 'page-login',
	templateUrl: 'login.page.html',
	styleUrls: ['login.page.scss'],
	animations: [
		trigger(
			'enterAnimation', [
				transition(':enter', [
					style({ opacity: 0 }),
					animate('500ms', style({ opacity: 1 }))
				]),
				transition(':leave', [
					style({ opacity: 1 }),
					animate('500ms', style({ opacity: 0 }))
				])
			]
		)
	]
})
export class LoginPage implements OnInit {
	credentialsForm: FormGroup;
	submitted: boolean;

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private navController: NavController,
		private utils: UtilsService) { }

	get formData() {
		return this.credentialsForm.controls;
	}

	ngOnInit() {
		this.credentialsForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
			password: ['', [Validators.required, Validators.minLength(6)]]
		});
	}

	togglePasswordVisibility() {
		const input = document.getElementById('password-input');
		const button = document.getElementById('lock-icon');
		if (input.hasAttribute('type')) {
			input.removeAttribute('type');
			button.setAttribute('name', 'eye-off');
		} else {
			input.setAttribute('type', 'password');
			button.setAttribute('name', 'eye');
		}
	}

	onSubmit() {
		this.submitted = true;
		if (this.credentialsForm.valid) {
			this.authService.register(this.credentialsForm.value).subscribe(async res => {
				if (res['already_signed_up']) {
					this.authService.login(this.credentialsForm.value).subscribe();
				} else {
					this.utils.showToast('We\'ve sent a confirmation link to <b>' +
						this.credentialsForm.value.email + '</b>.<br>But you can already start using EasyLang!');
					this.authService.login(this.credentialsForm.value).subscribe();
					/* const alert = await this.alertController.create({
						message: 'We have sent an email with a confirmation link to <b>' + this.credentialsForm.value.email + '</b>',
						header: 'Email confirmation',
						buttons: [{
							text: 'OK',
							handler: () => {
								this.authService.login(this.credentialsForm.value).subscribe();
							}
						}]
					});
					await alert.present(); */
				}
			});
		}
	}

	toForget() {
		this.navController.navigateForward(['forget']);
	}
}
