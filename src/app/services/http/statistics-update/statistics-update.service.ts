import { Observable, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpService } from '../../http/rest/http.service';
import { environment } from 'src/environments/environment';

const apiUrl = environment.url + '/api/sentences/updateSentenceStatistics?sentenceId=';

@Injectable({
	providedIn: 'root'
})
export class StatisticsUpdateService {

	constructor(private httpService: HttpService) { }

	updateData(newStatistics: any): Observable<any> {
		const response = this.httpService.doPut(apiUrl + newStatistics.sentenceId, newStatistics);
		return forkJoin([response]);
	}
}
