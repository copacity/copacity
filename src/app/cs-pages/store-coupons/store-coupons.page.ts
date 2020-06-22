import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { StoreCoupon } from 'src/app/app-intefaces';
import { AppService } from 'src/app/cs-services/app.service';
import { StoreCouponsCreatePage } from '../store-coupons-create/store-coupons-create.page';

@Component({
  selector: 'app-store-coupons',
  templateUrl: './store-coupons.page.html',
  styleUrls: ['./store-coupons.page.scss'],
})
export class StoreCouponsPage implements OnInit {
  isAdmin: boolean;
  storeCoupons: Observable<StoreCoupon[]>;
  searchingCoupons: boolean = false;
  couponSearchHits: number = 0;

  constructor(
    public popoverController: PopoverController,
    public appService: AppService, ) { }

  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }

  async openStoreCouponsCreatePage() {
    let modal = await this.popoverController.create({
      component: StoreCouponsCreatePage,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
  }
}
