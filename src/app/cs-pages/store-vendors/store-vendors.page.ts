import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProfileUpdatePage } from '../profile-update/profile-update.page';
import { Vendor } from 'src/app/app-intefaces';
import { AppService } from 'src/app/cs-services/app.service';
import { VendorStatus } from 'src/app/app-enums';
import { StoresService } from 'src/app/cs-services/stores.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';

@Component({
  selector: 'app-store-vendors',
  templateUrl: './store-vendors.page.html',
  styleUrls: ['./store-vendors.page.scss'],
})
export class StoreVendorsPage implements OnInit {
  isAdmin: boolean;

  vendor: Vendor = {
    id: '',
    status: VendorStatus.Pending,
    idUser: this.appService.currentUser.id,
    active: true,
    commisionForSale: 0,
    dateCreated: new Date(),
    deleted: false,
  }

  constructor(
    public popoverController: PopoverController,
    public appService: AppService,
    private storesService: StoresService,
    public navParams: NavParams,
    public alertController: AlertController,
    private loaderComponent: LoaderComponent,
    public router: Router) {


    let subs = this.storesService.getVendorsByIdUser(this.appService.currentStore.id, this.appService.currentUser.id).subscribe(result => {
      result.forEach(vendor => {
        this.vendor = vendor;
      });

      subs.unsubscribe();
    });

    this.isAdmin = this.navParams.data.isAdmin;
  }

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

  async presentAlert(title: string, message: string, done: Function) {

    const alert = await this.alertController.create({
      header: title,
      message: message,
      mode: 'ios',
      translucent: true,
      animated: true,
      backdropDismiss: false,
      buttons: ['Aceptar!']
    });

    alert.onDidDismiss().then(done());
    await alert.present();
  }

  sendToRevission() {
    this.loaderComponent.startLoading("Enviando Solicitud para revision. Gracias");

    if (this.vendor.id) {
      this.storesService.updateVendor(this.appService.currentStore.id, this.vendor.id, { status: VendorStatus.Pending}).then(doc => {
        this.vendor.status = VendorStatus.Pending;
        this.loaderComponent.stopLoading();
        this.presentAlert("Solicitud enviada exitosamente.", "", () => { });
      });
    } else {
      this.storesService.createVendor(this.appService.currentStore.id, this.vendor).then(doc => {
        this.vendor.id = doc.id;
        this.loaderComponent.stopLoading();
        this.presentAlert("Solicitud enviada exitosamente.", "", () => { });
      });
    }
  }
}
