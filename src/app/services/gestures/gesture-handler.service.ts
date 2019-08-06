import { Injectable } from '@angular/core';
import { Lesson } from 'src/app/models/lesson';
import { Sentence } from 'src/app/models/sentence';
import { LongPressChooserComponent } from 'src/app/components/long-press-chooser/long-press-chooser.component';
import { PopoverController, AlertController } from '@ionic/angular';
import { LessonsDataService } from '../lessons-data/lessons-data.service';
import { SentenceHttpService } from '../http/sentences/sentence-http.service';

@Injectable({
	providedIn: 'root'
})
export class GestureHandlerService {

	xDown: number = null;
	yDown: number = null;
	refresherIsPulled: false;
	popover: HTMLIonPopoverElement = null;
	alert: HTMLIonAlertElement = null;
	pressDuration: number = 0;
	interval: any;

	constructor(private popoverController: PopoverController,
		private lessonsDataService: LessonsDataService,
		private alertController: AlertController,
		private sentenceHttpService: SentenceHttpService) { }

	handleTouchStart(evt) {
		const firstTouch = evt.type === 'mousedown' ?
			event :
			(evt.touches || evt.originalEvent.touches)[0];
		if (firstTouch.clientX > 50) {
			this.xDown = firstTouch.clientX;
			this.yDown = firstTouch.clientY;
		}
	}

	handleTouchEnd(evt): boolean {
		evt.preventDefault();
		let xDiff, yDiff, minDistance = 6;
		if (evt.type === 'mouseup') {
			xDiff = this.xDown - evt.clientX;
			yDiff = this.yDown - evt.clientY;
			minDistance *= 10;
		} else {
			xDiff = this.xDown - evt.changedTouches[0].clientX;
			yDiff = this.yDown - evt.changedTouches[0].clientY;
		}

		this.xDown = null;
		this.yDown = null;

		if (Math.abs(xDiff) > Math.abs(yDiff)) {
			if (xDiff > minDistance) {
				return false;
			} else if (xDiff < -minDistance) {
				return true;
			}
		}
		return null;
	}

	mouseIsUp(evt): boolean {
		this.refresherIsPulled = false;
		clearInterval(this.interval);
		this.pressDuration = 0;

		let xDiff, yDiff;
		if (evt.type === 'mouseup') {
			xDiff = this.xDown - evt.clientX;
			yDiff = this.yDown - evt.clientY;
		} else {
			xDiff = this.xDown - evt.changedTouches[0].clientX;
			yDiff = this.yDown - evt.changedTouches[0].clientY;
		}

		if (Math.abs(Math.abs(xDiff) - Math.abs(yDiff)) < 20 && !this.alert && !this.popover) {
			return true;
		}
		return false;
	}

	mouseIsDown(lessonOrSentence: Lesson | Sentence, parentId?: number) {
		if (lessonOrSentence instanceof Lesson) {
			this.popover = null;
			this.interval = setInterval(async () => {
				this.pressDuration++;
				if (this.pressDuration > 7) {
					clearInterval(this.interval);
					this.pressDuration = 0;
					if (!this.popover && !this.refresherIsPulled) {
						this.popover = await this.popoverController.create({
							component: LongPressChooserComponent,
							componentProps: {
								lesson: lessonOrSentence
							},
							mode: 'ios',
							animated: true,
							showBackdrop: true
						});
						await this.popover.present();
					}
				}
			}, 100);
		} else {
			if (!parentId) {
				this.interval = setInterval(async () => {
					this.pressDuration++;
					if (this.pressDuration > 7) {
						clearInterval(this.interval);
						this.pressDuration = 0;
						if (!this.refresherIsPulled) {
							this.alert = await this.alertController.create({
								message: 'Are you sure you want to delete this sentence?',
								buttons: [
									{
										text: 'Cancel',
										role: 'cancel'
									},
									{
										text: 'Delete',
										handler: async () => {
											await this.sentenceHttpService.deleteSentence(lessonOrSentence.id);
											this.lessonsDataService.removeSentence(
												lessonOrSentence.lessonId,
												lessonOrSentence.id
											);
										}
									}
								]
							});
							this.alert.onDidDismiss().then(() => this.alert = null);
							this.alert.present();
						}
					}
				}, 100);
			}
		}
	}
}
