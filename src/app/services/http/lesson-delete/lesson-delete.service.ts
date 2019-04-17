import { Injectable } from '@angular/core';
import { HttpService } from '../../http/rest/http.service';
import { environment } from 'src/environments/environment';

const apiUrl = environment.url + '/api/lessons/delete?id=';

@Injectable({
	providedIn: 'root'
})
export class LessonDeleteService {

	constructor(private httpService: HttpService) { }

	delete(lessonId: number) {
		this.httpService.doDelete(apiUrl + lessonId);
	}
}
