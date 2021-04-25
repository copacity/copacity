import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoadingController, PopoverController } from '@ionic/angular';
import { Vendor } from 'src/app/app-intefaces';
import { VendorsListComponent } from 'src/app/cs-components/vendors-list/vendors-list.component';
import { AppService } from 'src/app/cs-services/app.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { UsersService } from 'src/app/cs-services/users.service';

@Component({
  selector: 'app-split-layout',
  templateUrl: './split-layout.page.html',
  styleUrls: ['./split-layout.page.scss'],
})
export class SplitLayoutPage implements OnInit {
  loading: HTMLIonLoadingElement;
  @ViewChild('fab-chat', { static: false, read: ElementRef }) fabChat: ElementRef;

  constructor(public appService: AppService,
    private usersService: UsersService,
    private loadingCtrl: LoadingController,
    private storesService: StoresService,
    public popoverController: PopoverController,) { }

  ngOnInit() {
  }

  fillUsers(vendor: Vendor) {
    return new Promise((resolve, reject) => {
      this.usersService.getById(vendor.idUser).then(user => {
        resolve(user);
      });
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'fillUsers', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  async openVendorList(e: any) {
    this.loading = await this.loadingCtrl.create({});
    this.loading.present();

    let subs = this.storesService.getActiveVendors().subscribe(result => {

      let vendorPromises = [];
      result.forEach(vendor => {
        vendorPromises.push(this.fillUsers(vendor));
      });

      Promise.all(vendorPromises).then(async users => {

        if (this.loading) {
          await this.loading.dismiss();
          this.loading = null;
        }

        let modal = await this.popoverController.create({
          component: VendorsListComponent,
          mode: 'ios',
          event: e,
          componentProps: { users: users },
          cssClass: 'notification-popover'
        });

        modal.onDidDismiss()
          .then((data) => {
            let result = data['data'];
          });

        modal.present();
      });

      subs.unsubscribe();
    });
  }
}
