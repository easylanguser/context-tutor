import { Injectable } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';

@Injectable({
	providedIn: 'root'
})
export class LessonsDataService {

	lessons: Lesson[] = [];

	constructor() { }

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
		return this.lessons.find(lesson => lesson.id == id);
	}

	editLesson(lesson: Lesson): void {
		this.lessons[this.lessons.indexOf(this.getLessonByID(lesson.id))] = lesson;
	}
}
