import { Statistics } from './statistics';

export class Sentence {
	constructor(
		public id: number,
		public hiddenWord: Array<[number, number]>,
		public text: string,
		public textUnderscored: string,
		public hiddenChars: Array<string[]>,
		public curCharsIndexes: number[],
		public curWordIndex: number,
		public sentenceShown: string,
		public isSolved: boolean,
		public statistics: Statistics) { }
}
