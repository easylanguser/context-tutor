import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { NavController } from '@ionic/angular';
import { LessonNameUpdateService } from 'src/app/services/http/lesson-name-update/lesson-name-update.service';

@Component({
	selector: 'app-edit-lesson-title',
	templateUrl: './edit-lesson-title.page.html',
	styleUrls: ['./edit-lesson-title.page.scss'],
})
export class EditLessonTitlePage implements OnInit {

	lessonTitle: string;
	lessonId: number;

	constructor(
		private lessonNameUpdateService: LessonNameUpdateService,
		private navCtrl: NavController,
		private route: ActivatedRoute,
		private lessonsDataService: LessonsDataService) { }

	ngOnInit() {
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));
		this.lessonTitle = this.lessonsDataService.getLessonByID(this.lessonId).name;
	}

	submitNewTitle() {
		const lessonToEdit = this.lessonsDataService.getLessonByID(this.lessonId);
		lessonToEdit.name = this.lessonTitle;
		this.lessonsDataService.editLesson(lessonToEdit);
		this.lessonNameUpdateService.updateLessonName(String(this.lessonId), this.lessonTitle.replace(/\s+/g, '%20'))
			.then(() => this.navCtrl.pop());
	}

	goBack() {
		this.navCtrl.pop();
	}
}
