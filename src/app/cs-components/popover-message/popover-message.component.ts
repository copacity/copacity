import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover-message',
  templateUrl: './popover-message.component.html',
  styleUrls: ['./popover-message.component.scss'],
})
export class PopoverMessageComponent implements OnInit {
  messageRejected: FormControl;
  
  constructor(private popoverController: PopoverController) { 
    this.messageRejected = new FormControl('', [Validators.maxLength(500)]);
  }

  ngOnInit() {}

  cancel(){
    this.popoverController.dismiss();
  }

  accept(){
    this.popoverController.dismiss(this.messageRejected.value);
  }
}
