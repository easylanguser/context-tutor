import { UtilsService } from './../utils/utils.service';
import { LessonByNameService } from './../lesson-by-name/lesson-by-name.service';
import { Injectable } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { LessonsListService } from '../lessons-list/lessons-list.service';
import { Sentence } from 'src/app/models/sentence';
import { Statistics } from 'src/app/models/statistics';

@Injectable({
	providedIn: 'root'
})
export class LessonsService {

	lessons: Lesson[] = [];

	constructor(
		private lessonsAPI: LessonsListService,
		private sentencesAPI: LessonByNameService,
		private utils: UtilsService) { }

	addLesson(lesson: Lesson): void {
		this.lessons.push(lesson);
	}

	removeLesson(lessonToRemove: Lesson): void {
		const index = this.lessons.indexOf(lessonToRemove);
		if (index > -1) {
			this.lessons.splice(index, 1);
		}
	}

	getLessonByID(id: number): Lesson {
		return this.lessons.find(lesson => lesson.id === id);
	}

	editLesson(lesson: Lesson): void {
		this.lessons[this.lessons.indexOf(this.getLessonByID(lesson.id))] = lesson;
	}

	getSentencesByLessonId(id: number): Sentence[] {
		this.sentencesAPI.getData(id).subscribe(res => {
			const lsn = res[0];
			for (let i = 0; i < lsn.length; i++) {
				const hiddenChars: Array<string[]> = [];
				const curCharsIndexes: number[] = [];
				for (let j = 0; j < lsn[i].words.length; j++) {
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
					lsn[i].words,
					lsn[i].text,
					hiddenSentence,
					hiddenChars,
					curCharsIndexes,
					0,
					this.utils.addChar(hiddenSentence, '?'),
					false,
					new Statistics(0, 0, 0, 0, 0, 0, 0));
				if (!this.getLessonByID(id).sentences.some(sntn => sntn.id === sentence.id)) {
					this.getLessonByID(id).addSentence(sentence);
				}
			}
		});
		return this.getLessonByID(id).sentences;
	}

	getLessons(): Lesson[] {
		this.lessonsAPI.getData().subscribe(res => {
			const now = new Date().getTime();
			for (let i = 0; i < res[0].length; i++) {
				const diff = (now - new Date(res[0][i].created_at).getTime()) / 1000;
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

				const lesson = new Lesson(
					res[0][i].id,
					res[0][i].name,
					res[0][i].url,
					res[0][i].created_at,
					flooredValue + label);

				if (this.getLessonByID(lesson.id) === undefined) {
					this.addLesson(lesson);
				}
			}
		});
		return this.lessons;
	}
}
