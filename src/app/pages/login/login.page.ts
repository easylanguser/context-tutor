import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { NavController } from '@ionic/angular';

@Component({
	selector: 'page-login',
	templateUrl: 'login.page.html',
	styleUrls: ['../sign-up/sign-up.page.scss'],
})
export class LoginPage implements OnInit {
	credentialsForm: FormGroup;
	submitted: boolean;

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private navCtrl: NavController,
		private route: ActivatedRoute) { }

	get f() { return this.credentialsForm.controls; }

	ngOnInit() {
		this.credentialsForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
			password: ['', [Validators.required, Validators.minLength(6)]]
		});
	}

	ionViewDidEnter() {
		const typedEmail = this.route.snapshot.queryParamMap.get('email');
		const typedPassword = this.route.snapshot.queryParamMap.get('password');
		if (typedEmail && typedPassword) {
			this.credentialsForm.setValue({
				email: typedEmail,
				password: typedPassword
			});
		}
	}

	onSubmit() {
		this.submitted = true;
		if (this.credentialsForm.valid) {
			this.authService.login(this.credentialsForm.value).subscribe();
		}
	}

	register() {
		this.submitted = true;
		if (this.credentialsForm.valid) {
			this.authService.register(this.credentialsForm.value).subscribe(() => {
				this.authService.login(this.credentialsForm.value).subscribe();
			});
		}
	}

	goToSignUp() {
		this.navCtrl.navigateForward(['sign-up'], {
			queryParams: {
				email: this.credentialsForm.get('email').value,
				password: this.credentialsForm.get('password').value
			}
		});
	}

	toForget() {
		this.navCtrl.navigateForward(['forget']);
	}
}
