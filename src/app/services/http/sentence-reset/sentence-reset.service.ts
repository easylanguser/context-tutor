import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';
import { Observable } from 'rxjs';

const apiUrl = environment.url + '/api/sentences/resetSentenceAndUpdateWords?sentenceId=';

@Injectable({
	providedIn: 'root'
})
export class SentenceResetService {

	constructor(private httpService: HttpService) { }
	
	updateData(sentenceId: string, words: Array<[number, number]>): Promise<any> {
		return this.httpService.doPut(apiUrl + sentenceId, words).toPromise();
	}
}
