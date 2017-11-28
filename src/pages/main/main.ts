import { Component } from '@angular/core';
import { ListPage } from '../list/list';
import { MenuController, ModalController } from 'ionic-angular';
import { CreateTaskPage } from '../create-task/create-task';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})
export class MainPage {
  public list = ListPage;
  public myOpenTaskLength:any = '';
  public elseOpenTaskLength:any = '';
  private subscribeMyOpenTaskLength:any;
  private subscribeElseOpenTaskLength:any;

  constructor(
    public menu: MenuController,
    public taskService: TaskService,
    public modalCtrl: ModalController,
  ) {
    this.taskService.fetchTasks();
    this.menu.enable(true, 'main');
    this.menu.enable(false, 'test');
    this.myOpenTaskLength = this.taskService.myOpenedTask;
    this.subscribeMyOpenTaskLength = this.taskService.myOpenedTaskWatcher.subscribe(
      (value:any) =>{
        this.myOpenTaskLength = value;
      }
    );
    this.elseOpenTaskLength = this.taskService.elseOpenedTask;
    this.subscribeElseOpenTaskLength = this.taskService.elseOpenedTaskWatcher.subscribe(
      (value:any) =>{
        this.elseOpenTaskLength = value;
      }
    );

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MainPage');
  }

  addTask() {
    let myModal = this.modalCtrl.create(CreateTaskPage,{});
    myModal.present();
  }

  ngOnDestroy() {
    this.subscribeMyOpenTaskLength.unsubscribe();
    this.subscribeElseOpenTaskLength.unsubscribe();
  }
}
