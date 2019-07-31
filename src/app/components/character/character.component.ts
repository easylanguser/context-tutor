import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-character',
	templateUrl: './character.component.html',
	styleUrls: ['./character.component.scss']
})
export class CharacterComponent {
	@Input("char") char: string;
	@Input("type") type: number;
	constructor() { }
}
