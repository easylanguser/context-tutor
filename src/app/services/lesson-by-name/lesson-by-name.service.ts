import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { HttpService } from "../http/rest/http.service";

const apiUrl = 'http://165.227.159.35/api/sentences/getLessonSentences?lessonId=';

@Injectable({
	providedIn: 'root'
})

export class LessonByNameService {

	constructor(private httpService: HttpService) { }

	getData(lessonId: number): Observable<any> {
		let response = this.httpService.doGet(apiUrl + lessonId);
		return forkJoin([response]);
	}
}
