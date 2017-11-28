import { Injectable }     from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { ITask } from "../shared/task";
import { UtilityService } from "./util.service"
/***
 * Api url
 * @type {string}
 */

@Injectable()
export class ApiService {
  private headers: Headers = new Headers({'Content-Type': 'application/json'});
  private options: RequestOptions = new RequestOptions({headers: this.headers});
  private API_URL:string;
  constructor(
    private util: UtilityService,
    private http: Http
  ) {
    this.API_URL = this.util.api;
  }

  getTasks(name) {
    return this.http.post(this.API_URL + 'tasks', {name: name}, this.options).toPromise()
      .then((resp: Response) => {
        return resp.json();
      });
  }

  updateTask(task, name) {
    return this.http.post(this.API_URL + 'updateTask', {task, name}, this.options).toPromise()
      .then((resp: Response) => {
        return resp.json();
      });
  }

  syncTasks(task, name) {
    return this.http.post(this.API_URL + 'syncTasks', {task, name}, this.options).toPromise()
      .then((resp: Response) => {
        return resp.json();
      });
  }

  updateCheck(check, name) {
    return this.http.post(this.API_URL + 'updateCheck', {check, name}, this.options).toPromise()
      .then((resp: Response) => {
        return resp.json();
      });
  }

  getAllList(name) {
    return this.http.post(this.API_URL + 'lists', {name}, this.options).toPromise()
      .then((resp: Response) => {
        return resp.json();
      });
  }

  getChecksTasksById(tasks: string[]) {
    return this.http.post(this.API_URL + 'getTasksInChecks', {tasks}, this.options).toPromise()
      .then((resp: Response) => {
        return resp.json();
      });
  }

  getTaskMessage(task: ITask) {
    return this.http.post(this.API_URL + 'getMessages', {task}, this.options).toPromise()
      .then((resp: Response) => {
        return resp.json();
      });
  }

  getAllUsers() {
    return this.http.post(this.API_URL + 'getUsers', {}, this.options).toPromise()
      .then((resp: Response) => {
        return resp.json();
      });
  }

  addMessageToTask(user, task, text) {
    return this.http.post(this.API_URL + 'addMessage', {task, user, text}, this.options).toPromise()
      .then((resp: Response) => {
        return resp.json();
      });
  }
  syncMessages(messagesObj) {
    let messages = [];
    for(let k in messagesObj){
      const item = messagesObj[k];
      messages = [...item];
    }
    console.log(messages);
    return this.http.post(this.API_URL + 'syncMessage', {messages}, this.options).toPromise()
      .then((resp: Response) => {
        return resp.json();
      });
  }

}
