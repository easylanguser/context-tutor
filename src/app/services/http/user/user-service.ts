import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	url = environment.url;

	constructor(private httpService: HttpService) { }

	sendPassResetRequest(email: string): Observable<any> {
		return this.httpService.doPost(`${this.url}/api/user/sendPassword`, email);
	}

	getUserInfo(): Promise<any> {
		return this.httpService.doGet(`${this.url}/api/users/getUserInfo`).toPromise();
	}
}
