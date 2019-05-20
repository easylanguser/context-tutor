import { Injectable } from '@angular/core';
import { HttpService } from '../../http/rest/http.service';
import { environment } from 'src/environments/environment';

const apiUrl = environment.url + '/api/sentences/getLessonSentences?lessonId=';

@Injectable({
	providedIn: 'root'
})

export class SentencesByLessonService {

	constructor(private httpService: HttpService) { }

	getData(lessonId: number): Promise<any> {
		return this.httpService.doGet(apiUrl + lessonId).toPromise();
	}
}
