import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

const apiUrl = 'http://165.227.159.35/filmList';

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
