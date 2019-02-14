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

	// Week, month and year in milliseconds
	periods: number[] = [604800000, 2592000000, 31536000000];

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

	async filterDate(periodNumber: number) {
		const loading = await this.loadingController.create({
			message: 'Loading'
		});
		await loading.present();
		this.displayedLessons = this.lessonData.lessons.filter(
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
