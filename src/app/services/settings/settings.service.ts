import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
	providedIn: 'root'
})
export class SettingsService {

	private currentTheme = '';

	constructor(@Inject(DOCUMENT) private document: Document) { }

	setPrimaryColor(color: string) {
		this.setVariable('--ion-color-primary', color)
	}

	setVariable(name: string, value: string) {
		this.currentTheme = `${name}: ${value};`;
		this.document.documentElement.style.setProperty(name, value);
	}

	enableDarkMode(enableDarkMode: boolean) {
		let theme = this.getLightTheme();
		if (enableDarkMode) {
			theme = this.getDarkTheme(); 
		}
		this.document.documentElement.style.cssText = theme;
	}

	getDarkTheme() {
		return `
      ${this.currentTheme}
      --ion-background-color: #303030;
	  --ion-text-color: #FFF;
    `
	}

	getLightTheme() {
		return `
      ${this.currentTheme}
      --ion-background-color: #fff;
      --ion-text-color: #222;
    `
	}
}
