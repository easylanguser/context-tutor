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
var UtilsService = /** @class */ (function () {
    function UtilsService() {
    }
    // Get new text from inputText with underscores at indexes and 
    // fill array with indexes of hidden characters for each sentence
    UtilsService.prototype.replaceLettersWithUnderscore = function (inputText, indexes) {
        var textWithHiddenCharacters = inputText.substr(0, indexes[0]);
        var currentSentenceHiddenIndexes = [];
        for (var i = 0; i < indexes.length; i++) {
            currentSentenceHiddenIndexes.push(inputText.charAt(indexes[i]));
            textWithHiddenCharacters += '_';
            textWithHiddenCharacters += inputText.substr(indexes[i] + 1, indexes[i + 1] - indexes[i] - 1);
        }
        textWithHiddenCharacters += inputText.substr(indexes[indexes.length - 1] + 1, inputText.length - indexes[indexes.length - 1] - 1);
        return textWithHiddenCharacters;
    };
    // Show one guessed letter
    UtilsService.prototype.showTextWithGuessedCharacter = function (input, replacement, index) {
        return input.substr(0, index) + replacement + input.substr(index + replacement.length);
    };
    UtilsService = __decorate([
        Injectable({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [])
    ], UtilsService);
    return UtilsService;
}());
export { UtilsService };
//# sourceMappingURL=utils.service.js.map