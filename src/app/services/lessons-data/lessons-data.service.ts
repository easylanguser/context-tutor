import {Injectable} from '@angular/core';
import {Lesson} from 'src/app/models/lesson';
import {LessonsListService} from "../lessons-list/lessons-list.service";

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
        return this.lessons.find(lesson => lesson.id == id);
    }

    editLesson(lesson: Lesson): void {
        this.lessons[this.lessons.indexOf(this.getLessonByID(lesson.id))] = lesson;
    }

    getLessons(): Lesson[] {
        this.api.getData().subscribe(res => {
            for (let i = 0; i < res[0].length; i++) {
                const lesson = new Lesson(res[0][i].id, res[0][i].name,
                    res[0][i].url, res[0][i].created_at);
                if (this.getLessonByID(lesson.id) === undefined) {
                    this.addLesson(lesson);
                }
            }
        });
        return this.lessons
    }

}
