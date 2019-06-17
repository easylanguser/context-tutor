import { Statistics } from './statistics';

export class Sentence {
	constructor(
		public id: number,
		public lessonId: number,
		public words: Array<[number, number]>,
		public text: string,
		public textUnderscored: string,
		public hiddenChars: Array<string[]>,
		public created_at: string,
		public updated_at: string) { }
}
