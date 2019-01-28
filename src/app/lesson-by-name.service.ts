import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';

const apiUrl = 'http://165.227.159.35/sentences/getLessonSentences?lessonId='; 

@Injectable({
  providedIn: 'root'
})

export class LessonByNameService {

  constructor(private http: HttpClient) { }

  getData(lessonId: number): Observable<any> {
    let response = this.http.get(apiUrl + lessonId);
    return forkJoin([response]);
  }
}
