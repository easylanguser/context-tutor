import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SafeUrl } from '@angular/platform-browser';

@Injectable()
export class Globals {
	// VARIABLES 

	userId: number;

	userAvatar: SafeUrl;

	isDemo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isDemoHasChanged: boolean;

	updIsDemo(newVal: boolean) {
		this.isDemoHasChanged = (newVal !== this.getIsDemo());
		this.isDemo.next(newVal);
	}

	getIsDemo(): boolean {
		return this.isDemo.getValue();
	}

	sharedText = [];
	updateIsRequired = [false];
	savedTemplates: Array<[number, HTMLElement[]]> = [];

	// CONSTANTS
	SHARED_TEXT_ID_KEY = "shared_text_id";
	USER_AVATAR_KEY = 'user-avatar';
	USER_EMAIL_KEY = 'user-email';
	TOKEN_KEY = 'access_token';
	USER_ID_KEY = 'user_id';
	
	charForHiding: string = '•';
	redCharForHiding: string = '<span class=\'red-text\'>•</span>';
	blueCharForHiding: string = '<span class=\'blue-text\'>•</span>';
	chartsColors: [string, string, string] = ['#AFF265', '#FF9055', '#FFE320']; // Green, Red, Yellow
}