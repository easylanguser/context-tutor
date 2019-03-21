import { Observable, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpService } from '../../http/rest/http.service';

const apiUrl = 'https://api.myjson.com/bins/';

@Injectable({
	providedIn: 'root'
})
export class StatisticsUpdateService {

	constructor(private httpService: HttpService) { }

	updateData(toUpdate: string, newStatistics: Object): Observable<any> {
		const response = this.httpService.doPut(apiUrl + toUpdate, { 'a' : newStatistics });
		return forkJoin([response]);
	}
}
