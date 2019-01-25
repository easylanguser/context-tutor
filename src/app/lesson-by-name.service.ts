import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

const apiUrl = 'http://165.227.159.35/film/?name=';

@Injectable({
  providedIn: 'root'
})

export class LessonByNameService {

  constructor(private http: HttpClient) { }

  getData(lessonName: string): Observable<any> {
    let response = this.http.get(apiUrl + lessonName);
    return forkJoin([response]);
  }
}
