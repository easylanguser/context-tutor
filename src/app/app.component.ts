import { Component } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { ThemeService } from './services/theme/theme.service';
import { StorageService } from './services/storage/storage-service';

export const SHARED_TEXT_ID_KEY = "shared_text_id";
export let sharedText = [];
export let updateIsRequired = [false];

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
})
export class AppComponent {

	appPages = [
		{
			title: 'My lessons',
			url: '/lessons-list',
			icon: 'information-circle'
		}
	];

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
		private alertCtrl: AlertController) {
		this.initializeApp();
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

	initializeApp() {
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
							this.router.navigate(['/']);
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
		let message = '0.1.10';
		const alert = await this.alertCtrl.create({
			header: header,
			message: 'Version: ' + message,
			buttons: ['Close']
		});
		await alert.present();
	}
}

declare var window: any;
