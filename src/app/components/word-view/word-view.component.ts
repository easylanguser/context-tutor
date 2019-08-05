import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'word-view',
	templateUrl: './word-view.component.html',
	styleUrls: ['./word-view.component.scss']
})
export class WordViewComponent implements OnInit {

	alphabet: any;
	guessWord: { char: string, type: number }[] = [];

	@Input("index") index: number;
	@Input("allCharacters") allCharacters: any;
	@Input("guessChar") guessChar: string;
	@Input("isActive") isActive: boolean;
	@Input("fullWord") fullWord: string;

	@Output() guessProgress = new EventEmitter<string>();

	constructor() { }

	ngOnInit() {
		if (typeof this.allCharacters === 'string') {
			this.allCharacters = this.allCharacters.split('');
		}
		
		for (let i = 0; i < this.allCharacters.length; i++) {
			this.guessWord.push({
				char: this.allCharacters[i],
				type: (this.index > i) ? 0 : ((this.index === i) ? 1 : 2)
			});
		}

		if (this.isActive && this.index === this.allCharacters.length) {
			this.isActive = false;
		}
	}

	ngOnChanges() {	
		if (this.isActive && this.guessChar) {
			if (this.allCharacters[this.index].toUpperCase() === this.guessChar.toUpperCase()) {
				this.guessWord[this.index].type = 0;
				if (this.index >= this.allCharacters.length - 1) {
					this.guessProgress.emit('full_guess');
				} else {
					this.guessWord[this.index + 1].type = 1;
					this.guessProgress.emit('correct_guess');
				}
				this.index++;
			} else {
				this.guessWord[this.index].type = 3;
				this.guessProgress.emit(this.guessChar);
			}
		}
	}
}
