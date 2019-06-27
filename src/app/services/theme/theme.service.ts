import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Storage } from '@ionic/storage';

@Injectable({
	providedIn: 'root'
})
export class ThemeService {

	constructor(@Inject(DOCUMENT) private document: Document, private storage: Storage) { }

	enableDarkMode(enableDarkMode: boolean) {
		let theme;
		if (enableDarkMode) {
			theme = this.getDarkTheme();
			this.storage.set("theme", 'dark');
		} else {
			theme = this.getLightTheme();
			this.storage.set("theme", 'light');
		}

		this.document.documentElement.style.cssText = theme;
	}

	getDarkTheme() {
		return ` \
			--ion-background-color: #353535; \
			--ion-background-color-rgb: 0,0,0; \
			--ion-text-color: #FFF; \
			--ion-text-color-rgb: 255,255,255; \
			--ion-color-step-50: #0d0d0d; \
			--ion-color-step-100: #191919; \
			--ion-color-step-150: #262626; \
			--ion-color-step-200: ;#333333; \
			--ion-color-step-250: #404040; \
			--ion-color-step-300: #4d4d4d; \
			--ion-color-step-350: #595959; \
			--ion-color-step-400: #666666; \
			--ion-color-step-450: #737373; \
			--ion-color-step-500: #808080; \
			--ion-color-step-550: #8c8c8c; \
			--ion-color-step-600: #999999; \
			--ion-color-step-650: #a6a6a6; \
			--ion-color-step-700: #b3b3b3; \
			--ion-color-step-750: #bfbfbf; \
			--ion-color-step-800: #cccccc; \
			--ion-color-step-850: #d9d9d9; \
			--ion-color-step-900: #e6e6e6; \
			--ion-color-step-950: #f2f2f2;`;
	}

	getLightTheme() {
		return ` \
			--ion-background-color: #f2f7ff; \
			--ion-background-color-rgb: 242,247,255; \
			--ion-text-color: #000000; \
			--ion-text-color-rgb: 0,0,0; \
			--ion-color-step-50: #ffffff; \
			--ion-color-step-100: #e6e6e6; \
			--ion-color-step-150: #d9d9d9; \
			--ion-color-step-200: #cccccc; \
			--ion-color-step-250: #bfbfbf; \
			--ion-color-step-300: #b3b3b3; \
			--ion-color-step-350: #a6a6a6; \
			--ion-color-step-400: #999999; \
			--ion-color-step-450: #8c8c8c; \
			--ion-color-step-500: #808080; \
			--ion-color-step-550: #737373; \
			--ion-color-step-600: #666666; \
			--ion-color-step-650: #595959; \
			--ion-color-step-700: #4d4d4d; \
			--ion-color-step-750: #404040; \
			--ion-color-step-800: #333333; \
			--ion-color-step-850: #262626; \
			--ion-color-step-900: #191919; \
			--ion-color-step-950: #0d0d0d;`;
	}
}
