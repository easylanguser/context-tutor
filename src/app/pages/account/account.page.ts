import {Component, OnInit} from '@angular/core';
import {Storage} from "@ionic/storage";
import {JwtHelperService} from "@auth0/angular-jwt";

const TOKEN_KEY = 'access_token';

@Component({
    selector: 'app-account',
    templateUrl: './account.page.html',
    styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

    user = {};

    constructor(private storage: Storage, private helper: JwtHelperService) {
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

}
