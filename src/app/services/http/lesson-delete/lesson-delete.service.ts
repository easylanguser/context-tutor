import { Injectable } from '@angular/core';
import { HttpService } from '../../http/rest/http.service';

const apiUrl = 'http://165.227.159.35/api/lessons/delete?id=';

@Injectable({
	providedIn: 'root'
})
export class LessonDeleteService {

	constructor(private httpService: HttpService) { }

	delete(lessonId: number) {
		this.httpService.doDelete(apiUrl + lessonId);
	}
}
