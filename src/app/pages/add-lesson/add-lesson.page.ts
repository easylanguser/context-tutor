import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { USER_ID_KEY } from 'src/app/services/auth/auth.service';
import { sharedText, updateIsRequired } from 'src/app/app.component';
import { LessonHttpService } from 'src/app/services/http/lessons/lesson-http.service';
import { Storage } from '@ionic/storage';
import * as anime from 'animejs';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: 'app-add-lesson',
	templateUrl: './add-lesson.page.html',
	styleUrls: ['./add-lesson.page.scss']
})
export class AddLessonPage implements OnInit {

	lessonName: string;
	sentences: any[] = [];
	lessonNameInputIsValidated: boolean = true;
	fileImportIsOpened: boolean = false;

	fileInput: HTMLInputElement;

	constructor(
		private storage: Storage,
		private lessonHttpService: LessonHttpService,
		private utils: UtilsService,
		private navCtrl: NavController) { }

	ngOnInit() {
		this.fileInput = <HTMLInputElement>document.getElementById('file-input');
		sharedText[0] = undefined;
	}

	goBack() {
		if (this.fileImportIsOpened) {
			this.showHideInputs(false);
		} else {
			this.navCtrl.navigateBack(['lessons-list']);
		}
	}

	async goToFileImport() {
		if (this.fileImportIsOpened) {
			if (this.fileInput.files && this.fileInput.files.length > 0) {
				await this.showHideInputs(false);
			} else {
				this.utils.showToast('No file was choosen');
			}
		} else {
			await this.showHideInputs(true);
		}
	}

	async showHideInputs(showFileInput: boolean) {
		const nameInput = document.getElementById('lesson-name-input').style;
		const createLessonButton = document.getElementById('save-lesson-button').style;
		const importButton = document.getElementById('go-to-file-import-inner-button');
		const fileInput = document.getElementById('file-input').style;

		const nameEditingTargets = ['#lesson-name-input', '#save-lesson-button', '#go-to-file-import-button'];
		const fileTargets = ['#file-input', '#go-to-file-import-button'];

		await anime({
			targets: showFileInput ? nameEditingTargets : fileTargets,
			opacity: 0,
			easing: 'easeOutCirc',
			duration: 300
		}).finished;


		if (!showFileInput && this.fileInput.files && this.fileInput.files.length > 0) {
			this.lessonName = this.fileInput.files[0].name;
		}

		nameInput.display = showFileInput ? 'none' : 'flex';
		createLessonButton.display = showFileInput ? 'none' : 'flex';
		importButton.innerText = showFileInput ? 'Upload file' : 'Import file';
		fileInput.display = showFileInput ? 'inline' : 'none';

		const fileInputAnimatingPromise = anime({
			targets: showFileInput ? fileTargets : nameEditingTargets,
			opacity: 1,
			easing: 'easeInOutCirc',
			duration: 300
		}).finished;

		await Promise.all([fileInputAnimatingPromise]);

		this.fileImportIsOpened = showFileInput;
	}

	onKeyLessonName(event: any) {
		this.lessonNameInputIsValidated = event.target.value === "" ? false : true;
	}

	async addNewLesson() {
		if (this.lessonName && this.fileInput.files && this.fileInput.files.length > 0) {
			const userId = await this.storage.get(USER_ID_KEY)
			await this.lessonHttpService.postNewLessonFile(this.fileInput.files, this.lessonName, userId);
			this.utils.showToast('New lesson was added');
			this.fileInput.value = "";
			updateIsRequired[0] = true;
			this.navCtrl.navigateBack(['lessons-list']);
		}
	}
}