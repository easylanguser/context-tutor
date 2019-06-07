import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';

const apiUrl = environment.url + '/api/sentences/addSentence?lessonId=';

@Injectable({
	providedIn: 'root'
})
export class AddSentenceService {

	constructor(private httpService: HttpService) { }

	postNewSentence(sentence: any): Promise<any> {
		return this.httpService.doPost(apiUrl + sentence.lessonId, 
			{
				text: sentence.text,
				words: sentence.words
			}
		).toPromise();
	}
}
