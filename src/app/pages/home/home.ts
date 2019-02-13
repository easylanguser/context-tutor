import { Component } from '@angular/core';
import { LoadingController, IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { LessonsListService } from 'src/app/services/lessons-list/lessons-list.service';
import { Lesson } from 'src/app/models/lesson';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
	styleUrls: ['home.scss']
})
export class HomePage {

	displayedLessons: Lesson[];
	clearSegmentBoolean: boolean;

	constructor(private api: LessonsListService,
		private loadingController: LoadingController,
		private router: Router,
		private lessonData: LessonsDataService) {
		this.getData();
	}

	tryAgain(lessonID: number) {
		this.router.navigate(['edit-lesson'], { queryParams: { lessonID: lessonID } });
	}

	deleteItem(slidingItem: IonItemSliding, lessonID: number) {
		slidingItem.close();
		
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

	async weekAgoClick() {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();
		this.displayedLessons = this.lessonData.lessons.filter(this.weekAgo);
		loading.dismiss();
	}

	async monthAgoClick() {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();
		this.displayedLessons = this.lessonData.lessons.filter(this.monthAgo);
		loading.dismiss();
	}

	async yearAgoClick() {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();
		this.displayedLessons = this.lessonData.lessons.filter(this.yearAgo);
		loading.dismiss();
	}

	weekAgo(element: Lesson, index, array) {
		let now = new Date().getTime();
		let elemDate = new Date(element.created_at).getTime();
		return (now - elemDate <= 604800000);
	}

	monthAgo(element: Lesson, index, array) {
		let now = new Date().getTime();
		let elemDate = new Date(element.created_at).getTime();
		return (now - elemDate <= 2592000000);
	}

	yearAgo(element: Lesson, index, array) {
		let now = new Date().getTime();
		let elemDate = new Date(element.created_at).getTime();
		return (now - elemDate <= 31536000000);
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
		this.api.getData()
			.subscribe(res => {
				for (let i = 0; i < res[0].length; i++) {
					const lesson = new Lesson(res[0][i].id, res[0][i].name,
						res[0][i].url, res[0][i].created_at);
					if (this.lessonData.getLessonByID(lesson.id) === undefined) {
						this.lessonData.addLesson(lesson);
					}
				}
				this.displayedLessons = this.lessonData.lessons;
				loading.dismiss();
			}, err => {
				console.log(err);
				loading.dismiss();
			});
	}

	// Go to selected lesson page
	openLesson(lessonID) {
		this.router.navigate(['sentences-list'], { queryParams: { lessonID: lessonID } });
	}
}
