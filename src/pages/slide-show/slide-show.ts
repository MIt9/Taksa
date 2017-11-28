import { Component } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-slide-show',
  templateUrl: 'slide-show.html',
})
export class SlideShowPage {
  public imgUrl:string = '';
  slides:any[] = [];

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public params: NavParams) {
    const images = params.get('images');
    const imgPath = params.get('path');
    if(images !== undefined){
      this.slides = images;
      this.imgUrl = imgPath;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SlideShowPage');
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
}
