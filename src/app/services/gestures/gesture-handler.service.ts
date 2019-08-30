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
	refresherIsPulled: boolean = false;
	popover: HTMLIonPopoverElement = null;
	alert: HTMLIonAlertElement = null;
	longPressCancelled: boolean = false;

	constructor(private popoverController: PopoverController,
		private lessonsDataService: LessonsDataService,
		private alertController: AlertController,
		private sentenceHttpService: SentenceHttpService) { }

	ionContentTouchStart(evt) {
		const firstTouch = evt.type === 'mousedown' ?
			event :
			(evt.touches || evt.originalEvent.touches)[0];
		if (firstTouch.clientX > 50) {
			this.xDown = firstTouch.clientX;
			this.yDown = firstTouch.clientY;
		}
	}

	ionContentTouchEnd(evt): boolean {
		this.longPressCancelled = true;
		evt.preventDefault();
		let xDiff, yDiff, minDistance = 5;
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

	ionItemTouchUp(evt): boolean {
		this.refresherIsPulled = false;	

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

	ionItemTouchDown(event: any, lessonOrSentence: Lesson | Sentence, parentId?: number) {
		this.longPressCancelled = false;
		if (lessonOrSentence instanceof Lesson) {
			this.popover = null;
			setTimeout(async () => {
				if (!this.popover && !this.refresherIsPulled && !this.longPressCancelled) {
					let x: number, y: number,
						winWidth: number = window.innerWidth,
						winHeight: number = window.innerHeight;
					if (event instanceof MouseEvent) {
						x = event.x;
						y = event.y;
					} else {
						x = event.touches[0].clientX;
						y = event.touches[0].clientY;
					}
					if (!x || !y) return;

					if (winWidth < x + 260) {
						x -= (280 - (winWidth - x));
					}

					if (winHeight < y + 200) {
						y -= (220 - (winHeight - y));
					}

					this.popover = await this.popoverController.create({
						component: LongPressChooserComponent,
						componentProps: {
							lesson: lessonOrSentence,
							x: x,
							y: y + 20,
						},
						mode: 'ios',
						animated: true,
						showBackdrop: true
					});
					await this.popover.present();
				}
			}, 750);
		} else {
			if (!parentId) {
				setTimeout(async () => {
					if (!this.refresherIsPulled && !this.longPressCancelled) {
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
										this.lessonsDataService.getLessonById(lessonOrSentence.lessonId).sentencesCount--;
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
				}, 750);
			}
		}
	}
}
