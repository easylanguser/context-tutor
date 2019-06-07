import { Statistics } from './statistics';

export class Sentence {
	constructor(
		public id: number,
		public lessonId: number,
		public hiddenWord: Array<[number, number]>,
		public text: string,
		public textUnderscored: string,
		public hiddenChars: Array<string[]>,
		public curCharsIndexes: number[],
		public curWordIndex: number,
		public sentenceShown: string,
		public solvedStatus: boolean,
		public created_at: string,
		public updated_at: string,
		public statistics: Statistics) { }
}
