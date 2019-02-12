import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
	providedIn: 'root'
})
export class SettingsService {

	constructor(@Inject(DOCUMENT) private document: Document) { }

	enableDarkMode(enableDarkMode: boolean) {
		let theme = this.getLightTheme();
		if (enableDarkMode) {
			theme = this.getDarkTheme(); 
		}
		this.document.documentElement.style.cssText = theme;
	}

	getDarkTheme() {
		return '--ion-background-color: #303030; \
		--ion-text-color: #FFF; \
		--ion-color-step-850: #FFF; \
		--ion-color-step-50: #444; \
		currentColor: #FFF;'
	}

	getLightTheme() {
		return '--ion-background-color: #FFF; \
		--ion-text-color: #222;'	
	}
}
