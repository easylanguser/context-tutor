import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';

const apiUrl = environment.url + '/api/statistic/';

@Injectable({
	providedIn: 'root'
})
export class StatisticHttpService {

	constructor(private httpService: HttpService) { }

	getStatisticsOfLesson(lessonId: number): Promise<any> {
		return this.httpService.doGet(apiUrl + 'getStatisticByLessonId?lessonId=' + lessonId).toPromise();
	}

	getStatisticsOfUser(): Promise<any> {
		return this.httpService.doGet(apiUrl + 'getStatisticByUser').toPromise();
	}

	updateStatisticsOfSentence(newStatistics: any): Promise<any> {
		return this.httpService.doPut(apiUrl + 'updateStatistics?sentenceId=' +
			newStatistics.sentenceId, newStatistics).toPromise();
	}
}
