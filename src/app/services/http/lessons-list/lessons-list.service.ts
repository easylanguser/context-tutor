import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { HttpService } from '../../http/rest/http.service';

const apiUrl = 'http://46.101.122.247/api/lessons/getLessons';

@Injectable({
	providedIn: 'root'
})

export class LessonsListService {

	constructor(private httpService: HttpService) { }

	getData(): Observable<any> {
		const response = this.httpService.doGet(apiUrl);
		return forkJoin([response]);
	}
}
