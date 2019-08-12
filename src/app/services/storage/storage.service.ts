import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/core';

@Injectable({
	providedIn: 'root'
})
export class StorageService {

	constructor() { }

	async set(key: string, value: string) {
		await Storage.set({
			key: key,
			value: value
		});
	}

	async get(key: string): Promise<{ value: string }> {
		return Storage.get({ key: key });
	}

	async remove(key: string) {
		await Storage.remove({ key: key });
	}

	async clear() {
		await Storage.clear();
	}
}
