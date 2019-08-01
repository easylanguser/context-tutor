import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import '../../../assets/chars-accordance.json';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: 'word-view',
	templateUrl: './word-view.component.html',
	styleUrls: ['./word-view.component.scss']
})
export class WordViewComponent implements OnInit {

	alphabet: any;
	guessedWord: { char: string, type: number }[] = [];

	@Input("index") index: number;
	@Input("allCharacters") allCharacters: any;
	@Input("guessChar") guessChar: string;
	@Input("language") language: string;
	@Input("isActive") isActive: boolean;

	@Output() guessProgress = new EventEmitter();

	constructor(private utils: UtilsService) { }

	async ngOnInit() {
		this.alphabet = await this.utils.getCharsAccordance();

		if (typeof this.allCharacters === 'string') {
			this.allCharacters = this.allCharacters.split('');
		}
		
		for (let i = 0; i < this.allCharacters.length; i++) {
			this.guessedWord.push({
				char: this.allCharacters[i],
				type: (this.index > i) ? 0 : ((this.index === i) ? 1 : 2)
			});
		}

		this.language = this.alphabet[this.language] ? this.language : 'english';
	}

	ngOnChanges() {	
		if (this.isActive && this.guessChar) {
			if (this.allCharacters[this.index].toUpperCase() === this.guessChar.toUpperCase()) {
				this.guessedWord[this.index].type = 0;
				if (this.index === this.allCharacters.length - 1) {
					this.guessProgress.emit('full_guess');
				} else {
					this.guessedWord[this.index + 1].type = 1;
					this.guessProgress.emit('correct_guess');
				}
				this.index++;
			} else {
				this.guessedWord[this.index].type = 3;
				this.guessProgress.emit(this.guessChar);
			}
		}
	}

	getCurGroup() {
		const curLang = this.alphabet[this.language];
		const curCharacter = this.allCharacters.charAt(this.index);
		if (!curLang || !curCharacter) {
			return false;
		}
		const upperCase = curCharacter === curCharacter.toUpperCase();
		let curGroup = curLang.groups.filter(g =>
			g.toUpperCase().indexOf(curCharacter.toUpperCase()) !== -1
		)[0];
		if (!curGroup) {
			curGroup = this._createNewGroup(curLang.alphabet, curCharacter);
		}
		return upperCase ? curGroup.toUpperCase() : curGroup.toLowerCase();
	}

	_createNewGroup(str, curCharacter) {
		let curGroup = curCharacter;
		for (let i = 0; i < 3;) {
			let rand = this.chooseRandomCharFromString(str);
			if (curGroup.split('').every(e => e.toUpperCase() !== rand.toUpperCase())) {
				curGroup += rand;
				i++;
			}
		}
		return this.randomSortStr(curGroup);
	}

	chooseRandomCharFromString(str) {
		return str.charAt(Math.floor(Math.random() * str.length));
	}

	randomSortStr(str) {
		function compareRandom(a, b) {
			return Math.random() - 0.5;
		}
		let arr = str.split('');
		arr.sort(compareRandom);
		return arr.join('');
	}

	openChar() {
		if (this.allCharacters.charAt(this.index)) {
			this.index++;
			if (this.index >= this.allCharacters.length) {
				return 1;
			}
			return this.getCurGroup();
		}
		return 0;
	}
}
