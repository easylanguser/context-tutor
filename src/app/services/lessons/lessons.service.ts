import { UtilsService } from '../utils/utils.service';
import { SentencesByLessonService } from '../http/sentences-by-lesson/sentences-by-lesson.service';
import { Injectable } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { LessonsListService } from '../http/lessons-list/lessons-list.service';
import { Sentence } from 'src/app/models/sentence';
import { Statistics } from 'src/app/models/statistics';

@Injectable({
	providedIn: 'root'
})
export class LessonsService {

	lessons: Lesson[] = [];

	constructor(
		private lessonsAPI: LessonsListService,
		private sentencesAPI: SentencesByLessonService,
		private utils: UtilsService) { }

	addLesson(lesson: Lesson): void {
		this.lessons.push(lesson);
	}

	removeLesson(lessonToRemoveId: number): void {
		const index = this.lessons.indexOf(this.getLessonByID(lessonToRemoveId));
		if (index > -1) {
			this.lessons.splice(index, 1);
		}
	}

	removeSentence(lessonId: number, sentenceToRemoveId: number): void {
		const index = this.getSentenceNumberByIDs(lessonId, sentenceToRemoveId);
		if (index > -1) {
			this.getLessonByID(lessonId).sentences.splice(index, 1);
		}
	}

	removeAllLessonSentences(lessonId: number): void {
		this.getLessonByID(lessonId).sentences = [];
	}

	getLessonByID(id: number): Lesson {
		return this.lessons.find(lesson => lesson.id === id);
	}

	getSentenceNumberByIDs(lessonId: number, sentenceId: number): number {
		return this.getLessonByID(lessonId).sentences.findIndex(
			(sentence: Sentence) => sentence.id === sentenceId
		);
	}

	getRangeOfLessonSentences(lessonId: number, from: number, to: number): Sentence[] {
		return this.getLessonByID(lessonId).sentences.slice(from, to);
	}

	editLesson(lesson: Lesson): void {
		this.lessons[this.lessons.indexOf(this.getLessonByID(lesson.id))] = lesson;
	}

	getSentencesByLessonId(id: number): Promise<Sentence[]> {
		return this.sentencesAPI.getData(id).toPromise().then(res => {
			const lsn = res[0];
			for (const i in lsn) {
				const hiddenChars: Array<string[]> = [];
				const curCharsIndexes: number[] = [];
				for (const j in lsn[i].words) {
					const chars: string[] = [];
					for (let k = 0; k < lsn[i].words[j][1]; k++) {
						chars.push(lsn[i].text.charAt(lsn[i].words[j][0] + k));
					}
					hiddenChars.push(chars);
					curCharsIndexes.push(0);
				}
				const hiddenSentence = this.utils.hideChars(lsn[i].text, lsn[i].words);

				const sentence = new Sentence(
					lsn[i].id,
					lsn[i].lessonId,
					lsn[i].words,
					lsn[i].text,
					hiddenSentence,
					hiddenChars,
					lsn[i].curCharsIndexes.length === 0 ? curCharsIndexes : lsn[i].curCharsIndexes,
					lsn[i].curWordIndex,
					lsn[i].sentenceShown === ""
						? this.utils.addChar(hiddenSentence, '?')
						: lsn[i].sentenceShown,
					lsn[i].solvedStatus,
					lsn[i].updated_at,
					new Statistics(
						lsn[i].correctAnswers,
						lsn[i].wrongAnswers,
						lsn[i].giveUps,
						lsn[i].wordSkips,
						lsn[i].sentenceSkips,
						lsn[i].lessonLeaves,
						lsn[i].hintUsages));
				if (!this.getLessonByID(id).sentences.some(sntn => sntn.id === sentence.id)) {
					this.getLessonByID(id).addSentence(sentence);
				}
			}
			this.getLessonByID(id).sentences.sort(this.sortByTime);

			return this.getLessonByID(id).sentences;
		});
	}

	calculatePeriod(diff: number): [number, string] {
		let label: string, flooredValue: number;

		if (diff < 60) {
			flooredValue = Math.floor(diff);
			label = ' seconds ago';
			if (flooredValue === 1) { label = ' second ago'; }
		} else if (diff >= 60 && diff < 3600) {
			flooredValue = Math.floor(diff / 60);
			label = ' minutes ago';
			if (flooredValue === 1) { label = ' minute ago'; }
		} else if (diff >= 3600 && diff < 86400) {
			flooredValue = Math.floor(diff / 3600);
			label = ' hours ago';
			if (flooredValue === 1) { label = ' hour ago'; }
		} else if (diff >= 86400 && diff < 1209600) {
			flooredValue = Math.floor(diff / 86400);
			label = ' days ago';
			if (flooredValue === 1) { label = ' day ago'; }
		} else if (diff >= 1209600 && diff < 2678400) {
			flooredValue = Math.floor(diff / 604800);
			label = ' weeks ago';
		} else {
			flooredValue = Math.floor(diff / 2678400);
			label = ' months ago';
			if (flooredValue === 1) { label = ' month ago'; }
		}

		return [flooredValue, label];
	}

	getLessons(): Promise<Lesson[]> {
		return this.lessonsAPI.getData().toPromise().then(res => {
			const now = new Date().getTime();
			for (let i in res[0]) {
				const diff = (now - new Date(res[0][i].created_at).getTime()) / 1000;
				const period = this.calculatePeriod(diff);

				const lesson = new Lesson(
					res[0][i].id,
					res[0][i].name,
					res[0][i].url,
					res[0][i].created_at,
					res[0][i].updated_at,
					period[0] + period[1]);

				if (this.getLessonByID(lesson.id) === undefined) {
					this.addLesson(lesson);
				}
			}

			this.lessons.sort(this.sortByTime);

			const promises = [];
			for (const lesson of this.lessons) {
				promises.push(this.getSentencesByLessonId(lesson.id));
			}

			return Promise.all(promises);
		});
	}

	private sortByTime(first: any, second: any) {
		return new Date(first.updated_at).getTime() < new Date(second.updated_at).getTime() ? 1 : -1;
	}
}
