import {Component, OnInit} from '@angular/core';
import {Storage} from "@ionic/storage";
import {JwtHelperService} from "@auth0/angular-jwt";
import {AuthService} from "../../services/auth/auth.service";
import {HttpService} from "../../services/http/rest/http.service";
import {AlertController} from "@ionic/angular";

const TOKEN_KEY = 'access_token';

@Component({
    selector: 'app-account',
    templateUrl: './account.page.html',
    styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

    user = {};

    constructor(private storage: Storage, private helper: JwtHelperService, private authService: AuthService, private httpService: HttpService,
                private alertController: AlertController) {
    }

    ngOnInit() {
        this.getUserInfo()
    }

    getUserInfo() {
        this.storage.get(TOKEN_KEY).then(token => {
            if (token) {
                let decoded = this.helper.decodeToken(token);
                this.user['email'] = decoded.email;

            }
        });
    }

    async deleteAccount() {
        let alert = await this.alertController.create({
            message: 'Are you sure you want to delete your account?',
            buttons: [
                {
                    text: 'Delete',
                    handler: () => {
                        alert.dismiss(true);
                        this.httpService.doPost('http://165.227.159.35/user/deleteAccount')
                            .subscribe(res => {
                                return this.authService.logout();
                            })
                    }
                }, {
                    text: 'Cancel',
                    handler: () => {
                        alert.dismiss(false);
                        return false;
                    }
                }
            ]
        });
        return await alert.present();
    }

    changePassword() {
        // this.storage.get(TOKEN_KEY).then(token => {
        //     if (token) {
        //         let decoded = this.helper.decodeToken(token);
        //         this.user['email'] = decoded.email;
        //
        //     }
        // });
    }

    logout() {
        this.authService.logout();
    }
}
