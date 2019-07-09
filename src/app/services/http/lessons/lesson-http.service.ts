import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from '../rest/http.service';

const apiUrl = environment.url + '/api/lessons/';

@Injectable({
	providedIn: 'root'
})
export class LessonHttpService {

	constructor(private httpService: HttpService) { }

	postNewLesson(lesson: any): Promise<any> {
		return this.httpService.doPost(apiUrl + 'addLessons?userId=' + lesson.userId, lesson).toPromise();
	}

	postNewLessonFile(lesson: FileList, lessonName: string, userId: number): Promise<any> {
		const formData = new FormData();
		formData.append('lesson', lesson[0]);
		return this.httpService.doPostForm(apiUrl + 'addLessonFile?userId=' +
			userId + '&lessonFileName=' + lessonName, formData).toPromise();
	}

	deleteLesson(lessonId: number): Promise<any> {
		return this.httpService.doDelete(apiUrl + 'delete?id=' + lessonId).toPromise();
	}

	updateLessonName(lessonId: string, newTitle: string): Promise<any> {
		return this.httpService.doPut(apiUrl + 'updateLessonName?lessonId=' + lessonId + '&newName=' + newTitle).toPromise();
	}

	getLessons(userId ?: number): Promise<any> {
		return this.httpService.doGet(apiUrl + 'getLessons' + (userId ? ('?userId=' + userId) : '')).toPromise();
	}
}
