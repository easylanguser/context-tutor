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
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UtilsService } from '../utils.service';
import { LessonByNameService } from '../lesson-by-name.service';
import { Storage } from '@ionic/storage';
var SentenceGuessPage = /** @class */ (function () {
    function SentenceGuessPage(api, route, loadingController, util, storage) {
        this.api = api;
        this.route = route;
        this.loadingController = loadingController;
        this.util = util;
        this.storage = storage;
        this.numberOfGuesses = 0;
        this.firstCharacter = 'V';
        this.secondCharacter = 'D';
        this.thirdCharacter = 'L';
    }
    SentenceGuessPage.prototype.ngOnInit = function () {
        this.sentenceIndex = Number(this.route.snapshot.queryParamMap.get('first')) + 1;
        this.getData(this.route.snapshot.queryParamMap.get('lesson'));
    };
    ;
    // Get selected lesson from API
    SentenceGuessPage.prototype.getData = function (lesson) {
        return __awaiter(this, void 0, void 0, function () {
            var loading;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.lessonName = lesson;
                        return [4 /*yield*/, this.loadingController.create({
                                message: 'Loading'
                            })];
                    case 1:
                        loading = _a.sent();
                        return [4 /*yield*/, loading.present()];
                    case 2:
                        _a.sent();
                        this.storage.get(lesson + 'length').then(function (length) {
                            if (length !== null) {
                                _this.lessonLength = length;
                                _this.storage.get(lesson + 's' + (_this.sentenceIndex - 1) + 'idxs')
                                    .then(function (val) { _this.indexes = Object.assign([], val); });
                                _this.storage.get(lesson + 's' + (_this.sentenceIndex - 1) + 'textunderscored')
                                    .then(function (val) { _this.sentencesWithUnderscores = val; });
                                _this.storage.get(_this.lessonName + 's' + (_this.sentenceIndex - 1) + 'hiddenchars')
                                    .then(function (val) { _this.hiddenCharacters = val; });
                                _this.storage.get(_this.lessonName + 's' + (_this.sentenceIndex - 1) + 'guesses')
                                    .then(function (val) {
                                    if (val !== null) {
                                        _this.numberOfGuesses = val;
                                    }
                                    else {
                                        _this.numberOfGuesses = 0;
                                    }
                                    var restoreIndexes = _this.indexes.slice(0, _this.numberOfGuesses);
                                    var restoreCharacters = _this.hiddenCharacters.slice(0, _this.numberOfGuesses);
                                    _this.sentenceToShow = _this.sentencesWithUnderscores;
                                    for (var i in restoreIndexes) {
                                        _this.sentenceToShow = _this.util.showTextWithGuessedCharacter(_this.sentenceToShow, restoreCharacters[i], i);
                                    }
                                });
                                loading.dismiss();
                            }
                            else {
                                _this.api.getData(lesson)
                                    .subscribe(function (res) {
                                    _this.processLesson((res[0]).response);
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
    // Get hidden characters of the lesson, their 
    // indexes and create sentence with underscores
    SentenceGuessPage.prototype.processLesson = function (lesson) {
        this.lessonLength = lesson.length;
        this.indexes = lesson[this.sentenceIndex - 1][0].hidenWords;
        this.fullSentence = lesson[this.sentenceIndex - 1][0].text;
        this.sentenceToShow = this.util.replaceLettersWithUnderscore(this.fullSentence, this.indexes);
        for (var i = 0; i < this.indexes.length; i++) {
            this.hiddenCharacters.push((this.fullSentence).charAt(this.indexes[i]));
        }
    };
    // Show if lesson if over
    SentenceGuessPage.prototype.presentLoadingDefault = function () {
        return __awaiter(this, void 0, void 0, function () {
            var loading;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadingController.create({
                            message: 'Lesson is over'
                        })];
                    case 1:
                        loading = _a.sent();
                        return [4 /*yield*/, loading.present()];
                    case 2:
                        _a.sent();
                        setTimeout(function () {
                            loading.dismiss();
                        }, 1000);
                        return [2 /*return*/];
                }
            });
        });
    };
    // Filling in characters into underscores by keyboard
    // If input is wrong - replace with sentence with underscores
    // If lesson is over - show info
    SentenceGuessPage.prototype.handleKeyboardEvent = function (event) {
        if (this.numberOfGuesses === this.hiddenCharacters.length) {
            this.presentLoadingDefault();
            return;
        }
        if (event.key === this.hiddenCharacters[this.numberOfGuesses]) {
            this.sentenceToShow = this.util.showTextWithGuessedCharacter(this.sentenceToShow, this.hiddenCharacters[this.numberOfGuesses], this.indexes[this.numberOfGuesses]);
            ++this.numberOfGuesses;
        }
        else {
            this.sentenceToShow = this.sentencesWithUnderscores;
            this.numberOfGuesses = 0;
        }
        this.storage.set(this.lessonName + 's' + (this.sentenceIndex - 1) + 'guesses', this.numberOfGuesses);
    };
    SentenceGuessPage = __decorate([
        Component({
            selector: 'app-sentence-guess',
            templateUrl: './sentence-guess.page.html',
            styleUrls: ['./sentence-guess.page.scss'],
            host: {
                '(document:keypress)': 'handleKeyboardEvent($event)'
            }
        }),
        __metadata("design:paramtypes", [LessonByNameService,
            ActivatedRoute,
            LoadingController,
            UtilsService,
            Storage])
    ], SentenceGuessPage);
    return SentenceGuessPage;
}());
export { SentenceGuessPage };
//# sourceMappingURL=sentence-guess.page.js.map