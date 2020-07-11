import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProfileUpdatePage } from '../profile-update/profile-update.page';

@Component({
  selector: 'app-store-vendors',
  templateUrl: './store-vendors.page.html',
  styleUrls: ['./store-vendors.page.scss'],
})
export class StoreVendorsPage implements OnInit {

  constructor(
    public popoverController: PopoverController,
    public router: Router) { }

  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }

  async openProfileUpdatePage() {

    let modal = await this.popoverController.create({
      component: ProfileUpdatePage,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
      });

    modal.present();
  }
}
