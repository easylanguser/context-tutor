import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LessonsListService } from '../services/lessons-list/lessons-list.service';
import { Router } from '@angular/router';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
	styleUrls: ['home.scss']
})

export class HomePage implements OnInit {

	public lessons: any;

	constructor(
		private api: LessonsListService,
		private loadingController: LoadingController,
		private router: Router) { }

	ngOnInit() {
		this.getData();
	}

	// Get list of lessons for the home page
	private async getData() {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();
		this.api.getData()
			.subscribe(res => {
				this.lessons = res[0];
				loading.dismiss();
			}, err => {
				console.log(err);
				loading.dismiss();
			});
	}

	// Load new page with text  
	openLesson(lessonNumber) {
		let lessonID = this.lessons[lessonNumber].id;
		this.router.navigate(['lesson-editing'], { queryParams: { lessonID: lessonID } });
	}
}
