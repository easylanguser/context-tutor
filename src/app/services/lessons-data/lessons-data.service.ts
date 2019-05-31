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
export class LessonsDataService {

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

	getSentenceByIDs(lessonId: number, sentenceId: number): Sentence {
		return this.getLessonByID(lessonId).sentences.find(
			(sentence: Sentence) => sentence.id === sentenceId
		);
	}

	getRangeOfLessonSentences(lessonId: number, from: number, to: number): Sentence[] {
		return this.getLessonByID(lessonId).sentences.slice(from, to);
	}

	editLesson(lesson: Lesson): void {
		this.lessons[this.lessons.indexOf(this.getLessonByID(lesson.id))] = lesson;
	}

	editSentence(lessonId: number, newSentence: Sentence): void {
		const idx = this.getSentenceNumberByIDs(lessonId, newSentence.id);
		this.getLessonByID(lessonId).sentences[idx] = newSentence;
	}

	async getSentencesByLessonId(id: number): Promise<Sentence[]> {
		const sntns = await this.sentencesAPI.getData(id);

		for (const i in sntns) {
			const hiddenChars: Array<string[]> = [];
			const curCharsIndexes: number[] = [];

			sntns[i].words.sort((a,b) => a[0] - b[0]);
			
			for (const j in sntns[i].words) {
				const chars: string[] = [];
				for (let k = 0; k < sntns[i].words[j][1]; k++) {
					chars.push(sntns[i].text.charAt(sntns[i].words[j][0] + k));
				}
				hiddenChars.push(chars);
				curCharsIndexes.push(0);
			}
			const hiddenSentence = this.utils.hideChars(sntns[i].text, sntns[i].words);
			const sentence = new Sentence(
				sntns[i].id,
				sntns[i].lessonId,
				sntns[i].words,
				sntns[i].text,
				hiddenSentence,
				hiddenChars,
				sntns[i].curCharsIndexes.length === 0
					? curCharsIndexes
					: sntns[i].curCharsIndexes,
				sntns[i].curWordIndex,
				sntns[i].sentenceShown === ""
					? this.utils.addChar(hiddenSentence, '<span class=\'red-text\'>*</span>')
					: sntns[i].sentenceShown,
				sntns[i].solvedStatus,
				sntns[i].updated_at,
				new Statistics(
					sntns[i].correctAnswers,
					sntns[i].wrongAnswers,
					sntns[i].giveUps,
					sntns[i].wordSkips,
					sntns[i].sentenceSkips,
					sntns[i].lessonLeaves,
					sntns[i].hintUsages)
			);
			if (!this.getLessonByID(id).sentences.some(sntn => sntn.id === sentence.id)) {
				this.getLessonByID(id).addSentence(sentence);
			}
		}

		if (this.getLessonByID(id).sentences.length > 0) {
			this.getLessonByID(id).sentences.sort(this.sortSentencesByTime);
		}

		return this.getLessonByID(id).sentences;
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

	async getLessons(): Promise<Lesson[]> {
		const lsn = await this.lessonsAPI.getData();
		const now = new Date().getTime();

		for (let i in lsn) {
			const diff = (now - new Date(lsn[i].created_at).getTime()) / 1000;
			const period = this.calculatePeriod(diff);
			const lesson = new Lesson(
				lsn[i].id,
				lsn[i].name,
				lsn[i].url,
				lsn[i].created_at,
				lsn[i].updated_at,
				period[0] + period[1]);
			if (this.getLessonByID(lesson.id) === undefined) {
				this.addLesson(lesson);
			}
		}

		const promises = [];
		for (const newLesson of this.lessons) {
			promises.push(this.getSentencesByLessonId(newLesson.id));
		}

		return Promise.all(promises);
	}

	sortSentencesByTime(first: Sentence, second: Sentence): number {
		const firstTime = new Date(first.updated_at);
		const secondTime = new Date(second.updated_at);
		if (firstTime < secondTime) {
			return 1;
		} else if (firstTime === secondTime) {
			return 0;
		} else {
			return -1;
		}
	}

	sortLessonsByTime(first: Lesson, second: Lesson): number {
		if (first.sentences.length === 0 || second.sentences.length === 0) {
			return 0;
		}
		const firstDate = new Date(first.sentences[0].updated_at);
		const secondDate = new Date(second.sentences[0].updated_at);
		return firstDate < secondDate ? 1 : -1;
	}
}
