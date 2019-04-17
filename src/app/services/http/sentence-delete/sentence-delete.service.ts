import { Injectable } from '@angular/core';
import { HttpService } from '../rest/http.service';
import { environment } from 'src/environments/environment';

const apiUrl = environment.url + '/api/sentences/delete?id=';

@Injectable({
	providedIn: 'root'
})
export class SentenceDeleteService {

	constructor(private httpService: HttpService) { }

	delete(sentenceId: number) {
		this.httpService.doDelete(apiUrl + sentenceId);
	}
}
