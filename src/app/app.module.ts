import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import {BrowserModule} from "@angular/platform-browser";
import {AngularFireModule} from "angularfire2/index";

export const firebaseConfig = {
  apiKey: "AIzaSyBDowpxFuzxTNFrdjgM2fSkiHsn1ZKoXL8",
  authDomain: "myapp-a651e.firebaseapp.com",
  databaseURL: "https://myapp-a651e.firebaseio.com",
  storageBucket: "myapp-a651e.appspot.com",
  messagingSenderId: "1027393219225"
};

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
