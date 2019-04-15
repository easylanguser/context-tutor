import { Injectable } from '@angular/core';
import { HttpService } from '../rest/http.service';
import { environment } from 'src/environments/environment';
import { Observable, forkJoin } from 'rxjs';

const apiUrl = environment.url + '/api/lessons/addLessons';

@Injectable({
  providedIn: 'root'
})
export class AddLessonService {

  constructor(private httpService: HttpService) { }

  postNewLesson(lesson: Object): Observable<any> {
		const response = this.httpService.doPost(apiUrl, lesson);
		return forkJoin([response]);
	}
}
