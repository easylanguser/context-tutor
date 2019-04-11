import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { HttpService } from '../../http/rest/http.service';
import { environment } from 'src/environments/environment';

const apiUrl = environment.url + '/api/sentences/getLessonSentences?lessonId=';

@Injectable({
	providedIn: 'root'
})

export class SentencesByLessonService {

	constructor(private httpService: HttpService) { }

	getData(lessonId: number): Observable<any> {
		const response = this.httpService.doGet(apiUrl + lessonId);
		return forkJoin([response]);
	}
}
