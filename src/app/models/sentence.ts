export class Sentence {
	constructor(
		public id: number,
		public lessonId: number,
		public words: Array<[number, number]>,
		public text: string,
		public textUnderscored: string,
		public hiddenChars: Array<string[]>,
		public sentencesListSentence: string,
		public createdAt: string,
		public updatedAt: string) { }
}
