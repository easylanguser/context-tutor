import { Platform, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap, catchError } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage-service';

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
		private storageService: StorageService,
		private plt: Platform,
		private alertController: AlertController) {
		this.plt.ready().then(() => {
			this.checkToken();
		});
	}

	checkToken() {
		this.storageService.get(TOKEN_KEY).then(token => {
			if (token) {
				let decoded = this.helper.decodeToken(token);
				let isExpired = this.helper.isTokenExpired(token);

				if (!isExpired) {
					this.token = token;
					this.authenticationState.next(true);
				} else {
					this.storageService.remove(TOKEN_KEY);
					this.storageService.remove(USER_ID_KEY);
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
					this.storageService.set(TOKEN_KEY, res.token);
					this.token = res.token;
					this.storageService.set(USER_ID_KEY, res.id);
					this.authenticationState.next(true);
				}),
				catchError(e =>
					of(this.showAlert(e.error.msg))
				)
			);
	}

	logout() {
		this.storageService.remove(USER_ID_KEY).then(() => {
			this.storageService.remove(TOKEN_KEY).then(() => {
				this.authenticationState.next(false);
				this.token = null;
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
