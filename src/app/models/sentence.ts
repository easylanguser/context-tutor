import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Sentence {
    constructor(public id: number, public hiddenWord: number[], public text: string) { }
}