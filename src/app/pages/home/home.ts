import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LessonsListService } from 'src/app/services/lessons-list/lessons-list.service';
import { Lesson } from 'src/app/models/lesson';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
	styleUrls: ['home.scss']
})

export class HomePage implements OnInit {

	constructor(private api: LessonsListService,
		private loadingController: LoadingController,
		private router: Router,
		private lessonData: LessonsDataService) { }

	ngOnInit() {
		this.getData();
	}

	doRefresh(event) {
		this.getData().then(_ => { event.target.complete() });
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	// Get list of lessons for the home page
	private async getData() {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();
		this.api.getData()
			.subscribe(res => {
				for (let i = 0; i < res[0].length; i++) {
					const lesson = new Lesson(res[0][i].id, res[0][i].name,
						res[0][i].url, res[0][i].created_at);
					if (this.lessonData.getLessonByID(lesson.id) === undefined) {
						this.lessonData.addLesson(lesson);
					}
				}
				loading.dismiss();
			}, err => {
				console.log(err);
				loading.dismiss();
			});
	}

	// Load new page with text
	openLesson(lessonID) {
		this.router.navigate(['sentences-list'], { queryParams: { lessonID: lessonID } });
	}
}
