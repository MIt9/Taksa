import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-check-finish',
  templateUrl: 'check-finish.html',
})
export class CheckFinishPage {
  public percentage:string = "0";
  public checkResult:{
    points: number,
    maxPoints: number,
    success: number,
    failures: number,
    all:number,
    unchecked:number
  } =
    {
      points: 0,
      maxPoints: 0,
      success: 0,
      failures: 0,
      all:0,
      unchecked: 0
    };
  constructor(public viewCtrl: ViewController, public params: NavParams) {
    this.checkResult = params.get('results');
    if (this.checkResult === undefined) {
      this.dismiss();
    } else {
      this.percentage = ((this.checkResult.points * 100) / this.checkResult.maxPoints).toFixed(2);
    }

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
