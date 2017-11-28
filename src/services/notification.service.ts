import {Injectable} from '@angular/core';

@Injectable()
export class NotificationService {
  constructor(
  ){
      Notification.requestPermission();
  }
  showNotification(title:string, body:string, link:string):void{
    let notification = new Notification(
      title, {
      icon: '/assets/icon/apple-icon.png',
      body: body,
    });

    notification.onclick = function () {
      window.open(link);
    };
  }
}
