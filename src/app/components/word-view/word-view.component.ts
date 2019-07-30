import { Component, Input, OnInit } from '@angular/core';
import '../../../assets/chars-accordance.json';
import { UtilsService } from 'src/app/services/utils/utils.service.js';

@Component({
	selector: 'word-view',
	templateUrl: './word-view.component.html',
	styleUrls: ['./word-view.component.scss']
})
export class WordViewComponent implements OnInit {

	alphabet: any;
	@Input("allCharacters") allCharacters: any;
	@Input("index") index: number;
	@Input("language") language: string;

	constructor(private utils: UtilsService) { }

	async ngOnInit() {
		this.alphabet = await this.utils.getCharsAccordance();
		if (typeof this.allCharacters === 'object') {
			this.allCharacters = this.allCharacters.join('');
		} else {
			this.allCharacters = '';
		}
		this.index = this.index >= 0 ? this.index : 0;
		this.language = this.alphabet[this.language] ? this.language : 'english';
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
