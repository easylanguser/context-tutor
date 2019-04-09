import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { HttpService } from '../../http/rest/http.service';

const apiUrl = 'http://46.101.122.247/api/sentences/getLessonSentences?lessonId=';

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
