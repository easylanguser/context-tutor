export class Statistics {
	constructor(
		public id: number,
		public sentenceId: number,
		public lessonId: number,
		public userId: number,
		public curCharsIndexes: number[],
		public curWordIndex: number,
		public sentenceShown: string,
		public solvedStatus: boolean,
		public correctAnswers: number,
		public wrongAnswers: number,
		public giveUps: number,
		public hintUsages: number,
		public created_at: string,
		public updated_at: string) { }
}
