/**
 * Created by d.bilukha on 01.09.2017.
 */
import {ModalController} from 'ionic-angular';
import {Injectable} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {ICheck} from '../shared/check';
import {IDepartment} from '../shared/department';
import {CheckFinishPage} from '../pages/check-finish/check-finish';
import {ApiService} from './api.service';
import {TaskService} from './task.service';
import { Storage } from '@ionic/storage';
import {ITask} from "../shared/task";

@Injectable()
export class CheckService {
  public masterContainer: IDepartment[] = [];
  public globalList: {} = {};
  public globalListWatcher: Subject<any> = new Subject<any>();
  public masterContainerWatcher: Subject<IDepartment[]> = new Subject<IDepartment[]>();
  public departmentIndex: {};
  public titleArray: string[] = [];
  public currentDepartment: IDepartment = {
    id: '',
    title: '',
    checks: []
  };
  public currentDepartmentWatcher: Subject<IDepartment> = new Subject<IDepartment>();
  public currentCheck: ICheck = {
    id: '',
    pid: '',
    title: '',
    description: '',
    status: false,
    tasks: [],
    max: 0,
    points: 0
  };
  public currentCheckWatcher: Subject<ICheck> = new Subject<ICheck>();
  public points: number = 0;
  public maxPoints: number = 0;
  public successChecks: number = 0;
  public failureChecks: number = 0;
  public allChecks: number = 0;
  public uncheckedChecks: number = 0;
  public checksStatus: Subject<number> = new Subject<number>();
  public checkIndex: number = 0;

  constructor(
    private storage: Storage,
    public modalCtrl: ModalController,
    public taskService: TaskService,
    public apiService: ApiService
  ) {}

  updateCheck(check):any{
    return this.apiService.updateCheck(check, localStorage.user).then((value)=>{
      this.storage.set('check', JSON.stringify(value));
      return value;
    }).catch((e)=>{
      console.log(e);
      return this.storage.get('check').then((val) => {
        return JSON.parse(val);
      });
    })
  }

  setMasterContainer(name:string, callback?:Function): void {
    const data = this.globalList[name];
    if (data === undefined){
      if(callback){
        callback();
      }
      return
    }
    this.masterContainer = data;
    this.masterContainerWatcher.next(this.masterContainer);
    const {indexHolder, titleArray} = this.getDepartmentIndex(this.masterContainer);
    this.departmentIndex = indexHolder;
    this.titleArray = titleArray;
    this.setDepartment(this.titleArray[0]);
  }

  showResults() {
    let myModal = this.modalCtrl.create(CheckFinishPage, {
      results: {
        success: this.successChecks,
        failures: this.failureChecks,
        all: this.allChecks,
        unchecked: this.uncheckedChecks,
        points: this.points,
        maxPoints: this.maxPoints,
      }
    });
    myModal.present();
  }

  setDepartment(title: string): void {
    this.checkIndex = 0;
    let isHasUncheckCheck = this.updateUnChecked();
    if (isHasUncheckCheck !== 0) {
      this.currentDepartment = this.masterContainer[this.departmentIndex[title]];
      this.currentDepartmentWatcher.next(this.currentDepartment);
      this.setNextCheck();
    } else {
      this.showResults();
    }
  }

  updateUnChecked(): number {
    let unchecked = 0;
    let all = 0;
    let success = 0;
    let failures = 0;
    let points = 0;
    let max = 0;
    this.masterContainer.filter((department) => {
      return department.checks.filter((element) => {
        if (element.status === true) {
          success++;
        } else if (element.status === false) {
          failures++;
        } else if (element.status === null) {
          unchecked++;
        }
        all++;
        points = + points + element.points;
        max = + max + element.max;
        return element.status === null
      })
    });
    this.successChecks = success;
    this.failureChecks = failures;
    this.allChecks = all;
    this.uncheckedChecks = unchecked;
    this.checksStatus.next(success + failures);
    this.maxPoints = max;
    this.points = points;
    return unchecked;
  }

  setCheck(title: string, checkIndex: number): void {
    this.checkIndex = checkIndex;
    this.currentDepartment = this.masterContainer[this.departmentIndex[title]];
    this.currentDepartmentWatcher.next(this.currentDepartment);
    this.currentCheck = this.currentDepartment.checks[this.checkIndex];
    this.currentCheckWatcher.next(this.currentCheck);
  }

  setNextCheck(): void {
    if (this.updateUnChecked() === 0) {
      this.showResults();
      return;
    }
    if (this.currentDepartment.checks[this.checkIndex] === undefined) {
      let currentDepartmentIndex = this.titleArray.indexOf(this.currentDepartment.title);
      if (this.titleArray.length === currentDepartmentIndex + 1) {
        currentDepartmentIndex = 0;
      } else {
        currentDepartmentIndex = currentDepartmentIndex + 1;
      }
      this.setDepartment(this.titleArray[currentDepartmentIndex]);
    } else {
      let check;
      do {
        check = this.currentDepartment.checks[this.checkIndex];
        if (check === undefined) {
          this.setNextCheck();
          return;
        } else {
          this.checkIndex = this.checkIndex + 1;
        }
      } while (check.status !== null);
      this.currentCheck = check;
      this.currentCheckWatcher.next(this.currentCheck);
    }
  }

  getDepartmentIndex(list: IDepartment[]): { indexHolder: {}, titleArray: string[] } {
    const indexHolder: {} = {};
    const titleArray: string[] = [];
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      indexHolder[item.title] = i;
      titleArray.push(item.title);
    }
    return {indexHolder, titleArray}
  }

  getLists() {
    return this.apiService.getAllList(localStorage.user)
      .then((value) => {
        this.storage.set('globalList', JSON.stringify(value));
        this.globalList = value;
        this.globalListWatcher.next(this.globalList);
        return Object.keys(this.globalList);
      })
      .catch((e) => {
        return this.storage.get('globalList')
          .then((value)=>{
            if(value === null){
              value = JSON.stringify({});
            }
            this.globalList = JSON.parse(value);
            this.globalListWatcher.next(this.globalList);
            return Object.keys(this.globalList);
          })
    })
  }

  getTasks(tasks:string[]) {
    return this.apiService.getChecksTasksById(tasks)
      .then((value) => {
        return value
      })
      .catch((e)=>{
        console.log(e);
        return this.getTasksOffline(tasks);
      })
  }
  getTasksOffline(tasks:string[]){
    return new Promise((resolve,reject)=>{
      const taskArray:ITask[] = [...this.taskService.myTaskContainer, ...this.taskService.elseTaskContainer ];
      const result:ITask[] = [];
      for (let i = 0; i < taskArray.length; i++) {
        const item = taskArray[i];
        if (tasks.indexOf(item.id) !== -1){
          result.push(item);
        }
      }
      resolve(result);
    })
  }
}
