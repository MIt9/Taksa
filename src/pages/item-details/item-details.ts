import {Component} from '@angular/core';

import {NavParams, ViewController, ModalController, Platform} from 'ionic-angular';
import {TaskService} from '../../services/task.service';
import {UtilityService} from '../../services/util.service';
import {CreateTaskPage} from '../create-task/create-task';
import {ChatPage} from '../chat/chat';
import {SlideShowPage} from '../slide-show/slide-show';
import {ITask} from '../../shared/task';

@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage {

  public imgUrl:string = '';
  public task: ITask;
  public phone:string = '';
  public owner: string = '';
  public firstImgUrl: string = '';
  public showAttach = false;
  constructor(public viewCtrl: ViewController,
              public modalCtrl: ModalController,
              private utilityService: UtilityService,
              public taskService: TaskService,
              public platform: Platform,
              public params: NavParams) {
    this.task = params.get('item');
    if (this.task === undefined) {
      this.dismiss();
      return;
    }
    this.imgUrl = `${this.utilityService.file}${this.task.id}/`;
    if (this.task.images.length > 0){
      this.firstImgUrl = `url("${this.imgUrl}${this.task.images[0]}")`;
    }
    this.owner = localStorage.user;
    if (this.task.assigned === this.task.createdBy){
      this.phone = ''
    }
    else if (this.owner === this.task.assigned){
      const listener = this.taskService.allUsers[this.task.createdBy];
      if (listener !== undefined && listener.phone !== ''){
        this.phone = listener.phone;
      } else {
        this.phone = '';
      }
    } else {
      const listener = this.taskService.allUsers[this.task.assigned];
      if (listener !== undefined && listener.phone !== ''){
        this.phone = listener.phone;
      } else {
        this.phone = '' ;
      }
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  edit() {
    let myModal = this.modalCtrl.create(CreateTaskPage, {item: JSON.parse(JSON.stringify(this.task))});
    myModal.present();
    this.dismiss();
  }

  openChat() {
    let myModal = this.modalCtrl.create(ChatPage, {item: this.task});
    myModal.present();
  }
  showImages() {
    let myModal = this.modalCtrl.create(SlideShowPage, {images: this.task.images, path: this.imgUrl});
    myModal.present();
  }

  makeCall() {
    location.href = 'tel:' + this.phone;
  }
  confirmExecution(){
    this.task.completed = !this.task.completed;
    this.taskService.updateTaskInList(this.task).then(()=>{
      this.dismiss();
    });
  }
  attachTrigger(){
    this.showAttach = !this.showAttach;
  }
}
