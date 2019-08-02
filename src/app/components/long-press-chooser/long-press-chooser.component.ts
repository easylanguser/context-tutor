import { Component, Input } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AlertController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { ShareLessonModal } from 'src/app/modals/share-lesson/share-lesson.modal';
import { LessonHttpService } from 'src/app/services/http/lessons/lesson-http.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { Globals } from 'src/app/services/globals/globals';
import { Sentence } from 'src/app/models/sentence';
import { SentenceHttpService } from 'src/app/services/http/sentences/sentence-http.service';

const urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

@Component({
	selector: 'app-long-press-chooser',
	templateUrl: './long-press-chooser.component.html',
	styleUrls: ['./long-press-chooser.component.scss']
})
export class LongPressChooserComponent {

	@Input("lesson") lesson: Lesson;
	@Input("sentence") sentence: Sentence;

	constructor(
		private browser: InAppBrowser,
		private alertController: AlertController,
		private navController: NavController,
		private popoverController: PopoverController,
		private modalController: ModalController,
		private lessonHttpService: LessonHttpService,
		private utils: UtilsService,
		private lessonsDataService: LessonsDataService,
		public globals: Globals) { }

	openLink() {
		const lessonUrl: string = this.lesson.url;
		if (lessonUrl.match(urlRegex)) {
			this.browser.create(lessonUrl);
		} else {
			this.utils.showToast('Lesson URL is not valid');
		}
		this.popoverController.dismiss();
	}

	async deleteItem() {
		const alert = await this.alertController.create({
			message: 'Are you sure you want to delete this lesson?',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel'
				},
				{
					text: 'Delete',
					handler: async () => {
						await this.lessonHttpService.deleteLesson(this.lesson.id);
						this.lessonsDataService.removeLesson(this.lesson.id);
					}
				}
			]
		});
		this.popoverController.dismiss();
		alert.present();
	}

	async shareLesson() {
		const modal = await this.modalController.create({
			component: ShareLessonModal,
			componentProps: {
				'lessonId': this.lesson.id
			}
		});
		this.popoverController.dismiss();
		modal.present();
	}

	editItem() {
		this.navController.navigateForward(['edit-lesson-title'],
			{ queryParams: { lessonId: this.lesson.id } }
		);
		this.popoverController.dismiss();
	}
}
