import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import {HttpService} from "../http/rest/http.service";

const apiUrl = 'http://165.227.159.35/lessons/getLessons';

@Injectable({
  providedIn: 'root'
})

export class LessonsListService {

  constructor(private httpService: HttpService) { }

  getData(): Observable<any> {
    let response = this.httpService.doGet(apiUrl);
    return forkJoin([response]);
  }
}