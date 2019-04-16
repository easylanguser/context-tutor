import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';

const apiUrl = environment.url + '/api/sentences/addSentence';

@Injectable({
  providedIn: 'root'
})
export class AddSentenceService {

  constructor(private httpService: HttpService) { }

  postNewSentence(sentence: Object): Promise<any> {
		return this.httpService.doPost(apiUrl, sentence).toPromise();
	}
}
