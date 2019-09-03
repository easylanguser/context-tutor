import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

import { Storage, IonicStorageModule } from '@ionic/storage';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { Globals } from './services/globals/globals';
import { ShareLessonModal } from './modals/share-lesson/share-lesson.modal';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

export function jwtOptionsFactory(storage) {
	return {
		tokenGetter: () => {
			return storage.get('access_token');
		},
		whitelistedDomains: [environment.url]
	};
}

@NgModule({
	declarations: [AppComponent, ShareLessonModal],
	entryComponents: [ShareLessonModal],
	imports: [BrowserModule, IonicModule.forRoot(),
		AppRoutingModule,
		ReactiveFormsModule,
		FormsModule,
		HttpClientModule,
		BrowserAnimationsModule,
		IonicStorageModule.forRoot({
			name: 'easy-db',
			driverOrder: ['indexeddb', 'sqlite', 'websql']
		}),
		JwtModule.forRoot({
			jwtOptionsProvider: {
				provide: JWT_OPTIONS,
				useFactory: jwtOptionsFactory,
				deps: [Storage],
			}
		})],
	providers: [
		HttpClient,
		Globals,
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	bootstrap: [AppComponent]
})
export class AppModule { }
