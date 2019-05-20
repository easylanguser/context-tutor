import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';
import { Observable } from 'rxjs';

const apiUrl = environment.url + '/api/lessons/updateLessonName?lessonId=';

@Injectable({
  providedIn: 'root'
})
export class LessonNameUpdateService {

  constructor(private httpService: HttpService) { }

  updateLessonName(lessonId: string, newTitle: string): Promise<any> {
		return this.httpService.doPut(apiUrl + lessonId + '&newName=' + newTitle).toPromise();
	}
}
