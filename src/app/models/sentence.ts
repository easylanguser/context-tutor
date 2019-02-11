import { Injectable } from '@angular/core';
import { Statistics } from './statistics';

@Injectable({
    providedIn: 'root'
})
export class Sentence {
    constructor(
        public id: number, 
        public hiddenWord: Array<[number, number]>, 
        public text: string, 
        public textUnderscored: string,
        public curCharsIndexes: number[],
        public curWordIndex: number,
        public isSolved: boolean,
        public statistics: Statistics) { }
}