import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Injectable({
	providedIn: 'root'
})
export class HttpService {

	constructor(
		private authService: AuthService,
		private helper: JwtHelperService,
		private http: HttpClient) { }

	doPost(url: string, body?: Object): Observable<any> {
		const headers = this.addHeaders();
		return this.http.post(url, body, headers);
	}

	doPut(url: string, body?: Object): Observable<any> {
		const headers = this.addHeaders();
		return this.http.put(url, body, headers);
	}

	doGet(url: string): Observable<any> {
		const headers = this.addHeaders();
		return this.http.get(url, headers);
	}

	doDelete(url: string) {
		const headers = this.addHeaders();
		return this.http.delete(url, headers).toPromise();
	}

	addHeaders() {
		const token = this.authService.token;
		const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
		return { headers: headers };
	}
}
