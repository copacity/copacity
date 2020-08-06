import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-ask-for-account',
  templateUrl: './ask-for-account.component.html',
  styleUrls: ['./ask-for-account.component.scss'],
})
export class AskForAccountComponent implements OnInit {

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() { }

  close() {
    this.popoverController.dismiss();
  }

  signUp() {
    this.popoverController.dismiss(0);
  }

  signIn() {
    this.popoverController.dismiss(1);
  }
}
