import { Component } from '@angular/core';
import { Platform, AlertController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { ThemeService } from './services/theme/theme.service';
import { StorageService } from './services/storage/storage-service';
import { Location } from '@angular/common';
import { LessonsDataService } from './services/lessons-data/lessons-data.service';
import { NavigationOptions } from '@ionic/angular/dist/providers/nav-controller';

export const SHARED_TEXT_ID_KEY = "shared_text_id";
export let sharedText = [];
export let updateIsRequired = [false];
export let sortIsRequired = [false];

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
		private splashScreen: SplashScreen,
		private statusBar: StatusBar,
		private authService: AuthService,
		private router: Router,
		private theme: ThemeService,
		private storageService: StorageService,
		private alertCtrl: AlertController,
		private location: Location,
		private lessonsDataService: LessonsDataService,
		private navCtrl: NavController) {
		this.initializeApp(location.path());
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
			this.theme.enableDarkMode(true);
			this.themeName = 'dark';
		} else {
			this.theme.enableDarkMode(false);
			this.themeName = 'light';
		}
	}

	authenticationState = new BehaviorSubject(false);

	initializeApp(pathToGo: string) {
		this.platform.ready()
			.then(() => {
				if (this.platform.is('android')) {
					this.checkForIntent();
				}
			})
			.then(() => {
				if (this.platform.is('mobile')) {
					if (this.platform.is('android')) {
						this.statusBar.styleBlackOpaque;
					} else if (this.platform.is('ios')) {
						this.statusBar.styleDefault();
					}
					this.splashScreen.hide();
				}

				this.storageService.get("theme").then(themeName => {
					const customEvent: CustomEvent = new CustomEvent("themeevent", { detail: {} });
					themeName === "dark" ?
						customEvent.detail.value = "dark" :
						customEvent.detail.value = "light";
					this.onChangeTheme(customEvent);
				});

				this.authService.authenticationState.subscribe(state => {
					if (state) {
						this.loggedIn = true;
						if (sharedText[0]) {
							this.router.navigate(['share-adding-choice']);
						} else {
							if (pathToGo === '/login') {
								pathToGo = 'lessons-list';
							}

							const paramsOfUrl = this.getParams(pathToGo);
							if (paramsOfUrl) {
								this.navCtrl.navigateForward([pathToGo.substring(0, pathToGo.indexOf('?'))], { queryParams: paramsOfUrl });
							} else {
								this.navCtrl.navigateForward([pathToGo]);
							}
						}
					} else {
						this.loggedIn = false;
						this.router.navigate(['login']);
					}
				});
			});
	}

	logout() {
		this.authService.logout();
		this.loggedIn = false;
	}

	private checkForIntent() {
		if (!(window.receiveContent)) {
			return Promise.resolve();
		}

		return window.receiveContent.receiveText()
			.then((text: string) => {
				if (text) {
					text.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
					sharedText.push(text);
				}
			})
			.catch(err => console.error('ReceiveContent plugin error: ', err));
	}

	async showAbout() {
		let header = 'EasyLang Context Tutor';
		let message = '0.1.11';
		const alert = await this.alertCtrl.create({
			header: header,
			message: 'Version: ' + message,
			buttons: ['Close']
		});
		await alert.present();
	}
}

declare var window: any;
