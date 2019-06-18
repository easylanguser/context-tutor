import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpService } from '../../http/rest/http.service';
import { environment } from 'src/environments/environment';

const apiUrl = environment.url + '/api/statistic/updateStatistics?sentenceId=';

@Injectable({
	providedIn: 'root'
})
export class StatisticsUpdateService {

	constructor(private httpService: HttpService) { }

	updateData(newStatistics: any): Observable<any> {
		return this.httpService.doPut(apiUrl + newStatistics.sentenceId, newStatistics);
	}
}
