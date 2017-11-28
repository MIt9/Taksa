import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { ITask } from '../shared/task';
import { IPeople } from '../shared/people';
import { IMessage } from '../shared/message';
import { ToastController } from 'ionic-angular';
import { UtilityService } from './util.service';
import { ApiService } from './api.service';
import { Storage } from '@ionic/storage';
/***
 * Service for show message
 */
@Injectable()
export class TaskService {
  public myOpenedTask: any = '';
  public elseOpenedTask: any = '';
  public allUsers: {} = {};
  public openTask:ITask;
  public offlineMessage:{} = {};
  public messageArray: IMessage[] = [];
  public messageArrayWatcher: Subject<IMessage[]> = new Subject<IMessage[]>();
  public myOpenedTaskWatcher:  Subject<any> = new Subject<any>();
  public elseOpenedTaskWatcher:  Subject<any> = new Subject<any>();
  public myTaskContainer: ITask[] = [];
  public elseTaskContainer: ITask[] = [];
  public myTaskContainerWatcher: Subject<ITask[]> = new Subject<ITask[]>();
  public elseTaskContainerWatcher: Subject<ITask[]> = new Subject<ITask[]>();

  constructor(
    private storage: Storage,
    private toastCtrl: ToastController,
    private apiService: ApiService,
    private utilityService: UtilityService,
  ){
    this.storage.get('offlineMessage')
      .then((value)=>{
        if (value === null) {
          this.offlineMessage = {}
        } else {
          this.offlineMessage = JSON.parse(value);
        }
      })
  }

  getUsers(){
      this.apiService.getAllUsers()
        .then((value:IPeople[])=>{
          const users = {};
          for (let i = 0; i < value.length; i++) {
            const user = value[i];
            users[user.name] = user;
          }
          this.allUsers = users;
          this.storage.set('users', JSON.stringify(users));
        })
        .catch((e)=>{
          this.storage.get('users').then((val) => {
            this.allUsers = JSON.parse(val);
          });
          console.error(e);
        })
  }

  fetchTasks():void{
    this.apiService.getTasks(localStorage.user)
      .then((value)=>{
        this.storage.set('tasks', JSON.stringify(value.tasks));
      this.updateTaskList(value.tasks);
    }).catch((e)=> {
      (async()=>{
        this.storage.get('tasks').then((val) => {
          this.updateTaskList(JSON.parse(val));
        }).catch((e)=>{
          this.updateTaskList([]);
          console.log(e);
        });
      })();
      console.error(e);
    })
  }

  updateTaskList(value:ITask[]){
    const myList = [];
    const elseList = [];
    for (let item of value) {
      if (item.assigned === localStorage.user){
        myList.push(item);
      } else {
        elseList.push(item);
      }
    }
    this.myTaskContainer = myList;
    this.elseTaskContainer = elseList;
    this.myOpenedTask = this.updateOpenTaskLength(myList as ITask[]);
    this.elseOpenedTask = this.updateOpenTaskLength(elseList as ITask[]);
    this.elseOpenedTaskWatcher.next(this.elseOpenedTask);
    this.elseTaskContainerWatcher.next(this.elseTaskContainer);
    this.myOpenedTaskWatcher.next(this.myOpenedTask);
    this.myTaskContainerWatcher.next(this.myTaskContainer);
  }

  updateOpenTaskLength(list: ITask[]):any {
    let task:any = 0;
    for (let i = 0; i < list.length; i++) {
      const taskItem = list[i];
      if (!taskItem.completed) {
        task++;
      }
    }
    if (task === 0) {
      task = '';
    }
    return task;
  }

  updateTaskInList(task:ITask): Promise<any> {
    return this.apiService.updateTask(task, localStorage.user)
      .then((value)=>{
        return value.updated;
      })
      .catch((e)=>{
        console.log(e);
        return this.updateOffline(task);
      })
  }

  syncTasks(){
    const tasksOffline = [...this.myTaskContainer, ...this.elseTaskContainer];
    const result = [];
    for (let i = 0; i < tasksOffline.length; i++) {
      const item = tasksOffline[i];
      if (item.dirty){
        result.push(item);
      }
    }
    console.log(result);
    this.apiService.syncTasks(result, localStorage.user);
  }

  syncMessages(){
    if (Object.keys(this.offlineMessage).length === 0) {
      return;
    }
    this.apiService.syncMessages(this.offlineMessage)
      .then((value)=>{
      console.log(value);
        this.offlineMessage = {};
        this.storage.set('offlineMessage', JSON.stringify(this.offlineMessage));
      })
      .catch((e)=>{
        console.log(e);
      })
  }
  updateOffline(task:ITask):Promise<any>{
    return new Promise((resolve)=>{
      const tasksOffline = [...this.myTaskContainer, ...this.elseTaskContainer];
        task.modification = new Date();
        let isNew = true;
        for (let i = 0; i < tasksOffline.length; i++) {
          const item = tasksOffline[i];
          if (item.id === task.id){
            tasksOffline[i] = task;
            isNew = false;
          }
        }
        if (isNew){
          tasksOffline.push(task);
        }
      this.updateTaskList(tasksOffline);
      this.storage.set('tasks', JSON.stringify(tasksOffline));
      resolve(task);
    })
  }
  showMessage(text: string) {
      const toast = this.toastCtrl.create({
        message: text
      });
      toast.present();
      setTimeout(() => toast.dismiss(), 1000);
  }

  restMessages():void{
    this.messageArray = [];
    this.messageArrayWatcher.next(this.messageArray);
  }

  getMessages(task:ITask):void{
    this.restMessages();
    this.openTask = task;
    (async ()=>{
      await this.apiService.getTaskMessage(task)
        .then((value: IMessage[])=>{
          this.messageArray = value;
          this.messageArrayWatcher.next(this.messageArray);
        })
        .catch((err)=>{
        const messages = this.offlineMessage[task.id];
        const offline = {
          id: null,
          tid: task.id,
          user: 'system',
          text: 'Нет соединения с сервером, все сообщения будут добавлены после подключения к сети',
          createTime: new Date()
        };
        if (messages !== undefined){
          this.messageArray = messages;
          this.messageArrayWatcher.next(this.messageArray);
        } else {
          this.messageArray = [offline];
          this.messageArrayWatcher.next(this.messageArray);
        }
          console.error(err);
        })
    })();
  }

  addMessage(task:ITask, text:string):void {
    this.openTask = task;
    this.apiService.addMessageToTask(localStorage.user, task, text)
      .then((value)=>{
        console.log(value);
      })
      .catch((err)=>{
        let messages = this.offlineMessage[task.id];
        if (messages == undefined){
          this.offlineMessage[task.id] = [];
          messages = this.offlineMessage[task.id];
        }
        const m = {
          id: this.utilityService.generateUID(),
          tid: task.id,
          user: localStorage.user,
          text: text,
          createTime: new Date()
        };
        messages.push(m);
        this.storage.set('tasks', JSON.stringify(this.offlineMessage));
        this.messageArray.push(m);
        this.messageArrayWatcher.next(this.messageArray);
      })
  }
}
