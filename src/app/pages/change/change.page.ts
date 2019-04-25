import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpService } from "../../services/http/rest/http.service";
import { AlertController } from "@ionic/angular";
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-change',
	templateUrl: './change.page.html',
	styleUrls: ['./change.page.scss'],
})
export class ChangePage implements OnInit {

	credentialsForm: FormGroup;
	submitted: boolean;

	constructor(private formBuilder: FormBuilder,
		private router: Router, private httpService: HttpService, private alertController: AlertController) {
	}

	get f() {
		return this.credentialsForm.controls;
	}

	ngOnInit() {
		this.credentialsForm = this.formBuilder.group({
			oldPassword: ['', [Validators.required, Validators.minLength(6)]],
			newPassword: ['', [Validators.required, Validators.minLength(6)]],
			passwordConfirm: ['', [Validators.required, Validators.minLength(6)]]
		});
	}

	changePassword() {
		this.submitted = true;
		if (this.credentialsForm.valid) {
			this.httpService.doPost(environment.url + '/api/user/changePassword', this.credentialsForm.value).subscribe(res => {
				this.showAlert(res);
			});
		}
	}

	showAlert(res) {
		let alert = this.alertController.create({
			message: res.msg,
			header: 'Change password',
			buttons: ['OK']
		});
		alert.then(alert => alert.present());
	}

	toSignUp() { }
}
