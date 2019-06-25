import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';

const apiUrl = environment.url + '/api/users/uploadAvatar';

@Injectable({
	providedIn: 'root'
})
export class UploadAvatarService {

	constructor(private httpService: HttpService) { }

	postNewAvatar(avatar: FileList): Promise<any> {
		const formData = new FormData();
		formData.append('avatar', avatar[0]);
		return this.httpService.doPostForm(apiUrl, formData).toPromise();
	}
}