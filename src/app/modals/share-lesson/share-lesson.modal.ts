import { Component } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserHttpService } from 'src/app/services/http/users/user-http.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { LessonHttpService } from 'src/app/services/http/lessons/lesson-http.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

interface IUserInfo {
	id: number,
	email: string,
	hasAvatar: boolean,
	msg: string
}

@Component({
	selector: 'share-lesson-modal',
	templateUrl: './share-lesson.modal.html',
	styleUrls: ['./share-lesson.modal.scss'],
	animations: [
		trigger(
			'enterAnimation', [
				transition(':enter', [
					style({ opacity: 0 }),
					animate('600ms', style({ opacity: 1 }))
				]),
				transition(':leave', [
					style({ opacity: 1 }),
					animate('600ms', style({ opacity: 0 }))
				])
			]
		)
	]
})
export class ShareLessonModal {

	lessonId: number;
	emailSearchForm: FormGroup
	userIsLoaded: boolean = true;
	email: string;
	user: { id: number, email: string, avatar: SafeUrl } = { id: 0, email: '', avatar: 'assets/img/account_icon.svg' };

	constructor(
		private userHttpService: UserHttpService,
		private navParams: NavParams,
		private modalController: ModalController,
		private sanitizer: DomSanitizer,
		private formBuilder: FormBuilder,
		private lessonHttpService: LessonHttpService,
		private lessonsDataService: LessonsDataService,
		private utils: UtilsService) {
		this.lessonId = Number(this.navParams.get('lessonId'));
		this.emailSearchForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.minLength(6)]]
		});
	}

	startSearch() {
		this.userIsLoaded = false;
		this.userHttpService.getUserByEmail(this.emailSearchForm.get('email').value).then(async (res: IUserInfo) => {
			if (res.id && res.email) {
				if (res.hasAvatar) {
					const blob = await this.userHttpService.getAvatar(res.id);
					const reader = new FileReader();
					reader.readAsDataURL(blob);
					reader.onloadend = () => {
						this.user = {
							id: res.id,
							email: res.email,
							avatar: this.sanitizer.bypassSecurityTrustUrl(String(reader.result))
						};
					}
				} else {
					this.user = {
						id: res.id,
						email: res.email,
						avatar: 'assets/img/account_icon.svg'
					};
				}
			} else {
				this.user = {
					id: 0,
					email: res.msg,
					avatar: 'assets/img/account_icon.svg'
				};
			}
			this.userIsLoaded = true;
		});
	}

	shareLesson() {
		if (this.user.id > 0) {
			const lesson = this.lessonsDataService.getLessonById(this.lessonId);
			this.lessonHttpService.postNewLesson({
				userId: this.user.id,
				name: lesson.name,
				url: lesson.url,
				parentId: lesson.parentId ? lesson.parentId : lesson.id
			}).then(res => {
				this.utils.showToast('You have successfully shared lesson ' + res['name']);
				this.dismissModal();
			});
		}
	}

	dismissModal() {
		this.modalController.dismiss();
	}
}
