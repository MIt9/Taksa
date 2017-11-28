import {Component, ViewChild} from '@angular/core';
import {NavController, ViewController, NavParams, Content} from 'ionic-angular';
import {TaskService} from '../../services/task.service';
import {IMessage} from '../../shared/message';
import {ITask} from '../../shared/task';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  @ViewChild('content') protected content: Content;

  public messages: IMessage[] = [];
  public owner: boolean = false;
  public text: string = '';
  public task: ITask;
  private updateWatcher:any;
  constructor(public viewCtrl: ViewController,
              public taskService: TaskService,
              public navCtrl: NavController,
              public params: NavParams) {
    this.task = params.get('item');
    if (this.task === undefined) {
      this.dismiss();
    }
    this.owner = localStorage.user;
    this.updateWatcher = this.taskService.messageArrayWatcher.subscribe((value: IMessage[]) => {
      this.messages = value;
      this.text = '';
      setTimeout(() => {
        this.goDown()
      })
    });
    this.taskService.getMessages(this.task);
  }
  dismiss() {
    this.updateWatcher.unsubscribe();
    this.viewCtrl.dismiss();
  }

  sendMessage() {
    if (this.text) {
      this.taskService.addMessage(this.task, this.text);
    }
  }

  goDown(): void {
    if (this.content !== undefined ) {
      this.content.scrollToBottom().catch((e)=>{
        console.log(e);
      });
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }
}
