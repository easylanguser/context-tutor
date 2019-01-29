import {Component} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {Router} from '@angular/router';
import {AuthService} from "./services/auth/auth.service";

import {Storage} from '@ionic/storage';
import {BehaviorSubject} from "rxjs";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    appPages = [
        {
            title: 'My lessons',
            url: '/home',
            icon: 'information-circle'
        },
    ];

    loggedIn = false;

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private authService: AuthService,
        private router: Router,
        private storage: Storage,
    ) {
        this.initializeApp();
    }

    authenticationState = new BehaviorSubject(false);

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();

            this.authService.authenticationState.subscribe(state => {
                if (state) {
                    this.loggedIn = true;
                    this.router.navigate(['/']);
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
}
