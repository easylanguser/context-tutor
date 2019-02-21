import {Component, OnInit} from '@angular/core';
import {Storage} from "@ionic/storage";
import {JwtHelperService} from "@auth0/angular-jwt";
import {AuthService} from "../../services/auth/auth.service";
import {HttpService} from "../../services/http/rest/http.service";
import {AlertController} from "@ionic/angular";
import {Router} from "@angular/router";

const TOKEN_KEY = 'access_token';

@Component({
    selector: 'app-account',
    templateUrl: './account.page.html',
    styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

    user = {};

    constructor(private storage: Storage, private helper: JwtHelperService, private authService: AuthService, private httpService: HttpService,
                private alertController: AlertController, private router: Router) {
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
            inputs: [
                {

                    placeholder: 'You password',
                    name: 'password',

                }],
            buttons: [
                {
                    text: 'Delete',
                    handler: (data) => {
                        alert.dismiss(true);
                        this.httpService.doPost('http://165.227.159.35/user/deleteAccount')
                            .subscribe(res => {
                                return this.authService.logout();
                            },err=>{
                                this.showAlert(err.error)
                            })
                    }
                }, {
                    text: 'Cancel',
                    handler: () => {
                        alert.dismiss(false);
                        return false;
                    }
                }
            ]}
        )
        return await alert.present();
    }

    changePassword() {
        this.router.navigate(['change']);
    }


    logout() {
        this.authService.logout();
    }

    showAlert(res) {
        let alert = this.alertController.create({
            message: res.msg,
            // header: 'User deleting',
        });
        alert.then(alert => alert.present());
    }
}
