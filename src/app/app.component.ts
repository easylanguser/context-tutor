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
import { USER_AVATAR_KEY } from './pages/account/account.page';
import { UserHttpService } from './services/http/users/user-http.service';
import { Storage } from '@ionic/storage';

export const SHARED_TEXT_ID_KEY = "shared_text_id";
export let sharedText = [];
export let updateIsRequired = [false];

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
		private userHttpService: UserHttpService,
		private navController: NavController) { }

	onChangeTheme(ev: CustomEvent) {
		if (ev.detail.value === 'dark') {
			this.theme.enableDarkMode(true);
			this.themeName = 'dark';
		} else {
			this.theme.enableDarkMode(false);
			this.themeName = 'light';
		}
	}

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

				this.storage.get("theme").then(themeName => {
					const customEvent: CustomEvent = new CustomEvent("themeevent", { detail: {} });
					themeName === "dark" ?
						customEvent.detail.value = "dark" :
						customEvent.detail.value = "light";
					this.onChangeTheme(customEvent);
				});

				this.navController.navigateForward(['']);
			});
	}

	private loadAvatar() {
		this.storage.get(USER_AVATAR_KEY).then(image => {
			const avatars = <HTMLCollectionOf<HTMLImageElement>>(document.getElementsByClassName('avatar'));
			if (image) {
				avatars[0].src = image;
			} else {
				this.userHttpService.getAvatar().then(blob => {
					if (blob.size === 19) {
						return;
					}
					var reader = new FileReader();
					reader.readAsDataURL(blob);
					reader.onloadend = () => {
						const image = String(reader.result);
						this.storage.set(USER_AVATAR_KEY, image);
						avatars[0].src = image;
					}
				});
			}
		});
	}

	async showAbout() {
		let header = 'EasyLang Context Tutor Demo';
		const alert = await this.alertController.create({
			header: header,
			message: 'See more in <a href="http://easy4learn.com/tutor">full version<a>',
			buttons: ['Close']
		});
		await alert.present();
	}
}
