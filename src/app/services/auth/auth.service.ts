import { AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap, catchError } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Globals } from '../globals/globals';
import { StorageService } from '../storage/storage.service';

interface AuthData {
	token: string,
	id: number,
	email: string
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	url = environment.url;
	authenticationState = new BehaviorSubject(false);
	public token;

	constructor(
		private http: HttpClient,
		private helper: JwtHelperService,
		private alertController: AlertController,
		private storage: StorageService,
		private globals: Globals) {
		this.checkToken();
	}

	checkToken(): Promise<any> {
		return this.storage.get(this.globals.TOKEN_KEY).then(token => {
			if (token.value) {
				let isExpired = this.helper.isTokenExpired(token.value);
				if (!isExpired) {
					this.token = token.value;
					this.authenticationState.next(true);
					this.storage.get(this.globals.USER_ID_KEY).then(userId => {
						this.globals.userId = Number(userId.value);
					});
					this.storage.get(this.globals.USER_EMAIL_KEY).then(userEmail => {
						this.globals.userEmail = userEmail.value;
					});
				} else {
					this.storage.remove(this.globals.TOKEN_KEY);
					this.storage.remove(this.globals.USER_ID_KEY);
					this.storage.remove(this.globals.USER_EMAIL_KEY);
				}
			}
		});
	}

	register(credentials) {
		return this.http.post(`${this.url}/api/auth/register`, credentials).pipe(
			catchError(e => {
				this.showAlert(e.error.msg);
				throw new Error(e);
			})
		);
	}

	login(credentials) {
		return this.http.post(`${this.url}/api/auth/login`, credentials)
			.pipe(
				tap((res: AuthData) => {
					this.storage.set(this.globals.TOKEN_KEY, res.token);
					this.token = res.token;
					this.storage.set(this.globals.USER_ID_KEY, res.id.toString());
					this.storage.set(this.globals.USER_EMAIL_KEY, res.email);
					this.globals.userId = res.id;
					this.globals.userEmail = res.email;
					
					this.authenticationState.next(true);
				}),
				catchError(e =>
					of(this.showAlert(e.error.msg))
				)
			);
	}

	isAuthenticated() {
		return this.authenticationState.value;
	}

	showAlert(msg) {
		const alert = this.alertController.create({
			message: msg,
			header: 'Error',
			buttons: ['OK']
		});
		alert.then(alert => alert.present());
	}
}
