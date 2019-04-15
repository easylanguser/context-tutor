import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';
import { Observable, forkJoin } from 'rxjs';

const apiUrl = environment.url + '/api/sentences/addSentence';

@Injectable({
  providedIn: 'root'
})
export class AddSentenceService {

  constructor(private httpService: HttpService) { }

  postNewSentence(sentence: Object): Observable<any> {
		const response = this.httpService.doPost(apiUrl, sentence);
		return forkJoin([response]);
	}
}
