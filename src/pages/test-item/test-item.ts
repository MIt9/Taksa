import { Component } from '@angular/core';
import { MenuController, ModalController } from 'ionic-angular';
import { CreateTaskPage } from '../../pages/create-task/create-task';
import { ItemDetailsPage } from '../item-details/item-details';
import { CheckService } from '../../services/check.service';
import { TaskService } from '../../services/task.service';
import { IDepartment } from '../../shared/department';
import { ICheck } from '../../shared/check';
import {ITask} from "../../shared/task";

@Component({
  selector: 'page-test-item',
  templateUrl: 'test-item.html',
})
export class TestItemPage {
  loadProgress = 0;
  department:string = '';
  departmentContainer:IDepartment;
  departmentsTitles = [];
  tasksArray:ITask[] = [];
  check:ICheck = {
    id: '',
    pid: '',
    title: '',
    description: '',
    status: null,
    tasks: [],
    max: 0,
    points: 0
  };

  constructor(
    public menu: MenuController,
    public modalCtrl: ModalController,
    public checkService: CheckService,
    private taskService: TaskService,
    ) {
    this.menu.enable(false, 'main');
    this.menu.enable(true, 'test');

    this.departmentContainer = this.checkService.currentDepartment;
    this.department = this.departmentContainer.title;
    this.departmentsTitles = this.checkService.titleArray;
    this.checkService.currentDepartmentWatcher.subscribe((value: IDepartment)=>{
      this.departmentContainer = value;
      this.department = this.departmentContainer.title;
      this.departmentsTitles = this.checkService.titleArray;
    });
    this.check = this.checkService.currentCheck;
    this.checkService.currentCheckWatcher.subscribe((value:ICheck) =>{
      this.check = value;
      this.tasksArray = [];
      this.checkService.getTasks(value.tasks).then((tasks)=>{
        this.tasksArray = tasks;
      })
    });
    this.checkService.checksStatus.subscribe((value:number) =>{
      this.loadProgress = + ((value * 100) /this.checkService.allChecks).toFixed(0);
    })
  }
  nextCheck(){
    this.check.status = true;
    this.check.points = this.check.max;
    this.checkService.updateCheck(this.check)
      .then(()=>{
        this.taskService.showMessage('Проверка пройдена удачно');
        this.checkService.setNextCheck();
      })
      .catch((e)=>{
        console.log(e)
      })
  }
  addTask() {
    let myModal = this.modalCtrl.create(CreateTaskPage, {
      item: {
        id: null,
        department: this.checkService.currentDepartment.title,
        check: this.check.title,
        note: '',
        assigned: localStorage.user,
        createdBy: localStorage.user,
        createTime: null,
        remindTime: 0,
        priority: 'low',
        completed: false,
        files: [],
        images: []
      },
      taskContainer: this.tasksArray,
      taskIds: this.check.tasks,

    });
    myModal.present();
  }
  skipCheck(){
    this.taskService.showMessage('Проверка пропущенна');
    this.checkService.setNextCheck();
  }
  failCheck() {
    this.check.status = false;
    if (!this.check.points){
      this.check.points = 0;
    } else if (this.check.points > this.check.max){
      this.check.points = this.check.max;
    } else {
      this.check.points = + this.check.points;
    }
    this.checkService.updateCheck(this.check)
      .then(()=>{
        this.taskService.showMessage('Проверка пройдена неудачно');
        this.checkService.setNextCheck();
      })
      .catch((e)=>{
        console.log(e)
      })
  }
  pauseTesting(){
    this.checkService.showResults();
  }
  showDetail(item){
    console.log(item);
    let myModal = this.modalCtrl.create(ItemDetailsPage, { item });
    myModal.present();
  }
}
