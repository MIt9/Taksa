import { Component, ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Platform, MenuController, Nav, Events } from 'ionic-angular';

import { MainPage } from '../pages/main/main';
import { TestItemPage } from '../pages/test-item/test-item';
import { LoginPage } from '../pages/login/login';
import { CheckService } from '../services/check.service';
import { SocketService } from '../services/socket.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  public rootPage:any = LoginPage;
  public pages: Array<{title: string, component: any}>;
  public testList: any[] = [];
  public loggedIn = false;
  public loggedOutPages = { title: 'Авторизироватся', component: LoginPage } ;
  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    private events: Events,
    public checkService: CheckService,
    public splashScreen: SplashScreen,
    public socketService: SocketService
  ) {
    this.listenToLoginEvents();
    this.initializeApp();
    let isLogin = localStorage['user'];
    if (isLogin !== undefined){
      this.loggedIn = true;
      this.rootPage = MainPage;
    }
    this.testList = this.checkService.masterContainer;
    this.pages = [
      { title: 'Задачи', component: MainPage }
    ];
    this.checkService.globalListWatcher.subscribe((list)=>{
      const value: string[] = Object.keys(list);
      for (let i = 0; i < value.length; i++) {
        const listName = value[i];
        let notAdded = true;
        for (let j = 0; j < this.pages.length; j++) {
          const addedList = this.pages[j];
          if (addedList.title === listName){
            notAdded = false
          }
        }
        if(notAdded){
          this.pages.push({ title: listName, component: TestItemPage })
        }
      }
    });
    this.checkService.masterContainerWatcher.subscribe((value)=>{
      this.testList = value;
    })
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.checkService.setMasterContainer(page.title);
    this.nav.setRoot(page.component);
  }

  disableCheck(i){
    i.value = !i.value;
  }

  listenToLoginEvents() {
    this.events.subscribe('user:login', () => {
      this.loggedIn = true;
      if (localStorage.user){
        this.socketService.login(localStorage.user);
      }
      this.openPage({ title: 'Main page', component: MainPage });
    });

    this.events.subscribe('user:logout', () => {
      this.loggedIn = false;
      localStorage.removeItem('user');
      this.openPage({ title: 'Login', component: LoginPage });
    });
  }

  ngOnDestroy() {
    this.events.unsubscribe('user:login');
    this.events.unsubscribe('user:logout');
  }

  logOut() {
      this.events.publish('user:logout');
  }
  openItem(title:string, index:number) {
    this.menu.close();
    this.checkService.setCheck(title, index);
  }
}

