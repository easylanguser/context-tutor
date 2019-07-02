import { UtilsService, charForHiding, blueCharForHiding } from '../utils/utils.service';
import { Injectable } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { Sentence } from 'src/app/models/sentence';
import { Statistics } from 'src/app/models/statistics';
import { HttpService } from '../http/rest/http.service';

@Injectable({
	providedIn: 'root'
})
export class LessonsDataService {

	lessons: Lesson[] = [];

	constructor(
		private http: HttpService, 
		private utils: UtilsService) { }

	addLesson(lesson: Lesson) {
		this.lessons.push(lesson);
	}

	removeLesson(lessonToRemoveId: number) {
		const index = this.lessons.indexOf(this.getLessonByID(lessonToRemoveId));
		if (index > -1) {
			this.lessons.splice(index, 1);
		}
	}

	removeSentence(lessonId: number, sentenceToRemoveId: number) {
		const index = this.getSentenceNumberByIDs(lessonId, sentenceToRemoveId);
		if (index > -1) {
			this.getLessonByID(lessonId).sentences.splice(index, 1);
		}
	}

	removeAllLessonSentences(lessonId: number) {
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

	editLesson(lesson: Lesson) {
		this.lessons[this.lessons.indexOf(this.getLessonByID(lesson.id))] = lesson;
	}

	editSentence(lessonId: number, newSentence: Sentence) {
		const idx = this.getSentenceNumberByIDs(lessonId, newSentence.id);
		this.getLessonByID(lessonId).sentences[idx] = newSentence;
	}

	getStatisticsOfSentence(sentence: Sentence): Statistics {
		const lessonToSearchIn = this.lessons.find(lesson => lesson.id === sentence.lessonId);
		return lessonToSearchIn.statistics.find(stat => stat.sentenceId === sentence.id);
	}

	async getSentencesByLessonId(id: number): Promise<Sentence[]> {
		const sntns = await this.http.doGet('../assets/sentences-data.json').toPromise();

		for (const i in sntns) {
			const hiddenChars: Array<string[]> = [];

			sntns[i].words.sort((a, b) => a[0] - b[0]);

			for (const j in sntns[i].words) {
				const chars: string[] = [];
				for (let k = 0; k < sntns[i].words[j][1]; k++) {
					chars.push(sntns[i].text.charAt(sntns[i].words[j][0] + k));
				}
				hiddenChars.push(chars);
			}
			const hiddenSentence = this.utils.hideChars(sntns[i].text, sntns[i].words, charForHiding);
			const sentencesListSentence = this.utils.hideChars(sntns[i].text, sntns[i].words, blueCharForHiding);
			const sentence = new Sentence(
				sntns[i].id,
				sntns[i].lesson_id,
				sntns[i].words,
				sntns[i].text,
				hiddenSentence,
				hiddenChars,
				sentencesListSentence,
				sntns[i].created_at,
				sntns[i].updated_at);
			if (!this.getLessonByID(id).sentences.some(sntn => sntn.id === sentence.id)) {
				this.getLessonByID(id).addSentence(sentence);
			}

			const stat = this.getStatisticsOfSentence(sentence);
			for (let _ in sentence.hiddenChars) {
				stat.curCharsIndexes.push(0);
			}
		}

		if (this.getLessonByID(id).sentences.length > 0) {
			this.getLessonByID(id).sentences.sort(this.sortSentencesByAddingTime);
		}

		return this.getLessonByID(id).sentences;
	}

	async getStatisticByUser(): Promise<Statistics[]> {
		const statistic = await this.http.doGet('../assets/statistics-data.json').toPromise();
		const statisticsArray: Statistics[] = [];

		for (const i in statistic) {
			this.getLessonByID(statistic[i]['lessonId']).statistics.push(
				(new Statistics(
					statistic[i].id,
					statistic[i].sentenceId,
					statistic[i].lessonId,
					statistic[i].userId,
					[], 0,
					false,
					statistic[i].correctAnswers,
					statistic[i].wrongAnswers,
					statistic[i].giveUps,
					statistic[i].hintUsages,
					statistic[i].created_at,
					statistic[i].updated_at)
			));
		}

		return statisticsArray;
	}

	calculatePeriod(diff: number): [string, string] {
		let label: string, flooredValue: string;

		if (diff < 60) {
			flooredValue = '';
			label = 'A moment ago';
		} else if (diff >= 60 && diff < 3600) {
			flooredValue = String(Math.floor(diff / 60));
			label = ' minutes ago';
			if (flooredValue === '1') { label = ' minute ago'; }
		} else if (diff >= 3600 && diff < 86400) {
			flooredValue = String(Math.floor(diff / 3600));
			label = ' hours ago';
			if (flooredValue === '1') { label = ' hour ago'; }
		} else if (diff >= 86400 && diff < 1209600) {
			flooredValue = String(Math.floor(diff / 86400));
			label = ' days ago';
			if (flooredValue === '1') { label = ' day ago'; }
		} else if (diff >= 1209600 && diff < 2678400) {
			flooredValue = String(Math.floor(diff / 604800));
			label = ' weeks ago';
		} else {
			flooredValue = String(Math.floor(diff / 2678400));
			label = ' months ago';
			if (flooredValue === '1') { label = ' month ago'; }
		}

		return [flooredValue, label];
	}

	async refreshLessons(): Promise<void> {
		const lsn = await this.http.doGet('../assets/lessons-data.json').toPromise();
		this.lessons = [];
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

			this.addLesson(lesson);
		}

		await this.getStatisticByUser();
	}

	sortSentencesByAddingTime(first: Sentence, second: Sentence): number {
		const firstTime = new Date(first.created_at);
		const secondTime = new Date(second.created_at);
		if (firstTime > secondTime) {
			return 1;
		} else if (firstTime === secondTime) {
			return 0;
		} else {
			return -1;
		}
	}

	sortLessonsByTime(first: Lesson, second: Lesson): number {
		if (first.statistics.length === 0) {
			return -1;
		}
		if (second.statistics.length === 0) {
			return 1;
		}
		const firstLatestUpd = new Date(Math.max.apply(null, first.statistics.map(elem => new Date(elem.updated_at))));
		const secondLatestUpd = new Date(Math.max.apply(null, second.statistics.map(elem => new Date(elem.updated_at))));

		return firstLatestUpd < secondLatestUpd ? 1 : -1;
	}
}
