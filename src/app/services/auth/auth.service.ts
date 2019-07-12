import { Platform, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap, catchError } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';
import { Globals } from '../globals/globals';

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
		private alertController: AlertController,
		private globals: Globals) {
		this.plt.ready().then(() => {
			this.checkToken();
		});
	}

	checkToken(): Promise<any> {
		return this.storage.get(this.globals.TOKEN_KEY).then(token => {
			if (token) {
				parent.postMessage({ token: token }, '*');
				let isExpired = this.helper.isTokenExpired(token);

				if (!isExpired) {
					this.token = token;
					this.authenticationState.next(true);
				} else {
					this.storage.remove(this.globals.TOKEN_KEY);
					this.storage.remove(this.globals.USER_ID_KEY);
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
					parent.postMessage({ token: this.token }, '*');

					this.storage.set(this.globals.USER_ID_KEY, res.id);
					this.authenticationState.next(true);
				}),
				catchError(e =>
					of(this.showAlert(e.error.msg))
				)
			);
	}

	async logout() {
		await this.storage.remove(this.globals.USER_ID_KEY);
		await this.storage.remove(this.globals.TOKEN_KEY);
		await this.storage.remove(this.globals.USER_AVATAR_KEY);
		await this.storage.remove(this.globals.USER_EMAIL_KEY);

		this.token = null;
		parent.postMessage({ userLoggedOut: true }, '*');
		(<HTMLImageElement>document.getElementById(this.globals.USER_AVATAR_KEY)).src = 'assets/img/account_icon.svg';
		this.authenticationState.next(false);
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
