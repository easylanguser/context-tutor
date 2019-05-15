import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonsService } from 'src/app/services/lessons/lessons.service';
import { NavController } from '@ionic/angular';

@Component({
	selector: 'app-edit-lesson-title',
	templateUrl: './edit-lesson-title.page.html',
	styleUrls: ['./edit-lesson-title.page.scss'],
})
export class EditLessonTitlePage implements OnInit {

	lessonTitle: string;
	lessonId: number;

	constructor(
		private navCtrl: NavController,
		private route: ActivatedRoute,
		private lessonsService: LessonsService) { }

	ngOnInit() {
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));
		this.lessonTitle = this.lessonsService.getLessonByID(this.lessonId).name;
	}

	submitNewTitle() {
		const lessonToEdit = this.lessonsService.getLessonByID(this.lessonId);
		lessonToEdit.name = this.lessonTitle;
		this.lessonsService.editLesson(lessonToEdit);
		this.navCtrl.pop();
	}

	goBack() {
		this.navCtrl.pop();
	}
}
