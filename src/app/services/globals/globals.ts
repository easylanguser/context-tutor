import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SafeUrl } from '@angular/platform-browser';

export interface ProgressedWord {
	fullWord: string;
	characters: string[];
	index: number;
}

@Injectable()
export class Globals {

	// VARIABLES 
	userId: number;
	userEmail: string;
	userAvatar: SafeUrl;

	platformName: string;

	isDemo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isDemoHasChanged: boolean;

	progressedWords: ProgressedWord[] = [];

	updIsDemo(newVal: boolean) {
		this.isDemoHasChanged = (newVal !== this.getIsDemo());
		this.isDemo.next(newVal);
	}

	getIsDemo(): boolean {
		return this.isDemo.getValue();
	}

	sharedText: string;
	updateIsRequired: boolean = false;
	savedTemplates: Array<[number, HTMLElement[]]> = [];

	// CONSTANTS
	SHARED_TEXT_ID_KEY = "shared_text_id";
	USER_AVATAR_KEY = 'user_avatar';
	USER_EMAIL_KEY = 'user_email';
	TOKEN_KEY = 'access_token';
	USER_ID_KEY = 'user_id';
	THEME_ID_KEY = 'theme_id';

	charForHiding: string = '•';
	redCharForHiding: string = '<span class=\'red-text\'>•</span>';
	blueCharForHiding: string = '<span class=\'blue-text\'>•</span>';
	chartsColors: [string, string, string] = ['#AFF265', '#FF9055', '#FFE320']; // Green, Red, Yellow
}