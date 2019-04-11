import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

import { Storage, IonicStorageModule } from '@ionic/storage';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { LoginPageModule } from './pages/login/login.module';
import { SignUpPageModule } from './pages/sign-up/sign-up.module';
import { AccountPageModule } from './pages/account/account.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SentencesListPageModule } from './pages/sentences-list/sentences-list.page.module';
import { SentenceGuessPageModule } from './pages/sentence-guess/sentence-guess.module';
import { ForgetPageModule } from './pages/forget/forget.module';
import { ChangePageModule } from './pages/change/change.module';
import { GuessBarComponent } from './components/guess-bar/guess-bar.component';
import { environment } from 'src/environments/environment';

export function jwtOptionsFactory(storage) {
	return {
		tokenGetter: () => {
			return storage.get('access_token');
		},
		whitelistedDomains: [environment.url]
	};
}

@NgModule({
	declarations: [AppComponent],
	entryComponents: [GuessBarComponent],
	imports: [BrowserModule, IonicModule.forRoot(),
		AppRoutingModule,
		HttpClientModule,
		SentencesListPageModule,
		SentenceGuessPageModule,
		LoginPageModule,
		SignUpPageModule,
		BrowserAnimationsModule,
		AccountPageModule,
		ForgetPageModule,
		ChangePageModule,
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
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	bootstrap: [AppComponent]
})
export class AppModule { }
