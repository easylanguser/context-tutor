import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';

const apiUrl = environment.url + '/api/sentences/';

@Injectable({
	providedIn: 'root'
})
export class SentenceHttpService {

	constructor(private httpService: HttpService) { }

	postNewSentence(sentence: any): Promise<any> {
		return this.httpService.doPost(apiUrl + 'addSentence?lessonId=' + sentence.lessonId,
			{
				text: sentence.text,
				words: sentence.words
			}
		).toPromise();
	}

	deleteSentence(sentenceId: number) {
		this.httpService.doDelete(apiUrl + 'delete?id=' + sentenceId);
	}

	updateSentenceWords(sentenceId: string, words: Array<[number, number]>, text: string): Promise<any> {
		return this.httpService.doPut(apiUrl + 'resetSentenceAndUpdateWords?sentenceId=' + sentenceId,
			{
				text: text,
				words: words
			}
		).toPromise();
	}

	getLessonSentences(lessonId: number): Promise<any> {
		return this.httpService.doGet(apiUrl + 'getLessonSentences?lessonId=' + lessonId).toPromise();
	}
}
