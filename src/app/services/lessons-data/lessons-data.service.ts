import { UtilsService, charForHiding, blueCharForHiding } from '../utils/utils.service';
import { Injectable } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { Sentence } from 'src/app/models/sentence';
import { Statistics } from 'src/app/models/statistics';
import { LessonHttpService } from '../http/lessons/lesson-http.service';
import { SentenceHttpService } from '../http/sentences/sentence-http.service';
import { StatisticHttpService } from '../http/statistics/statistic-http.service';

interface ILesson {
    id: number;
    name: string;
    url: string;
	created_at: string;
	updated_at: string;
}

interface ISentence {
	id: number;
	lesson_id: number;
	text: string;
	words: [number, number][];
	selectors: string[];
	selectors_words: string[];
	created_at: string;
	updated_at: string;
}

interface IStatistic {
	id: number;
	userId: number;
	lessonId: number;
	sentenceId: number;
	timeSpent: number;
	correctAnswers: number;
	giveUps: number;
	hintUsages: number;
	wrongAnswers: number;
	createdAt: string;
	updatedAt: string;
}

@Injectable({
	providedIn: 'root'
})
export class LessonsDataService {

	lessons: Lesson[] = [];

	constructor(
		private lessonHttpService: LessonHttpService,
		private sentenceHttpService: SentenceHttpService,
		private statisticHttpService: StatisticHttpService,
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
		const apiSentences: ISentence[] = await this.sentenceHttpService.getLessonSentences(id);

		for (const apiSentence of apiSentences) {
			const hiddenChars: Array<string[]> = [];

			apiSentence.words.sort((a, b) => a[0] - b[0]);

			for (const i in apiSentence.words) {
				const chars: string[] = [];
				for (let j = 0; j < apiSentence.words[i][1]; j++) {
					chars.push(apiSentence.text.charAt(apiSentence.words[i][0] + j));
				}
				hiddenChars.push(chars);
			}
			const hiddenSentence = this.utils.hideChars(apiSentence.text, apiSentence.words, charForHiding);
			const sentencesListSentence = this.utils.hideChars(apiSentence.text, apiSentence.words, blueCharForHiding);
			const sentence = new Sentence(
				apiSentence.id,
				apiSentence.lesson_id,
				apiSentence.words,
				apiSentence.text,
				hiddenSentence,
				hiddenChars,
				sentencesListSentence,
				apiSentence.created_at,
				apiSentence.updated_at);
			if (!this.getLessonByID(id).sentences.some(sntnc => sntnc.id === sentence.id)) {
				this.getLessonByID(id).addSentence(sentence);
			}

			const stat = this.getStatisticsOfSentence(sentence);
			for (const _ in sentence.hiddenChars) {
				stat.curCharsIndexes.push(0);
			}
		}

		if (this.getLessonByID(id).sentences.length > 0) {
			this.getLessonByID(id).sentences.sort(this.sortSentencesByAddingTime);
		}

		return this.getLessonByID(id).sentences;
	}

	async getStatisticByUser(): Promise<Statistics[]> {
		const apiStatistics: IStatistic[] = await this.statisticHttpService.getStatisticsOfUser();
		const statisticsArray: Statistics[] = [];

		for (const apiStatistic of apiStatistics) {
			this.getLessonByID(apiStatistic.lessonId).statistics.push(
				(new Statistics(
					apiStatistic.id,
					apiStatistic.sentenceId,
					apiStatistic.lessonId,
					apiStatistic.userId,
					[], 0,
					false,
					apiStatistic.correctAnswers,
					apiStatistic.wrongAnswers,
					apiStatistic.giveUps,
					apiStatistic.hintUsages,
					apiStatistic.createdAt,
					apiStatistic.updatedAt)
			));
		}

		return statisticsArray;
	}

	async refreshLessons(): Promise<void> {
		const apiLessons: ILesson[] = await this.lessonHttpService.getLessons();
		this.lessons = [];
		const now = new Date().getTime();

		for (let apiLesson of apiLessons) {
			const diff = (now - new Date(apiLesson.created_at).getTime()) / 1000;
			const period = this.utils.calculatePeriod(diff);
			const lesson = new Lesson(
				apiLesson.id,
				apiLesson.name,
				apiLesson.url,
				apiLesson.created_at,
				apiLesson.updated_at,
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
