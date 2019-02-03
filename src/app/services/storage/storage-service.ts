import {Injectable, OnInit} from '@angular/core';
import {Storage} from "@ionic/storage";

@Injectable({
    providedIn: 'root'
})
export class StorageService implements OnInit{

    constructor(private storage: Storage){;
    }

    ngOnInit(){

    }

    get(key: string): Promise<any> {
        return this.storage.get(key)
    }

    set(key: string,value: string): Promise<any> {
        return this.storage.set(key,value)
    }

    remove(key: string): Promise<any> {
        return this.storage.remove(key)
    }

}

