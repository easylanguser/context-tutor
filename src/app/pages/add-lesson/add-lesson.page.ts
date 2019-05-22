import { AddLessonFileService } from './../../services/http/add-lesson-file/add-lesson-file.service';
import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage-service';
import { AddLessonService } from 'src/app/services/http/add-lesson/add-lesson.service';
import { AddSentenceService } from 'src/app/services/http/add-sentence/add-sentence.service';
import { ToastController, NavController } from '@ionic/angular';
import { USER_ID_KEY } from 'src/app/services/auth/auth.service';
import { sharedText, updateIsRequired } from 'src/app/app.component';
import { ActivatedRoute } from '@angular/router';
import { LessonsService } from 'src/app/services/lessons/lessons.service';

@Component({
	selector: 'app-add-lesson',
	templateUrl: './add-lesson.page.html',
	styleUrls: ['./add-lesson.page.scss'],
})
export class AddLessonPage implements OnInit {

	lessonName: string;
	lessonUrl: string;

	sentences: any[] = [];

	lessonNameInputIsValidated: boolean = true;
	lessonUrlInputIsValidated: boolean = true;

	constructor(
		private activeRoute: ActivatedRoute,
		private storageService: StorageService,
		private addLessonService: AddLessonService,
		private toastController: ToastController,
		private addLessonFileService: AddLessonFileService,
		private navCtrl: NavController) { }

	goBack() {
		this.navCtrl.pop();
	}

	ngOnInit() {
		if (this.activeRoute.snapshot.queryParamMap.get('hideFileInput')) {
			document.getElementById('file-input').style.display = 'none';
		} else {
			['lesson-name-input', 'lesson-url-input'].forEach(id => {
				document.getElementById(id).style.display = 'none';
			});
		}
		sharedText[0] = undefined;
	}

	onKeyLessonName(event: any) {
		this.lessonNameInputIsValidated = event.target.value === "" ? false : true;
	}

	onKeyLessonUrl(event: any) {
		this.lessonUrlInputIsValidated = event.target.value === "" ? false : true;
	}

	addLessonAsFile(fileInput: HTMLInputElement) {
		this.storageService.get(USER_ID_KEY)
			.then(userId => {
				this.addLessonFileService.postNewLessonFile(fileInput.files, userId);
			})
			.then(async () => {
				const toast = await this.toastController.create({
					message: 'New lesson was added',
					position: 'bottom',
					duration: 2000,
					animated: true
				});
				toast.present();
			})
			.then(() => fileInput.value = "");
	}

	addLessonAsText() {
		this.storageService.get(USER_ID_KEY)
			.then(userId => {
				this.addLessonService.postNewLesson({
					userId: userId,
					name: this.lessonName,
					url: this.lessonUrl
				}).then(() => {
					this.lessonName = "";
					this.lessonUrl = "";
					this.sentences = [];
				}).then(async () => {
					const toast = await this.toastController.create({
						message: 'New lesson was added',
						position: 'bottom',
						duration: 2500,
						animated: true
					});
					toast.present();
				});
			});
	}

	addNewLesson() {
		const fileInput = <HTMLInputElement>document.getElementById('file-input');
		if (fileInput.files != undefined && fileInput.files.length > 0) {
			this.addLessonAsFile(fileInput);
		} else {
			let validated: boolean = true;

			if (this.lessonName === undefined || this.lessonName === "") {
				document.getElementById("lesson-name-input").style.borderColor = "#F00";
				validated = false;
			}
			if (this.lessonUrl === undefined || this.lessonUrl === "") {
				document.getElementById("lesson-url-input").style.borderColor = "#F00";
				validated = false;
			}
			if (!validated) return;

			this.addLessonAsText();
		}
		updateIsRequired[0] = true;
		this.navCtrl.pop();
	}
}