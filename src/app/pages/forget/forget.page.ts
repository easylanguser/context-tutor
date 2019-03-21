import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/http/user/user-service';
import { AlertController } from '@ionic/angular';

@Component({
	selector: 'app-forget',
	templateUrl: './forget.page.html',
	styleUrls: ['./forget.page.scss'],
})
export class ForgetPage implements OnInit {

	credentialsForm: FormGroup;
	submitted: boolean;

	constructor(private formBuilder: FormBuilder, private UserService: UserService,
		private router: Router, private alertController: AlertController) { }

	get f() { return this.credentialsForm.controls; }

	ngOnInit() {
		this.credentialsForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]]
		});
	}

	onSubmit() {
		this.submitted = true;
		if (this.credentialsForm.valid) {
			this.UserService.sendPassResetRequest(this.credentialsForm.value).subscribe(res => {
				this.showAlert(res);
			})
		}
	}

	toSignUp() {
		this.router.navigate(['sign-up']);
	}

	showAlert(res) {
		let alert = this.alertController.create({
			message: res.msg,
			header: 'Email confirmation',
			buttons: ['OK']
		});
		alert.then(alert => alert.present());
	}
}
