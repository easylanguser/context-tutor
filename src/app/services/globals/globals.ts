import { Injectable } from '@angular/core';

@Injectable()
export class Globals {
	// Variables
	isDemo: boolean = false;
	sharedText = [];
	updateIsRequired = [false];

	// Constants
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