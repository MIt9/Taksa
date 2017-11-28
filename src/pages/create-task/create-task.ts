import { Component, ViewChild } from '@angular/core';
import { NavParams, ViewController, ModalController } from 'ionic-angular';
import { ITask } from '../../shared/task';
import { TaskService } from '../../services/task.service';
import { SocketService } from '../../services/socket.service';
import { UtilityService } from '../../services/util.service';
import { ItemDetailsPage } from '../item-details/item-details';

@Component({
  selector: 'page-create-task',
  templateUrl: 'create-task.html',
})
export class CreateTaskPage {
  @ViewChild('fileInput') fileInput;
  @ViewChild('photoInput') photoInput;
  public showImages:boolean = false;
  public showFiles:boolean = false;
  public imgUrl:string = '';
  public taskContainer:any;
  public taskIds:any;
  public readyToUploadPhotos:any[] = [];
  public readyToUploadFiles:any[] = [];
  public users:string[] = [];
  public task:ITask = {
    id: null,
    department: 'Магазин',
    check: '',
    note: '',
    assigned: localStorage.user,
    createdBy: localStorage.user,
    createTime: new Date,
    modification: null,
    remindTime: 0,
    priority: 'low',
    dirty: true,
    completed: false,
    files: [],
    images: []
  };

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public modalCtrl: ModalController,
    public socketService: SocketService,
    public utilityService: UtilityService,
    public taskService: TaskService
  ) {
    this.users = Object.keys(this.taskService.allUsers);
    const selectedItem = params.get('item');
    if (selectedItem !== undefined){
      this.task = JSON.parse(JSON.stringify(selectedItem));
    } else {
      this.task.id = this.utilityService.generateUID();
    }
    this.imgUrl = `${this.utilityService.file}${this.task.id}/`;
    const arr = params.get('taskContainer');
    if(arr){
      this.taskContainer = arr;
      this.taskIds = params.get('taskIds')
    }
  }

  imageTrigger(){
    this.showImages = !this.showImages;
  }

  attachTrigger(){
    this.showFiles = !this.showFiles;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  save() {
    this.task.createTime = new Date();
    this.task.modification = new Date();
    this.task.dirty = true;
    if (this.task.assigned.length > 1 &&
      this.task.check.length > 1 &&
      this.task.department.length > 1 &&
      this.task.note.length > 1
    ) {
      this.task.files = this.task.files.concat(this.readyToUploadFiles);
      this.task.images = this.task.images.concat(this.readyToUploadPhotos);
      this.taskService.updateTaskInList(this.task)
        .then((updated)=>{
          this.taskService.showMessage('Задача сохранена');
          if(this.taskContainer !== undefined){
            this.taskContainer.push(updated);
            this.taskIds.push(updated.id);
          }
          let myModal = this.modalCtrl.create(ItemDetailsPage, { item: updated });
          myModal.present();
          this.dismiss()
        })
        .catch((e)=>{
        console.log(e);
          this.taskService.showMessage('Нет интернет соединения попробуйте позднее');
          this.dismiss();
        });
    } else {
      this.taskService.showMessage('Заполните выделеные поля')
    }
  }
  addFile(){
    this.fileInput.nativeElement.click();
  }
  addPhoto(){
    this.photoInput.nativeElement.click();
  }
  updateFileList($event, type:string){
    if($event.target.files.length === 1){
      if (type === 'file'){
        this.readyToUploadFiles.push(this.socketService.sendFile($event.target.files[0], this.task.id));
      } else {
        this.readyToUploadPhotos.push(this.socketService.sendFile($event.target.files[0], this.task.id));
      }
    }
  }
  removeFile(index, list:any[]){
    list.splice(index, 1);
  }
}
