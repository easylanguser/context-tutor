import { Platform, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap, catchError } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Globals } from '../globals/globals';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

interface AuthData {
	token: string,
	id: number
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
		private plt: Platform,
		private alertController: AlertController,
		private globals: Globals) {
		this.plt.ready().then(() => {
			this.checkToken();
		});
	}

	checkToken(): Promise<any> {
		return Storage.get({ key: this.globals.TOKEN_KEY}).then(token => {
			if (token.value) {
				parent.postMessage({ token: token.value }, '*');
				let isExpired = this.helper.isTokenExpired(token.value);

				if (!isExpired) {
					this.token = token.value;
					this.authenticationState.next(true);
					Storage.get({key: this.globals.USER_ID_KEY }).then(userId => {
						this.globals.userId = Number(userId.value);
					});
				} else {
					Storage.remove({ key: this.globals.TOKEN_KEY });
					Storage.remove({ key: this.globals.USER_ID_KEY });
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
					Storage.set({ key: this.globals.TOKEN_KEY, value: res.token });
					this.token = res.token;
					parent.postMessage({ token: this.token }, '*');

					Storage.set({ key: this.globals.USER_ID_KEY, value: res.id.toString() });
					this.globals.userId = res.id;
					
					this.authenticationState.next(true);
				}),
				catchError(e =>
					of(this.showAlert(e.error.msg))
				)
			);
	}

	async logout() {
		await Storage.remove({ key: this.globals.USER_ID_KEY });
		await Storage.remove({ key: this.globals.TOKEN_KEY });
		await Storage.remove({ key: this.globals.USER_AVATAR_KEY });
		await Storage.remove({ key: this.globals.USER_EMAIL_KEY });

		this.token = null;
		parent.postMessage({ userLoggedOut: true }, '*');
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
