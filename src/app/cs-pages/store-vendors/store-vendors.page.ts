import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProfileUpdatePage } from '../profile-update/profile-update.page';
import { Vendor, User } from 'src/app/app-intefaces';
import { AppService } from 'src/app/cs-services/app.service';
import { VendorStatus } from 'src/app/app-enums';
import { StoresService } from 'src/app/cs-services/stores.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { Observable } from 'rxjs';
import { UsersService } from 'src/app/cs-services/users.service';

@Component({
  selector: 'app-store-vendors',
  templateUrl: './store-vendors.page.html',
  styleUrls: ['./store-vendors.page.scss'],
})
export class StoreVendorsPage implements OnInit {
  user: User;

  vendor: Vendor = {
    id: '',
    status: VendorStatus.Pending,
    idUser: this.appService.currentUser.id,
    active: true,
    commissionForSale: 0,
    dateCreated: new Date(),
    deleted: false,
  }

  constructor(
    public popoverController: PopoverController,
    public appService: AppService,
    private storesService: StoresService,
    private usersService: UsersService,
    public navParams: NavParams,
    public alertController: AlertController,
    private loaderComponent: LoaderComponent,
    public router: Router) {

    this.usersService.getById(this.navParams.data.idUser).then((user: User) => {
      this.user = user;
      let subs = this.storesService.getVendorsByIdUser(this.appService.currentStore.id, user.id).subscribe(result => {
        result.forEach(vendor => {
          this.vendor = vendor;
        });
  
        subs.unsubscribe();
      });
    });
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
      this.storesService.updateVendor(this.appService.currentStore.id, this.vendor.id, { status: VendorStatus.Pending }).then(doc => {
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
