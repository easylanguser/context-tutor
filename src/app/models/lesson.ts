import { Sentence } from './sentence';

export class Lesson {
	sentences: Sentence[] = [];

	constructor(
		public id: number,
		public name: string,
		public url: string,
		public created_at: string,
		public displayedDate: string) { }

	addSentence(sentence: Sentence): void {
		this.sentences.push(sentence);
	}
}
