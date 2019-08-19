export class Statistics {
	constructor(
		public id: number,
		public sentenceId: number,
		public lessonId: number,
		public userId: number,
		public correctAnswers: number,
		public wrongAnswers: number,
		public giveUps: number,
		public hintUsages: number,
		public createdAt: string,
		public updatedAt: string) { }
}
