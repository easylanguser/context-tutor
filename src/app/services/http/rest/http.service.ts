import {Injectable, OnInit} from '@angular/core';
import {Storage} from "@ionic/storage";
import {JwtHelperService} from "@auth0/angular-jwt";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

const TOKEN_KEY = 'access_token';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    token: string;

    constructor(private storage: Storage, private helper: JwtHelperService, private http: HttpClient) {
        this.storage.get(TOKEN_KEY).then(token => this.token = token);
    }

    doPost(url: string, body): Observable<any> {
        const headers = this.addHeaders();
        return this.http.post(url, body, headers)
    }

    doGet(url: string): Observable<any> {
        const headers = this.addHeaders();
        return this.http.get(url, headers)
    }

    addHeaders() {
        const headers = new HttpHeaders({'Content-Type': 'json','Authorization':this.token});
        return {headers: headers}
    }
}


