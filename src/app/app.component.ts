import { Component } from '@angular/core';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { ThemeService } from './services/theme/theme.service';
import { Location } from '@angular/common';
import { NavigationOptions } from '@ionic/angular/dist/providers/nav-controller';
import { UserHttpService } from './services/http/users/user-http.service';
import { Globals } from './services/globals/globals';
import { DomSanitizer } from '@angular/platform-browser';
import { StorageService } from './services/storage/storage.service';
import { SplashScreen, Device } from '@capacitor/core';
import anime from 'animejs/lib/anime.es';

@Component({
	selector: 'app-root',
	styleUrls: ['app.component.scss'],
	templateUrl: 'app.component.html',
})
export class AppComponent {

	loggedIn = false;
	themeName: string;

	constructor(
		private platform: Platform,
		private authService: AuthService,
		private router: Router,
		private themeService: ThemeService,
		private alertController: AlertController,
		private location: Location,
		private sanitizer: DomSanitizer,
		private userHttpService: UserHttpService,
		private navController: NavController,
		private storage: StorageService,
		public globals: Globals) {
		this.initializeApp(this.location.path());
	}

	private getParams(url): NavigationOptions {
		let index = url.indexOf('?');
		if (index === -1)
			return null;
		let paramsSubstring = url.substr(index + 1);
		let params = {};
		while (paramsSubstring.indexOf('&') > -1) {
			const param = paramsSubstring.substring(0, paramsSubstring.indexOf('&'));
			params[param.substring(0, param.indexOf('='))] = Number(param.substr(param.indexOf('=') + 1));
			paramsSubstring = paramsSubstring.substr(paramsSubstring.indexOf('&') + 1);
		}
		params[paramsSubstring.substring(0, paramsSubstring.indexOf('='))] = Number(paramsSubstring.substr(paramsSubstring.indexOf('=') + 1));

		return params;
	}

	onChangeTheme(ev: CustomEvent) {
		if (ev.detail.value === 'dark') {
			this.themeService.addBodyClass('dark-theme');
			this.themeName = 'dark';
		} else {
			this.themeService.removeBodyClass('dark-theme');
			this.themeName = 'light';
		}
		this.storage.set(this.globals.THEME_ID_KEY, this.themeName);
	}

	authenticationState = new BehaviorSubject(false);

	initializeApp(pathToGo: string) {
		this.platform.ready().then(async () => {
			this.globals.platformName = this.platform.is('android') ?
				'android' :
				(this.platform.is('ios') ? 'ios' : (await Device.getInfo()).platform);
			if (this.globals.platformName === 'android') {
				await this.checkForIntent();
			}

			if (this.globals.platformName === 'android' || this.globals.platformName === 'ios') {
				await SplashScreen.hide();
			}

			const customEvent: CustomEvent = new CustomEvent("themeevent", { detail: {} });
			const themeName = (await this.storage.get(this.globals.THEME_ID_KEY)).value;
			customEvent.detail.value = (themeName === "dark") ?
				"dark" :
				"light";
			this.onChangeTheme(customEvent);

			this.authService.authenticationState.subscribe(async state => {
				if (state) {
					this.loggedIn = true;
					if (this.globals.sharedText) {
						this.navController.navigateForward(['share-adding-choice']);
					} else {
						if (pathToGo === '/login') {
							pathToGo = 'lessons-list';
						}

						await this.loadAvatar();

						const paramsOfUrl = this.getParams(pathToGo);
						if (paramsOfUrl) {
							await this.navController.navigateForward(
								[pathToGo.substring(0, pathToGo.indexOf('?'))],
								{ queryParams: paramsOfUrl });
						} else {
							await this.navController.navigateForward([pathToGo]);
						}
						const token = await this.storage.get(this.globals.TOKEN_KEY)
						if (token.value) {
							setTimeout(() => {
								parent.postMessage({ token: token.value }, '*');
							}, 500);
						}
					}
				} else {
					this.loggedIn = false;
					await this.storage.clear();
					this.globals.userAvatar = null;
					this.authService.token = null;
					parent.postMessage({ userLoggedOut: true }, '*');
					this.navController.pop();
					this.router.navigate(['login']);
				}
			});

			this.globals.isDemo.subscribe(demo => {
				if (demo && this.globals.isDemoHasChanged) {
					const target = [document.querySelector('#demo-informer')];
					anime({
						targets: target,
						translateX: '+=95vw',
						duration: 1000
					}).finished.then(() => {
						anime({
							targets: target,
							translateX: '-=95vw',
							delay: 1500,
							duration: 1000
						})
					});
				}
			});
		});
	}

	private async loadAvatar() {
		const image = (await this.storage.get(this.globals.USER_AVATAR_KEY)).value;
		if (image) {
			this.globals.userAvatar = this.sanitizer.bypassSecurityTrustUrl(image);
		} else {
			const blob = await this.userHttpService.getAvatar();
			if (blob.size === 19) {
				return;
			}
			const reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = () => {
				const image = String(reader.result);
				this.storage.set(this.globals.USER_AVATAR_KEY, image);
				this.globals.userAvatar = this.sanitizer.bypassSecurityTrustUrl(image);
			}
		}
	}

	logout() {
		this.authService.authenticationState.next(false);
	}

	private async checkForIntent() {
		if (window.receiveContent) {
			const text: string = await window.receiveContent.receiveText();
			if (text) {
				text.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
				this.globals.sharedText = text;
			}
		}
	}

	async showAbout() {
		let header = 'EasyLang Context Tutor';
		let message = '0.2.6';
		const alert = await this.alertController.create({
			header: header,
			message: '<i>Version: ' + message + '</i>',
			buttons: ['Close']
		});
		await alert.present();
	}
}

declare var window: any;
