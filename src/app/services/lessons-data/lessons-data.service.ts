import { UtilsService } from '../utils/utils.service';
import { Injectable } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { Sentence } from 'src/app/models/sentence';
import { Statistics } from 'src/app/models/statistics';
import { LessonHttpService } from '../http/lessons/lesson-http.service';
import { SentenceHttpService } from '../http/sentences/sentence-http.service';
import { StatisticHttpService } from '../http/statistics/statistic-http.service';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Globals } from '../globals/globals';

interface ILesson {
	id: number;
	userId: number;
	name: string;
	url: string;
	parentId: number;
	createdAt: string;
	updatedAt: string;
}

interface ISentence {
	id: number;
	lessonId: number;
	text: string;
	words: [number, number][];
	selectors: string[];
	selectorsWords: string[];
	createdAt: string;
	updatedAt: string;
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

interface IDemoSentence {
	id: number;
	text: string;
	words: [number, number][];
}

interface IDemoLesson {
	id: number;
	name: string;
	url: string;
	sentences: IDemoSentence[];
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
		private utils: UtilsService,
		private globals: Globals,
		private http: HttpClient,
		private storage: Storage) { }

	addLesson(lesson: Lesson) {
		this.lessons.push(lesson);
	}

	removeLesson(lessonToRemoveId: number) {
		const index = this.lessons.indexOf(this.getLessonById(lessonToRemoveId));
		if (index > -1) {
			this.lessons.splice(index, 1);
		}
	}

	removeSentence(lessonId: number, sentenceToRemoveId: number) {
		const index = this.getSentenceNumberByIds(lessonId, sentenceToRemoveId);
		if (index > -1) {
			this.getLessonById(lessonId).sentences.splice(index, 1);
		}
	}

	removeAllLessonSentences(lessonId: number) {
		this.getLessonById(lessonId).sentences = [];
	}

	getLessonById(id: number): Lesson {
		return this.lessons.find(lesson => lesson.id === id);
	}

	getSentenceNumberByIds(lessonId: number, sentenceId: number): number {
		return this.getLessonById(lessonId).sentences.findIndex(
			(sentence: Sentence) => sentence.id === sentenceId
		);
	}

	getSentenceByIds(lessonId: number, sentenceId: number): Sentence {
		return this.getLessonById(lessonId).sentences.find(
			(sentence: Sentence) => sentence.id === sentenceId
		);
	}

	getRangeOfLessonSentences(lessonId: number, from: number, to: number): Sentence[] {
		return this.getLessonById(lessonId).sentences.slice(from, to);
	}

	editLesson(lesson: Lesson) {
		this.lessons[this.lessons.indexOf(this.getLessonById(lesson.id))] = lesson;
	}

	editSentence(lessonId: number, newSentence: Sentence) {
		const idx = this.getSentenceNumberByIds(lessonId, newSentence.id);
		this.getLessonById(lessonId).sentences[idx] = newSentence;
	}

	getStatisticsOfSentence(sentence: Sentence): Statistics {
		let lessonToSearchIn = this.lessons.find(lesson => lesson.id === sentence.lessonId);
		if (!lessonToSearchIn) {
			lessonToSearchIn = this.lessons.find(lesson => lesson.parentId === sentence.lessonId);
		}
		if (!lessonToSearchIn.statistics) {
			return null;
		}
		return lessonToSearchIn.statistics.find(stat => stat.sentenceId === sentence.id);
	}

	createNewStatisticRecord(sentenceId: number, lessonId: number, userId: number, words: [number, number][]) {
		this.getLessonById(lessonId).statistics.push(new Statistics(sentenceId, sentenceId,
			lessonId, userId, new Array(words.length).fill(0), 0, false, 0, 0, 0, 0,
			new Date().toISOString(), new Date().toISOString()
		));
	}

	async getSentencesByLessonId(lessonId: number, parentId: number): Promise<Sentence[]> {
		const apiSentences: ISentence[] = parentId ?
			await this.sentenceHttpService.getLessonSentences(parentId) :
			await this.sentenceHttpService.getLessonSentences(lessonId);

		const lessonToFill = this.getLessonById(lessonId);

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
			const hiddenSentence = this.utils.hideChars(apiSentence.text, apiSentence.words, this.globals.charForHiding);
			const sentencesListSentence = this.utils.hideChars(apiSentence.text, apiSentence.words, this.globals.blueCharForHiding);
			const sentence = new Sentence(
				apiSentence.id,
				apiSentence.lessonId,
				apiSentence.words,
				apiSentence.text,
				hiddenSentence,
				hiddenChars,
				sentencesListSentence,
				apiSentence.createdAt,
				apiSentence.updatedAt);
			if (!lessonToFill.sentences.some(sntnc => sntnc.id === sentence.id)) {
				lessonToFill.addSentence(sentence);
			}

			const sentenceStat = this.getStatisticsOfSentence(sentence);
			if (sentenceStat) {
				sentenceStat.curCharsIndexes = new Array(apiSentence.words.length).fill(0);
			}
		}
		
		lessonToFill.sentences.sort(this.sortSentencesByAddingTime);

		return lessonToFill.sentences;
	}

	async getStatisticByUser(): Promise<Statistics[]> {
		const apiStatistics: IStatistic[] = await this.statisticHttpService.getStatisticsOfUser();
		const statisticsArray: Statistics[] = [];

		for (const apiStatistic of apiStatistics) {
			const lesson = this.getLessonById(apiStatistic.lessonId);
			if (lesson) {
				lesson.statistics.push(
					(new Statistics(
						apiStatistic.id,
						apiStatistic.sentenceId,
						apiStatistic.lessonId,
						apiStatistic.userId,
						[], 0, false,
						apiStatistic.correctAnswers,
						apiStatistic.wrongAnswers,
						apiStatistic.giveUps,
						apiStatistic.hintUsages,
						apiStatistic.createdAt,
						apiStatistic.updatedAt)
					));
			}
		}

		return statisticsArray;
	}

	async refreshLessons(): Promise<void> {
		this.lessons = [];

		const apiLessons: ILesson[] = await this.lessonHttpService.getLessons();
		this.globals.updIsDemo(apiLessons.length === 0);

		if (this.globals.getIsDemo()) {
			await this.http.get('assets/demo-lessons.json').toPromise().then(async (lessons: IDemoLesson[]) => {
				for (const lsn of lessons) {
					const lesson = new Lesson(lsn.id, lsn.name, lsn.url, null, '', '', 'Demo lesson');
					for (const sntc of lsn.sentences) {
						const hiddenChars: Array<string[]> = [];
						sntc.words.sort((a, b) => a[0] - b[0]);
						for (const i in sntc.words) {
							const chars: string[] = [];
							for (let j = 0; j < sntc.words[i][1]; j++) {
								chars.push(sntc.text.charAt(sntc.words[i][0] + j));
							}
							hiddenChars.push(chars);
						}
						const hiddenSentence = this.utils.hideChars(sntc.text, sntc.words, this.globals.charForHiding);
						const sentencesListSntc = this.utils.hideChars(sntc.text, sntc.words, this.globals.blueCharForHiding);
						lesson.sentences.push(new Sentence(
							sntc.id,
							lesson.id,
							sntc.words,
							sntc.text,
							hiddenSentence,
							hiddenChars,
							sentencesListSntc,
							'', ''));
						let storageStat: string = await this.storage.get('sentence-' + sntc.id);
						if (!storageStat) {
							await this.storage.set('sentence-' + sntc.id, '0|0|0|0');
							storageStat = '0|0|0|0';
						}
						const statStringArray = storageStat.split('|');
						lesson.statistics.push(new Statistics(
							sntc.id, sntc.id, lsn.id, this.globals.userId,
							new Array(sntc.words.length).fill(0),
							0, false,
							Number(statStringArray[0]),
							Number(statStringArray[1]),
							Number(statStringArray[2]),
							Number(statStringArray[3]),
							'', ''));
					}
					if (this.lessons.findIndex(lsn => lsn.id === lesson.id) === -1) {
						this.addLesson(lesson);
					}
				}
			});
		} else {
			this.createAndInsertFromAPIData(apiLessons);
			await this.getStatisticByUser();
		}
	}

	private createAndInsertFromAPIData(apiLessons: ILesson[]) {
		const now = new Date().getTime();

		for (const lsn of apiLessons) {
			const diff = (now - new Date(lsn.createdAt).getTime()) / 1000;
			const period = this.utils.calculatePeriod(diff);
			const lesson = new Lesson(
				lsn.id,
				lsn.name,
				lsn.url,
				lsn.parentId,
				lsn.createdAt,
				lsn.updatedAt,
				period[0] + period[1]);

			this.addLesson(lesson);
		}
	}

	sortSentencesByAddingTime(first: Sentence, second: Sentence): number {
		const firstTime = new Date(first.created_at);
		const secondTime = new Date(second.created_at);
		return firstTime > secondTime ? 1 : -1;
	}

	sortLessonsByTime(first: Lesson, second: Lesson): number {
		if (first.statistics.length === 0) {
			return 1;
		}
		if (second.statistics.length === 0) {
			return -1;
		}
		const firstLatestUpd = new Date(Math.max.apply(null, first.statistics.map(elem => new Date(elem.updated_at))));
		const secondLatestUpd = new Date(Math.max.apply(null, second.statistics.map(elem => new Date(elem.updated_at))));

		return firstLatestUpd < secondLatestUpd ? 1 : -1;
	}
}
