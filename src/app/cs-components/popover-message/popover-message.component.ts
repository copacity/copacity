import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-popover-message',
  templateUrl: './popover-message.component.html',
  styleUrls: ['./popover-message.component.scss'],
})
export class PopoverMessageComponent implements OnInit {
  messageRejected: FormControl;
  title: string;
  
  constructor(private popoverController: PopoverController,
    private navParams: NavParams) { 
      this.title = this.navParams.data.title;
    this.messageRejected = new FormControl(this.navParams.data.message, [Validators.maxLength(500)]);
  }

  ngOnInit() {}

  cancel(){
    this.popoverController.dismiss();
  }

  accept(){
    this.popoverController.dismiss(this.messageRejected.value);
  }
}
