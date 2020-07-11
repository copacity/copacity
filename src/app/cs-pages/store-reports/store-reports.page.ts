import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-store-reports',
  templateUrl: './store-reports.page.html',
  styleUrls: ['./store-reports.page.scss'],
})
export class StoreReportsPage implements OnInit {

  constructor(public popoverController: PopoverController) { }

  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }
}
