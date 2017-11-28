import { Component } from '@angular/core';

import { NavParams, ItemSliding, ToastController, ModalController  } from 'ionic-angular';

import { ItemDetailsPage } from '../item-details/item-details';
import { CreateTaskPage } from '../create-task/create-task';
import { ITask } from '../../shared/task';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage{

  public items: ITask[] = [];
  public completedTask:number = 0;
  public listType:string = 'my';
  private myListWatcher:any;
  private elseListWatcher:any;
  public owner = localStorage.user;
  constructor(
    public params: NavParams,
    public modalCtrl: ModalController,
    public taskService: TaskService,
    private toastCtrl: ToastController
  ) {
    this.params = params;
    this.listType = this.params.data;
    if (this.listType === 'my'){
      this.items = taskService.myTaskContainer;
      this.completedTask = this.items.length - this.taskService.myOpenedTask;
      this.myListWatcher = this.taskService.myTaskContainerWatcher.subscribe(
          (value:ITask[])=>{
            this.items = value;
            this.owner = localStorage.user;
            this.completedTask = value.length - this.taskService.myOpenedTask;
          }
        )
    } else {
      this.items = taskService.elseTaskContainer;
      this.completedTask = this.items.length - this.taskService.elseOpenedTask;
      this.elseListWatcher = this.taskService.elseTaskContainerWatcher.subscribe(
        (value:ITask[])=>{
          this.items = value;
          this.owner = localStorage.user;
          this.completedTask = value.length - this.taskService.elseOpenedTask;
        }
      )
    }
  }

  showDetail(item: ITask) {
    let myModal = this.modalCtrl.create(ItemDetailsPage, { item });
    myModal.present();
  }

  editTask(slide: ItemSliding, item:ITask) {
    slide.close();
    let myModal = this.modalCtrl.create(CreateTaskPage, { item });
    myModal.present();
  }

  confirmExecution(item: ItemSliding, data: ITask){
    data.completed = !data.completed;
    this.taskService.updateTaskInList(data).then(()=>{
      this.expandAction(item, data.completed? 'Изменен статус на выполнено' : 'Изменен статус на в роботе');
    });
  }

  expandAction(item: ItemSliding, text: string) {
    setTimeout(() => {
      const toast = this.toastCtrl.create({
        message: text
      });
      toast.present();
      item.close();
      setTimeout(() => toast.dismiss(), 2000);
    }, 500);
  }

  ionViewDidLoad() {
    console.log('list load ' + this.listType);
  }
}
