import { Component } from '@angular/core';
import { NavParams, Events } from 'ionic-angular';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  user = {
    name: 'd.bilukha',
    password: 'admin'
  };
  constructor(private taskService: TaskService, public navParams: NavParams, private events: Events) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }
  login() {
    if (this.user.name !== '' && this.user.password !== '' ) {
      localStorage['user'] = this.user.name;
      this.events.publish('user:login');
    } else {
      this.taskService.showMessage('Не верный логин или пароль');
    }
  }
}
