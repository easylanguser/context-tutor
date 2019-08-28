import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const apiUrl = environment.url + '/api/users/';

@Injectable({
	providedIn: 'root'
})
export class UserHttpService {

	constructor(private httpService: HttpService,
		private http: HttpClient) { }

	getAvatar(userId?: number): Promise<Blob> {
		return this.httpService.doGetImage(apiUrl + 'getUserAvatar' + (userId ? ('?userId=' + userId) : '')).toPromise();
	}

	postNewAvatar(avatar: FileList): Promise<any> {
		const formData = new FormData();
		formData.append('avatar', avatar[0]);
		return this.httpService.doPostForm(apiUrl + 'uploadAvatar', formData).toPromise();
	}

	sendPassResetRequest(email): Promise<any> {
		return this.http.post(environment.url + '/api/user/sendPassword', email, {
			headers: new HttpHeaders({ 'Content-Type': 'application/json' })
		}).toPromise();
	}

	getUserByEmail(userEmail: string): Promise<any> {
		return this.httpService.doGet(apiUrl + 'getUserByEmail?userEmail=' + userEmail).toPromise();
	}
}
