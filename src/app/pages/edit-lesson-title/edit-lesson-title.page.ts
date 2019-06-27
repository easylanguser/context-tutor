import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { NavController } from '@ionic/angular';
import { LessonHttpService } from 'src/app/services/http/lessons/lesson-http.service';

@Component({
	selector: 'app-edit-lesson-title',
	templateUrl: './edit-lesson-title.page.html',
	styleUrls: ['./edit-lesson-title.page.scss'],
})
export class EditLessonTitlePage implements OnInit {

	lessonTitle: string;
	lessonId: number;

	constructor(
		private lessonHttpService: LessonHttpService,
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
		this.lessonHttpService.updateLessonName(String(this.lessonId), this.lessonTitle.replace(/\s+/g, '%20'))
			.then(() => this.navCtrl.navigateBack(['lessons-list']));
	}

	goBack() {
		this.navCtrl.navigateBack(['lessons-list']);
	}
}
