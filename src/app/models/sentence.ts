import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Sentence {
    constructor(
        public id: number, 
        public hiddenWord: Array<[number, number]>, 
        public text: string, 
        public textUnderscored: string,
        public isSolved: boolean) { }
}