import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';

const apiUrl = environment.url + '/api/users/';

@Injectable({
	providedIn: 'root'
})
export class UserHttpService {

	constructor(private httpService: HttpService) { }

	getAvatar(userId ?: number): Promise<Blob> {
		return this.httpService.doGetImage(apiUrl + 'getUserAvatar' + (userId ? ('?userId=' + userId) : '')).toPromise();
	}

	postNewAvatar(avatar: FileList): Promise<any> {
		const formData = new FormData();
		formData.append('avatar', avatar[0]);
		return this.httpService.doPostForm(apiUrl + 'uploadAvatar', formData).toPromise();
	}

	sendPassResetRequest(email: string): Promise<any> {
		return this.httpService.doPost(environment.url + '/api/user/sendPassword', email).toPromise();
	}

	sendShareRequest(userId: number, lessonId: number): Promise<any> {
		return this.httpService.doPut(apiUrl + 'sendShareRequest', {
			userId: userId,
			lessonId: lessonId
		}).toPromise();
	}

	getUserInfo(): Promise<any> {
		return this.httpService.doGet(apiUrl + 'getUserInfo').toPromise();
	}

	getSharedLessons(): Promise<any> {
		return this.httpService.doGet(apiUrl + 'getSharedLessons').toPromise();
	}

	getAllUsers(): Promise<any> {
		return this.httpService.doGet(apiUrl + 'getAllUsers').toPromise();
	}

	updateShareStatus(lessonId: number, status: number): Promise<any> {
		return this.httpService.doPut(apiUrl + 'updateShareStatus', {
			lessonId: lessonId,
			status: status
		}).toPromise();
	}
}
