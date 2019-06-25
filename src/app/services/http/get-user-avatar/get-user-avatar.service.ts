import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';

const apiUrl = environment.url + '/api/users/getUserAvatar';

@Injectable({
	providedIn: 'root'
})
export class GetUserAvatarService {

	constructor(private httpService: HttpService) { }

	getAvatar(): Promise<Blob> {
		return this.httpService.doGetImage(apiUrl).toPromise();
	}
}