import {Injectable} from '@angular/core';
import {LoadingController} from 'ionic-angular';
import * as io from 'socket.io-client';
import {TaskService} from './task.service';
import {CheckService} from './check.service';
import {UtilityService} from "./util.service";
import {Storage} from '@ionic/storage';

@Injectable()
export class SocketService {
  private socket;
  private loading: any;
  private offline: {base64:string, title:string, taskId: string}[] = [];

  constructor(public loadingCtrl: LoadingController,
              private taskService: TaskService,
              private util: UtilityService,
              private storage: Storage,
              private checkService: CheckService) {
    this.storage.get('offline')
      .then((value) => {
      if (value === null){
        this.offline = [];
      }
        this.offline = JSON.parse(value);
        if (localStorage['user']) {
          this.checkService.getLists();
          this.taskService.fetchTasks();
        }
      })
      .catch((e) => {
        this.offline = [];
      });

    this.socket = io(this.util.server);
    this.socket.on('connect', () => {
      if (localStorage['user']) {
        this.login(localStorage['user']);
        this.taskService.getUsers();
        this.taskService.syncTasks();
        this.taskService.syncMessages();
        this.checkService.getLists();
        this.uploadFilesOnSync();
      }
    });
    this.socket.on('message', (data) => {
      console.log(data)
    });
    this.socket.on('confirm', (data) => {
      console.log(data);
    });
    this.socket.on('updateTasks', () => {
      this.taskService.fetchTasks();
    });
    this.socket.on('updateMessage', (value) => {
      if (this.taskService.openTask && value.tid === this.taskService.openTask.id) {
        this.taskService.getMessages(this.taskService.openTask);
      }
    });
    this.socket.on('end upload', (value) => {
      this.hideLoading();
      this.taskService.showMessage(`Файл ${value.file} загружен на сервер`)
    });
    this.socket.on('error', (value) => {
      console.error(value);
      this.taskService.showMessage(`Ошибка при работе с сервером`);
    });
  }

  showLoading() {
    if (!this.loading) {
      this.loading = this.loadingCtrl.create({
        spinner: 'crescent',
        content: 'Запрос обробатывается ...'
      });
      this.loading.present();
    }
  }

  hideLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  login(name) {
    this.socket.emit('login', {name: name});
  }

  sendFile(file, taskId) {
    (async () => {
      this.showLoading();
      let data;
      if (this.getExtension(file.name) === 'jpg') {
        data = await this.compressJpg(file);
      } else {
        data = await this.getBase64(file);
      }
      data.taskId = taskId;
      if (this.socket.connected){
        this.socket.emit('upload', data);
      } else {
        this.addToOfflineFiles(data);
      }
    })();
    return file.name;
  }

  addToOfflineFiles(item: {base64:string, title:string, taskId: string }) {
    if (this.offline === null) {
      this.offline = [];
    }
    for (let i = 0; i < this.offline.length; i++) {
      const f = this.offline[i];
      if(f.title === item.title && f.taskId === item.taskId){
        this.hideLoading();
        return;
      }
    }
    this.offline.push(item);
    this.storage.set('offline', JSON.stringify(this.offline)).then((v)=>{
      this.hideLoading();
    }).catch(e =>{
      this.hideLoading();
      console.error(e);
    });
  }
  uploadFilesOnSync(){
    if (this.socket.connected && this.offline !== null && this.offline.length > 0){
      for (let i = 0; i < this.offline.length; i++) {
        const data = this.offline[i];
        this.socket.emit('upload', data);
      }
      this.storage.set('offline', JSON.stringify([]));
    }
  }
  getExtension(filename) {
    const parts = filename.split('.');
    return parts[parts.length - 1].toLowerCase();
  }

  compressJpg(file) {
    return new Promise((resolve, reject) => {
      const quality: number = 70;
      const mime_type = "image/jpeg";
      const reader: any = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const cvs = document.createElement('canvas');
          cvs.width = img.naturalWidth;
          cvs.height = img.naturalHeight;
          cvs.getContext("2d").drawImage(img, 0, 0);
          const newImageData = cvs.toDataURL(mime_type, quality / 100);
          resolve({
            base64: newImageData.replace(/^data:([A-Za-z-+\/]+);base64,/, ""),
            title: file.name
          })
        };
        img.onerror = function (error) {
          reject(error);
        };
      };
      reader.onerror = function (error) {
        reject(error);
      };
    })

  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader: any = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve({
          base64: reader.result.replace(/^data:([A-Za-z-+\/]+);base64,/, ""),
          title: file.name
        });
      };
      reader.onerror = function (error) {
        reject(error);
      };
    })
  }
}
