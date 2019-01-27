var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
var apiUrl = 'https://api.jsonbin.io/b/5c4d9eaea3fb18257ac270ba/1'; //'http://165.227.159.35/film/?name='; 
var LessonByNameService = /** @class */ (function () {
    function LessonByNameService(http) {
        this.http = http;
    }
    LessonByNameService.prototype.getData = function (lessonName) {
        var httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'json' })
        };
        var response = this.http.get(apiUrl /* + lessonName */, httpOptions);
        return forkJoin([response]);
    };
    LessonByNameService = __decorate([
        Injectable({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [HttpClient])
    ], LessonByNameService);
    return LessonByNameService;
}());
export { LessonByNameService };
//# sourceMappingURL=lesson-by-name.service.js.map