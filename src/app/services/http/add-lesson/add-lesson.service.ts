import { Injectable } from '@angular/core';
import { HttpService } from '../rest/http.service';
import { environment } from 'src/environments/environment';

const apiUrl = environment.url + '/api/lessons/addLessons?userId=';

@Injectable({
  providedIn: 'root'
})
export class AddLessonService {

  constructor(private httpService: HttpService) { }

  postNewLesson(lesson: any): Promise<any> {
		return this.httpService.doPost(apiUrl + lesson.userId, lesson).toPromise();
	}
}
