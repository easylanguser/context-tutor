import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { NavController } from '@ionic/angular';
import { LessonHttpService } from 'src/app/services/http/lessons/lesson-http.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

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
		private navController: NavController,
		private route: ActivatedRoute,
		private utils: UtilsService,
		private lessonsDataService: LessonsDataService) { }

	ngOnInit() {
		this.lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));
		this.lessonTitle = this.lessonsDataService.getLessonById(this.lessonId).name;
	}

	submitNewTitle() {
		if (!this.lessonTitle || !this.lessonTitle.trim()) {
			this.utils.showToast('Lesson\' name can\'t be empty.');
			return;
		}
		const lessonToEdit = this.lessonsDataService.getLessonById(this.lessonId);
		lessonToEdit.name = this.lessonTitle;
		this.lessonsDataService.editLesson(lessonToEdit);
		this.lessonHttpService.updateLessonName(String(this.lessonId), this.lessonTitle.replace(/\s+/g, '%20'))
			.then(() => this.navController.navigateBack(['lessons-list']));
	}

	goBack() {
		this.navController.navigateBack(['lessons-list']);
	}
}
