import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoadingController, IonItemSliding} from '@ionic/angular';
import {Router} from '@angular/router';
import {Lesson} from 'src/app/models/lesson';
import {LessonsService} from 'src/app/services/lessons-data/lessons-data.service';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
    styleUrls: ['home.scss']
})
export class HomePage implements OnInit  {

	displayedLessons: Lesson[];
	clearSegmentBoolean: boolean;

	// Week, month and year in milliseconds
	periods: number[] = [604800000, 2592000000, 31536000000];

    constructor(private loadingController: LoadingController,
                private router: Router,
                private lessonService: LessonsService) {
    }

    ngOnInit() {
        this.getData().then(res => res)
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
        this.displayedLessons = this.lessonService.getLessons()
        loading.dismiss();
    }

	// Go to selected lesson page
	openLesson(lessonID) {
		this.router.navigate(['sentences-list'], { queryParams: { lessonID: lessonID } });
	}
}
