import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-store-coupons-create',
  templateUrl: './store-coupons-create.page.html',
  styleUrls: ['./store-coupons-create.page.scss'],
})
export class StoreCouponsCreatePage implements OnInit {

  constructor(public popoverController: PopoverController) { }

  ngOnInit() {
  }

  close(){
    this.popoverController.dismiss();
  }

}
