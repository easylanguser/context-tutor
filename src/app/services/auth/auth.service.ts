import { Platform, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap, catchError } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';

export const TOKEN_KEY = 'access_token';
export const USER_ID_KEY = 'user_id';

interface AuthData {
	token: string,
	id: string
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	url = environment.url;
	user = null;
	authenticationState = new BehaviorSubject(false);
	public token;

	constructor(
		private http: HttpClient,
		private helper: JwtHelperService,
		private storage: Storage,
		private plt: Platform,
		private alertController: AlertController) { }

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
					this.storage.set(USER_ID_KEY, res.id);
					this.authenticationState.next(true);
				}),
				catchError(e =>
					of(this.showAlert(e.error.msg))
				)
			);
	}

	logout() {
		this.storage.remove(USER_ID_KEY).then(() => {
			this.storage.remove(TOKEN_KEY).then(() => {
				this.authenticationState.next(false);
				parent.postMessage({ userLoggedOut: true }, '*');

				this.storage.remove('user-avatar');
				this.storage.remove('user-email');
				(<HTMLImageElement>document.getElementById('user-avatar')).src = 'assets/img/account_icon.svg';
			});
		});
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
