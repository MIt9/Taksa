import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { MainPage } from '../pages/main/main';
import { CreateTaskPage } from '../pages/create-task/create-task';
import { TestItemPage } from '../pages/test-item/test-item';
import { LoginPage } from '../pages/login/login';
import { CheckFinishPage } from '../pages/check-finish/check-finish';
import { ChatPage } from '../pages/chat/chat';
import { SlideShowPage } from '../pages/slide-show/slide-show';


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ComponentsModule } from '../components/components.module';
import { TaskService } from '../services/task.service';
import { CheckService } from '../services/check.service';
import { SocketService } from '../services/socket.service';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';
import { UtilityService } from '../services/util.service';
import { Ng2CompleterModule } from "ng2-completer";

@NgModule({
  declarations: [
    MyApp,
    HelloIonicPage,
    SlideShowPage,
    ItemDetailsPage,
    MainPage,
    CreateTaskPage,
    TestItemPage,
    LoginPage,
    ListPage,
    ChatPage,
    CheckFinishPage
  ],
  imports: [
    Ng2CompleterModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpModule,
    ComponentsModule,
    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HelloIonicPage,
    SlideShowPage,
    ItemDetailsPage,
    CreateTaskPage,
    TestItemPage,
    MainPage,
    LoginPage,
    ChatPage,
    CheckFinishPage,
    ListPage
  ],
  providers: [
    StatusBar,
    ApiService,
    TaskService,
    SplashScreen,
    SocketService,
    UtilityService,
    NotificationService,
    CheckService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
