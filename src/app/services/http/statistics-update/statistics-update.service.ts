import { Observable, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpService } from '../../http/rest/http.service';

const apiUrl = 'http://46.101.122.247/api/sentences/updateSentenceStatistics';

@Injectable({
	providedIn: 'root'
})
export class StatisticsUpdateService {

	constructor(private httpService: HttpService) { }

	updateData(newStatistics: Object): Observable<any> {
		const response = this.httpService.doPut(apiUrl, newStatistics);
		return forkJoin([response]);
	}
}
