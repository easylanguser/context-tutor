import { Injectable } from '@angular/core';
import { HttpService } from '../../http/rest/http.service';
import { environment } from 'src/environments/environment';

const apiUrl = environment.url + '/api/lessons/getLessons';

@Injectable({
	providedIn: 'root'
})

export class LessonsListService {

	constructor(private httpService: HttpService) { }

	getData(): Promise<any> {
		return this.httpService.doGet(apiUrl).toPromise();
	}
}
