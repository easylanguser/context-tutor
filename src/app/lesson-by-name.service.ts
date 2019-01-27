import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';

const apiUrl = 'https://api.jsonbin.io/b/5c4d9eaea3fb18257ac270ba/1'; //'http://165.227.159.35/film/?name='; 

@Injectable({
  providedIn: 'root'
})

export class LessonByNameService {

  constructor(private http: HttpClient) { }

  getData(lessonName: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'json'})
    };
    let response = this.http.get(apiUrl /* + lessonName */, httpOptions);
    return forkJoin([response]);
  }
}
