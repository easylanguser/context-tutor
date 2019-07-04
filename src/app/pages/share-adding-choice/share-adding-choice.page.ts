import { Component, OnInit } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { NavController } from '@ionic/angular';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Globals } from 'src/app/services/globals/globals';

@Component({
	selector: 'app-share-adding-choice',
	templateUrl: './share-adding-choice.page.html',
	styleUrls: ['./share-adding-choice.page.scss'],
})
export class ShareAddingChoicePage implements OnInit {

	displayedLessons: Lesson[];
	allLessons: Lesson[];
	searchValue: string;

	constructor(
		private navController: NavController,
		private utils: UtilsService,
		private globals: Globals,
		private lessonsDataService: LessonsDataService) { }

	ngOnInit() {
		this.getData();
	}

	goBack() {
		this.globals.sharedText[0] = undefined;
		this.navController.navigateBack(['lessons-list']);
	}

	filterLessons(event: CustomEvent) {
		const filterName = String(event.detail.value);
		this.displayedLessons = this.allLessons
			.filter(lsn => lsn.name.toLowerCase().indexOf(filterName.toLowerCase()) >= 0);
	}

	private async getData() {
		await this.utils.createAndShowLoader('Loading');
		await this.lessonsDataService.refreshLessons();
		this.displayedLessons = this.lessonsDataService.lessons;
		this.allLessons = [...this.displayedLessons];
		await this.utils.dismissLoader();
	}

	addToExistingLesson(lessonId: number) {
		this.navController.navigateForward(['sentence-adding'], { queryParams: { lessonId: lessonId } });
	}

	createNewLesson() {
		this.navController.navigateForward(['sentence-adding']);
	}
}
