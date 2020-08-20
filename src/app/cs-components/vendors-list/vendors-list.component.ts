import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';

@Component({
  selector: 'app-vendors-list',
  templateUrl: './vendors-list.component.html',
  styleUrls: ['./vendors-list.component.scss'],
})
export class VendorsListComponent implements OnInit {

  constructor(
    private popoverCtrl: PopoverController,
    public appService: AppService) { }

  ngOnInit() { }

  close() {
    this.popoverCtrl.dismiss();
  }
}
