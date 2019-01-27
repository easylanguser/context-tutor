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
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
var apiUrl = 'https://api.jsonbin.io/b/5c4d9e5da3fb18257ac27084'; //'http://165.227.159.35/filmList';
var LessonsListService = /** @class */ (function () {
    function LessonsListService(http) {
        this.http = http;
    }
    LessonsListService.prototype.getData = function () {
        var response = this.http.get(apiUrl);
        return forkJoin([response]);
    };
    LessonsListService = __decorate([
        Injectable({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [HttpClient])
    ], LessonsListService);
    return LessonsListService;
}());
export { LessonsListService };
//# sourceMappingURL=lessons-list.service.js.map