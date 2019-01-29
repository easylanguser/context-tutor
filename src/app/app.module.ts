import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { SentenceGuessPage } from '../app/pages/sentence-guess/sentence-guess.page'
import { LessonsEditingPage } from '../app/pages/lesson-editing/lessons-editing'
import { HttpClient }  from '@angular/common/http'
import { HttpClientModule } from '@angular/common/http'

import { Storage, IonicStorageModule } from '@ionic/storage';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import {LoginPage} from "./pages/login/login.page";
import {LoginPageModule} from "./pages/login/login.module";


export function jwtOptionsFactory(storage) {
    return {
        tokenGetter: () => {
            return storage.get('access_token');
        },
        whitelistedDomains: ['http://165.227.159.35']
    }
}

@NgModule({
  declarations: [AppComponent, LessonsEditingPage, SentenceGuessPage],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule,LoginPageModule,IonicStorageModule.forRoot({
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
  bootstrap: [AppComponent]
})
export class AppModule {}
