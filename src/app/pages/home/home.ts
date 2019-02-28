import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingController, IonItemSliding, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Lesson } from 'src/app/models/lesson';
import { LessonsService } from 'src/app/services/lessons-data/lessons-data.service';
import { LessonDeleteService } from 'src/app/services/lesson-delete/lesson-delete.service';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
	styleUrls: ['home.scss']
})
export class HomePage implements OnInit {

	displayedLessons: Lesson[];
	clearSegmentBoolean: boolean;

	// Week, month and year in milliseconds
	periods: number[] = [1209600000, 5184000000, 63072000000];

	constructor(private loadingController: LoadingController,
		private router: Router,
		private lessonService: LessonsService,
		private alertCtrl: AlertController,
		private lessonDeleteService: LessonDeleteService) { }

	ngOnInit() {
		this.getData().then(res => res)
	}

	async deleteItem(slidingItem: IonItemSliding, lessonID: number) {
		let alert = await this.alertCtrl.create({
			message: 'Are you sure you want to delete this lesson?',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					handler: () => {
						slidingItem.close();
					}
				},
				{
					text: 'Delete',
					handler: () => { 
						slidingItem.close();
						
						this.lessonDeleteService.delete(lessonID);
						
						let i = 0;
						for (i; i < this.displayedLessons.length; i++) {
							if (this.displayedLessons[i].id === lessonID) {
								break;
							}
						}

						if (i !== this.displayedLessons.length) {
							this.displayedLessons.splice(i, 1);
						}
					}
				}
			]
		});
		await alert.present();
	}

	async filterDate(periodNumber: number) {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();
		this.displayedLessons = this.lessonService.lessons.filter(
			lesson => new Date().getTime() - new Date(lesson.created_at).getTime() <= this.periods[periodNumber]
		);
		loading.dismiss();
	}

	weekAgoClick() {
		this.filterDate(0);
	}

	monthAgoClick() {
		this.filterDate(1);
	}

	yearAgoClick() {
		this.filterDate(2);
	}

	doRefresh(event) {
		this.clearSegmentBoolean = false;
		this.getData().then(_ => { event.target.complete() });
		setTimeout(() => {
			event.target.complete();
		}, 5000);
	}

	// Get list of lessons, add them to displayed and to lessons data service
	private async getData() {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();
		
		this.displayedLessons = this.lessonService.getLessons();

		loading.dismiss();
	}

	// Go to selected lesson page
	openLesson(lessonID) {
		this.router.navigate(['sentences-list'], { queryParams: { lessonID: lessonID } });
	}
}
