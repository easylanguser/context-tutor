import { Component, OnInit, ViewChildren } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { Lesson } from 'src/app/models/lesson';
import { LessonsDataService } from 'src/app/services/lessons-data/lessons-data.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Globals } from 'src/app/services/globals/globals';
import { Chart } from 'chart.js';
import * as _ from 'lodash';
import anime from 'animejs/lib/anime.es';
import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';
import { Browser } from '@capacitor/core';
import { ShareLessonModal } from 'src/app/modals/share-lesson/share-lesson.modal';
import { LessonHttpService } from 'src/app/services/http/lessons/lesson-http.service';

const urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

@Component({
	selector: 'page-lessons-list',
	templateUrl: 'lessons-list.page.html',
	styleUrls: ['lessons-list.page.scss'],
	animations: [
		trigger('lessonsAnimation', [
			transition('* => *', [
				query(':enter', style({ opacity: 0, height: 0 }), { optional: true }),
				query(':enter', stagger('100ms', [
					animate('500ms ease-in', keyframes([
						style({ opacity: 0, offset: 0 }),
						style({ opacity: .5, transform: 'scale(1.1)', offset: 0.4 }),
						style({ opacity: 1, height: '13.6vh', transform: 'scale(1)', offset: 1 })
					]))]), { optional: true }),
				query(':leave', stagger('100ms', [
					animate('400ms ease-out', style({ height: 0 }))
				]), { optional: true })
			])
		])
	]
})
export class LessonsListPage implements OnInit {

	displayedLessons: Lesson[] = [];
	@ViewChildren('statsLessonsCanvases') pieCanvases: any;
	pieCharts: Array<Chart> = [];
	filter: string = 'all';
	contentIsScrolled: boolean = false;
	firstEnter: boolean = true;
	editModeOn: boolean = false;

	constructor(
		private navController: NavController,
		private lessonsDataService: LessonsDataService,
		private lessonHttpService: LessonHttpService,
		private utils: UtilsService,
		private alertController: AlertController,
		private modalController: ModalController,
		public globals: Globals) { }

	async ngOnInit() {
		await this.utils.createAndShowLoader('Loading...');
		await this.getData();
		this.addFabsHandler();
		await this.utils.dismissLoader();
		this.syncCharts();
		this.pieCanvases.changes.subscribe(() => this.syncCharts());
		this.firstEnter = false;
	}

	toggleEditingMode() {
		this.editModeOn = !this.editModeOn;
	}

	changeFilter(isLeftSwipe: boolean) {
		if (this.filter === 'all') {
			this.filter = isLeftSwipe ? 'not-correct' : 'almost-correct';
		} else if (this.filter === 'almost-correct') {
			this.filter = isLeftSwipe ? 'all' : 'not-correct';
		} else {
			this.filter = isLeftSwipe ? 'almost-correct' : 'all';
		}
	}

	async filterChanged() {
		if (this.firstEnter) {
			this.firstEnter = false;
			return;
		}
		const allLessons: Lesson[] = this.lessonsDataService.lessons;
		if (this.filter === 'all') {
			this.displayedLessons = allLessons;
		} else if (this.filter === 'almost-correct') {
			this.displayedLessons = allLessons.filter(this.utils.redAndYellowFilterLesson);
		} else {
			this.displayedLessons = allLessons.filter(lesson =>
				lesson.statistics.some(stat => stat.wrongAnswers > 0)
			);
		}
	}

	private addFabsHandler() {
		const content = <HTMLIonContentElement>document.getElementById('list-scroll');
		content.scrollEvents = true;
		content.addEventListener('ionScroll', _.throttle((ev: CustomEvent) => {
			if (!this.globals.getIsDemo()) {
				if (ev.detail.velocityY > 0.1) {
					this.contentIsScrolled = true;
				} else if (ev.detail.velocityY < -0.1) {
					this.contentIsScrolled = false;
				}
			}
		}, 250), { passive: true });
	}

	ionViewDidEnter() {
		if (this.globals.updateIsRequired) {
			this.getData().then(() => {
				this.globals.updateIsRequired = false;
			});
		}
		this.globals.progressedWords = [];
		this.updateCharts(1000);
	}

	addLessonFile() {
		this.navController.navigateForward(['add-lesson']);
	}

	openLink(lessonUrl: string) {
		lessonUrl.match(urlRegex) ?
			Browser.open({ url: lessonUrl }) :
			this.utils.showToast('Lesson URL is not valid');
	}

	async deleteItem(lessonId: number) {
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
						await this.lessonHttpService.deleteLesson(lessonId);
						this.lessonsDataService.removeLesson(lessonId);
					}
				}
			]
		});
		alert.present();
	}

	async shareLesson(lessonId: number) {
		const modal = await this.modalController.create({
			component: ShareLessonModal,
			componentProps: {
				'lessonId': lessonId
			}
		});
		modal.present();
	}

	editItem(lessonId: number) {
		this.navController.navigateForward(['edit-lesson-title'],
			{ queryParams: { lessonId: lessonId } }
		);
	}

	private syncCharts() {
		this.pieCharts = [];
		for (const canvas of this.pieCanvases._results) {
			this.pieCharts.push(new Chart(canvas.nativeElement, this.utils.getNewChartObject()));
		}
		this.updateCharts(0);
	}

	private updateCharts(animationDuration: number) {
		let i = 0;
		for (const lesson of this.displayedLessons) {
			if (lesson.statistics) {
				const chart = this.pieCharts[i].data.datasets[0], chartData = chart.data;
				chartData[0] = 1;
				chartData[1] = 0;
				chartData[2] = 0;
				for (const stats of lesson.statistics) {
					if (stats && (stats.correctAnswers + stats.wrongAnswers +
						stats.hintUsages + stats.giveUps > 0)) {
						chartData[0] += stats.correctAnswers;
						chartData[1] += stats.wrongAnswers;
						chartData[2] += stats.hintUsages + stats.giveUps;
					}
				}

				if (chartData[0] + chartData[1] + chartData[2] > 1) {
					--chartData[0];
					chart.backgroundColor[0] = this.globals.chartsColors[0];
					chart.backgroundColor[1] = this.globals.chartsColors[1];
					chart.backgroundColor[2] = this.globals.chartsColors[2];
					this.pieCharts[i].options.cutoutPercentage = 60;
					this.pieCharts[i].update(animationDuration);
				}
			}
			++i;
		}
	}

	async doRefresh(event?: any) {
		if (!event) {
			anime({
				targets: [document.querySelector('#desktop-refresher-lessons')],
				rotate: '+=360',
				elasticity: 50,
				easing: 'easeOutElastic',
				duration: 3000
			});
			await this.utils.createAndShowLoader('Loading...');
		}
		await this.getData();
		this.filter = "all";
		if (event) {
			event.target.complete();
			setTimeout(() => {
				event.target.complete();
			}, 5000);
		} else {
			await this.utils.dismissLoader();
		}
	}

	private async getData() {
		await this.lessonsDataService.refreshLessons();
		this.displayedLessons = this.lessonsDataService.lessons.sort(this.lessonsDataService.sortLessonsByTime);
	}

	openLesson(lesson: Lesson, ev: any) {
		if (ev.target.tagName === 'ION-ICON')
			return;

		this.navController.navigateForward(
			['sentences-list'], {
				queryParams: {
					lessonId: lesson.id,
					parentId: lesson.parentId
				}
			});
	}
}
