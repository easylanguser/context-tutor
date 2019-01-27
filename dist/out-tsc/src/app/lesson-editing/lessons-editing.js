var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LessonByNameService } from '../lesson-by-name.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UtilsService } from '../utils.service';
import { Storage } from '@ionic/storage';
var LessonsEditingPage = /** @class */ (function () {
    function LessonsEditingPage(api, loadingController, util, route, router, storage) {
        this.api = api;
        this.loadingController = loadingController;
        this.util = util;
        this.route = route;
        this.router = router;
        this.storage = storage;
        this.indexes = [];
        this.sentences = [];
        this.sentencesWithUnderscores = [];
    }
    LessonsEditingPage.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.subscribe(function (params) {
            _this.lessonName = params['name'];
            _this.getData(_this.lessonName);
        });
    };
    // Open sentence to guess by clicking on it in the list
    LessonsEditingPage.prototype.openSentence = function (lessonNumber) {
        this.router.navigate(['sentence-guess'], { queryParams: { first: lessonNumber, lesson: this.lessonName } });
    };
    // Get sentences by certain lesson
    LessonsEditingPage.prototype.getData = function (lessonName) {
        return __awaiter(this, void 0, void 0, function () {
            var loading;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadingController.create({ message: 'Loading' })];
                    case 1:
                        loading = _a.sent();
                        return [4 /*yield*/, loading.present()];
                    case 2:
                        _a.sent();
                        this.storage.get(this.lessonName + 'length').then(function (length) {
                            if (length !== null) {
                                for (var i = 0; i < length; i++) {
                                    _this.storage.get(_this.lessonName + 's' + i + 'source')
                                        .then(function (val) { _this.sentences.push(val); });
                                    _this.storage.get(_this.lessonName + 's' + i + 'idxs')
                                        .then(function (val) { _this.indexes.push(val); });
                                    _this.storage.get(_this.lessonName + 's' + i + 'textunderscored')
                                        .then(function (val) { _this.sentencesWithUnderscores.push(val); });
                                }
                                loading.dismiss();
                            }
                            else {
                                _this.api.getData(lessonName)
                                    .subscribe(function (res) {
                                    var lesson = (res[0]).response;
                                    for (var i = 0; i < lesson.length; i++) {
                                        _this.sentences.push(lesson[i][0].text);
                                        _this.indexes.push(lesson[i][0].hidenWords);
                                        _this.sentencesWithUnderscores.push(_this.util.replaceLettersWithUnderscore(_this.sentences[i], _this.indexes[i]));
                                        _this.storage.set(_this.lessonName + 's' + i + 'source', _this.sentences[i]);
                                        _this.storage.set(_this.lessonName + 's' + i + 'idxs', _this.indexes[i]);
                                        _this.storage.set(_this.lessonName + 's' + i + 'textunderscored', _this.sentencesWithUnderscores[i]);
                                        var hiddenCharacters = [];
                                        for (var j = 0; j < _this.indexes[i].length; j++) {
                                            hiddenCharacters.push(_this.sentences[i].charAt(_this.indexes[i][j]));
                                        }
                                        _this.storage.set(_this.lessonName + 's' + i + 'hiddenchars', hiddenCharacters);
                                    }
                                    _this.storage.set(_this.lessonName + 'length', lesson.length);
                                    loading.dismiss();
                                }, function (err) {
                                    console.log(err);
                                    loading.dismiss();
                                });
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    LessonsEditingPage = __decorate([
        Component({
            selector: 'page-lessons-editing',
            templateUrl: 'lessons-editing.html',
            styleUrls: ['lessons-editing.scss'],
        }),
        __metadata("design:paramtypes", [LessonByNameService,
            LoadingController,
            UtilsService,
            ActivatedRoute,
            Router,
            Storage])
    ], LessonsEditingPage);
    return LessonsEditingPage;
}());
export { LessonsEditingPage };
//# sourceMappingURL=lessons-editing.js.map