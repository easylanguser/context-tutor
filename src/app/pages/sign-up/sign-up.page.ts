import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { AlertController, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-sign-up',
	templateUrl: './sign-up.page.html',
	styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
	credentialsForm: FormGroup;
	submitted: boolean;

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private alertController: AlertController,
		private navCtrl: NavController,
		private route: ActivatedRoute) { }

	get f() { return this.credentialsForm.controls; }

	ngOnInit() {
		this.credentialsForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}')]],
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

	register() {
		this.submitted = true;
		if (this.credentialsForm.valid) {
			this.authService.register(this.credentialsForm.value).subscribe(res => {
				this.showAlert(res);
				this.toSignIn();
			});
		}
	}

	showAlert(res) {
		const alert = this.alertController.create({
			message: res.msg,
			header: 'Email confirmation',
			buttons: ['OK']
		});
		alert.then(alert => alert.present());
	}

	toSignIn() {
		this.navCtrl.navigateForward(['login'], {
			queryParams: {
				email: this.credentialsForm.get('email').value,
				password: this.credentialsForm.get('password').value
			}
		});
	}
}
