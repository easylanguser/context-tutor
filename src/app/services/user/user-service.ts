import { Injectable, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({
	providedIn: 'root'
})
export class UserService implements OnInit {

	url = environment.url;
	constructor(private http: HttpClient) {
	}

	ngOnInit() {

	}

	sendPassResetRequest(email: string): Observable<any> {
		return this.http.post(`${this.url}/api/user/sendPassword`, email);
	}

}

