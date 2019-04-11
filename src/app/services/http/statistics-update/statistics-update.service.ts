import { Observable, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpService } from '../../http/rest/http.service';
import { environment } from 'src/environments/environment.prod';

const apiUrl = environment.url + '/api/sentences/updateSentenceStatistics';

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
