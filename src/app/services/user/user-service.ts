import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class UserService implements OnInit{

    constructor(private http: HttpClient){
    }

    ngOnInit(){

    }

    sendPasswordToEmail(email: string): Observable<any> {
        return this.http.post("http://localhost/user/sendPassword", email)
    }

}

