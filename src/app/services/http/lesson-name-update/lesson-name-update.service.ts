import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';
import { Observable, forkJoin } from 'rxjs';

const apiUrl = environment.url + '/api/lessons/updateLessonName?lessonId=';

@Injectable({
  providedIn: 'root'
})
export class LessonNameUpdateService {

  constructor(private httpService: HttpService) { }

  updateData(lessonId: string, newTitle: string): Observable<any> {
		const response = this.httpService.doPut(apiUrl + lessonId + '&newName=' + newTitle);
		return forkJoin([response]);
	}
}
