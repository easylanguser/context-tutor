import { Component } from '@angular/core';
import { Platform, AlertController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { ThemeService } from './services/theme/theme.service';
import { Location } from '@angular/common';
import { NavigationOptions } from '@ionic/angular/dist/providers/nav-controller';
import { UserHttpService } from './services/http/users/user-http.service';
import { Storage } from '@ionic/storage';
import { Globals } from './services/globals/globals';
import * as anime from 'animejs';

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
		private storage: Storage,
		private alertController: AlertController,
		private location: Location,
		private globals: Globals,
		private userHttpService: UserHttpService,
		private navController: NavController) {
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

	async initializeApp(pathToGo: string) {
		await this.platform.ready();
		if (this.platform.is('android')) {
			this.checkForIntent();
		}
		if (this.platform.is('mobile')) {
			if (this.platform.is('android')) {
				this.statusBar.styleBlackOpaque;
			} else if (this.platform.is('ios')) {
				this.statusBar.styleDefault();
			}
			this.splashScreen.hide();
		}

		const themeName = await this.storage.get("theme");
		const customEvent: CustomEvent = new CustomEvent("themeevent", { detail: {} });
		themeName === "dark" ?
			customEvent.detail.value = "dark" :
			customEvent.detail.value = "light";
		this.onChangeTheme(customEvent);
		
		this.authService.authenticationState.subscribe(async state => {
			if (state) {
				this.loggedIn = true;
				if (this.globals.sharedText[0]) {
					this.router.navigate(['share-adding-choice']);
				} else {
					if (pathToGo === '/login') {
						pathToGo = 'lessons-list';
					}

					await this.loadAvatar();

					const paramsOfUrl = this.getParams(pathToGo);
					if (paramsOfUrl) {
						this.navController.navigateForward(
							[pathToGo.substring(0, pathToGo.indexOf('?'))],
							{ queryParams: paramsOfUrl });
					} else {
						this.navController.navigateForward([pathToGo]);
					}
				}
			} else {
				this.loggedIn = false;
				this.router.navigate(['login']);
			}
		});

		this.globals.isDemo.subscribe(demo => {
			if (demo && this.globals.isDemoHasChanged) {
				const target = [document.querySelector('#demo-informer')];
				anime({
					targets: target,
					translateX: '+=85vw',
					duration: 1000
				}).finished.then(() => {
					anime({
						targets: target,
						translateX: '-=85vw',
						delay: 1500,
						duration: 1000
					})
				});
			}
		});
	}

	private async loadAvatar() {
		const image = await this.storage.get(this.globals.USER_AVATAR_KEY);
		const avatars = <HTMLCollectionOf<HTMLImageElement>>(document.getElementsByClassName('avatar'));
		if (image) {
			avatars[0].src = image;
		} else {
			const blob = await this.userHttpService.getAvatar();
			if (blob.size === 19) {
				return;
			}
			var reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = () => {
				const image = String(reader.result);
				this.storage.set(this.globals.USER_AVATAR_KEY, image);
				avatars[0].src = image;
			}
		}
	}

	logout() {
		this.authService.logout().then(() => {
			this.loggedIn = false;
		});
	}

	private checkForIntent() {
		if (!(window.receiveContent)) {
			return Promise.resolve();
		}

		return window.receiveContent.receiveText()
			.then((text: string) => {
				if (text) {
					text.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
					this.globals.sharedText.push(text);
				}
			})
			.catch(err => console.error('ReceiveContent plugin error: ', err));
	}

	async showAbout() {
		let header = 'EasyLang Context Tutor';
		let message = '0.1.16';
		const alert = await this.alertController.create({
			header: header,
			message: 'Version: ' + message,
			buttons: ['Close']
		});
		await alert.present();
	}
}

declare var window: any;
