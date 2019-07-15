import { Sentence } from './sentence';
import { Statistics } from './statistics';

export class Lesson {
	sentences: Sentence[] = [];
	statistics: Statistics[] = [];

	constructor(
		public id: number,
		public name: string,
		public url: string,
		public parentId: number,
		public createdAt: string,
		public updatedAt: string,
		public displayedDate: string) { }

	addSentence(sentence: Sentence) {
		this.sentences.push(sentence);
	}

	getSentenceById(id: number): Sentence {
		return this.sentences.find(sentence => sentence.id === id );
	}
}
