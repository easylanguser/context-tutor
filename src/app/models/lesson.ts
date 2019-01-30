import { Injectable } from '@angular/core';
import { Sentence } from './sentence';

@Injectable({
    providedIn: 'root'
})
export class Lesson {
    sentences: Sentence[] = [];

    constructor(public id: number, public name: string, public url: string, public created_at: string) { }

    addSentence(sentence: Sentence): void {
        this.sentences.push(sentence);
    }

    removeSentence(sentenceToRemove: Sentence): void {
        const index = this.sentences.indexOf(sentenceToRemove);
        if (index > -1) {
            this.sentences.splice(index, 1);
        }
    }
}