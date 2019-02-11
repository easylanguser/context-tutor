import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { SentenceGuessPage } from '../app/pages/sentence-guess/sentence-guess.page'
import { SentencesListPage } from '../app/pages/sentences-list/sentences-list'
import { HttpClient }  from '@angular/common/http'
import { HttpClientModule } from '@angular/common/http'

import { Storage, IonicStorageModule } from '@ionic/storage';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import {LoginPageModule} from "./pages/login/login.module";
import {SignUpPageModule} from "./pages/sign-up/sign-up.module";
import {AccountPageModule} from "./pages/account/account.module";
import { Vibration } from '@ionic-native/vibration/ngx';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ForgetPageModule} from "./pages/forget/forget.module";
import {ChangePageModule} from "./pages/change/change.module";

export function jwtOptionsFactory(storage) {
    return {
        tokenGetter: () => {
            return storage.get('access_token');
        },
        whitelistedDomains: ['http://165.227.159.35']
    }
}

@NgModule({
  declarations: [AppComponent, SentencesListPage, SentenceGuessPage],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule,LoginPageModule,SignUpPageModule, BrowserAnimationsModule,
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
    Vibration,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
