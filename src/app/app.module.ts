import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

import { Storage, IonicStorageModule } from '@ionic/storage';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SentencesListPageModule } from './pages/sentences-list/sentences-list.page.module';
import { SentenceGuessPageModule } from './pages/sentence-guess/sentence-guess.module';
import { environment } from 'src/environments/environment';
import { TOKEN_KEY } from './services/auth/auth.service';
import { LessonsListPageModule } from './pages/lessons-list/lessons-list.page.module';

export function jwtOptionsFactory(storage) {
	return {
		tokenGetter: () => {
			return storage.get(TOKEN_KEY);
		},
		whitelistedDomains: [environment.url]
	};
}

@NgModule({
	declarations: [AppComponent],
	entryComponents: [],
	imports: [BrowserModule, IonicModule.forRoot(),
		AppRoutingModule,
		HttpClientModule,
		LessonsListPageModule,
		SentencesListPageModule,
		SentenceGuessPageModule,
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
		StatusBar,
		SplashScreen,
		HttpClient,
		InAppBrowser,
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	bootstrap: [AppComponent]
})
export class AppModule { }
