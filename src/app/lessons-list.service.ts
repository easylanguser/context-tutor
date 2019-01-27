import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';

const apiUrl = 'https://api.jsonbin.io/b/5c4d9e5da3fb18257ac27084'; //'http://165.227.159.35/filmList';

@Injectable({
  providedIn: 'root'
})

export class LessonsListService {

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    let response = this.http.get(apiUrl);
    return forkJoin([response]);
  }
}
