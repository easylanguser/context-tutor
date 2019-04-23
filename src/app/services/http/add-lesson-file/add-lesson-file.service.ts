import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';

const apiUrl = environment.url + '/api/lessons/v1/addLessons?userId=';

@Injectable({
  providedIn: 'root'
})
export class AddLessonFileService {

  constructor(private httpService: HttpService) { }

  postNewLessonFile(lesson: FileList, userId: number): Promise<any> {
    const formData = new FormData();
    formData.append('lesson', lesson[0]);
		return this.httpService.doPostForm(apiUrl + userId, formData).toPromise();
	}
}
