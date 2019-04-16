import { Injectable } from '@angular/core';
import { HttpService } from '../rest/http.service';
import { environment } from 'src/environments/environment';

const apiUrl = environment.url + '/api/lessons/addLessons';

@Injectable({
  providedIn: 'root'
})
export class AddLessonService {

  constructor(private httpService: HttpService) { }

  postNewLesson(lesson: Object): Promise<any> {
		return this.httpService.doPost(apiUrl, lesson).toPromise();
	}
}
