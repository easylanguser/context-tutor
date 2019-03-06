import { Injectable } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { LessonsListService } from '../lessons-list/lessons-list.service';

@Injectable({
	providedIn: 'root'
})
export class LessonsService {

	lessons: Lesson[] = [];

	constructor(private api: LessonsListService) {
	}

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

	getLessons(): Lesson[] {
		this.api.getData().subscribe(res => {
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
				} else if (diff >= 86400 && diff < 604800) {
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
