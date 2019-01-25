import { Component } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { LessonsListService } from '../lessons-list.service';
import { Router } from '@angular/router';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
	styleUrls: ['home.scss']
})

export class HomePage {

	private lessons: any;

	private constructor(private alertCtrl: AlertController,
		private api: LessonsListService, private loadingController: LoadingController,
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
		let name = this.lessons[lessonNumber];
		this.router.navigate(['lesson-editing', name]);
	}
}
