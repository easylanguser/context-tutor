import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { sharedText } from 'src/app/app.component';
import { LessonsService } from 'src/app/services/lessons/lessons.service';

@Component({
	selector: 'app-sentence-adding-page',
	templateUrl: './sentence-adding-page.page.html',
	styleUrls: ['./sentence-adding-page.page.scss'],
})
export class SentenceAddingPagePage implements OnInit {

	title: string;
	sentence: string;

	constructor(private route: ActivatedRoute,
		private lessonsService: LessonsService) { }

	ngOnInit() {
		const lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));
		if (lessonId) {
			this.title = this.lessonsService.getLessonByID(lessonId).name;
		} else {
			this.title = new Date().toJSON().slice(0,10).replace(/-/g,'/') + ' ' + sharedText[0].substr(0, 10);
		}
		this.sentence = sharedText[0];
	}
}
