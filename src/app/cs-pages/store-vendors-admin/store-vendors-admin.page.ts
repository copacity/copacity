import { Component, OnInit } from '@angular/core';
import { PopoverController, AlertController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { UsersService } from 'src/app/cs-services/users.service';
import { User, Vendor } from 'src/app/app-intefaces';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { VendorStatus } from 'src/app/app-enums';
import { StoreVendorsPage } from '../store-vendors/store-vendors.page';
import { StoreVendorsUpdatePage } from '../store-vendors-update/store-vendors-update.page';

@Component({
  selector: 'app-store-vendors-admin',
  templateUrl: './store-vendors-admin.page.html',
  styleUrls: ['./store-vendors-admin.page.scss'],
})
export class StoreVendorsAdminPage implements OnInit {

  vendors: any = [];
  searchingVendors: boolean = false;
  vendorsSearchHits: number = 0;

  constructor(
    public popoverController: PopoverController,
    public alertController: AlertController,
    public appService: AppService,
    private storesService: StoresService,
    private usersService: UsersService) {
    this.getVendors();
  }

  getVendors() {
    this.vendors = [];
    this.vendorsSearchHits = 0;
    this.searchingVendors = true;

    let subs = this.storesService.getVendors(this.appService.currentStore.id).subscribe(result => {

      let vendorPromises = [];
      result.forEach(vendor => {
        vendorPromises.push(this.fillUsers(vendor));
      });

      Promise.all(vendorPromises).then(vendors => {
        vendors.forEach(vendor => {
          if (vendor.vendor.status != VendorStatus.Cancelled) {
            this.vendorsSearchHits++;
            this.vendors.push(vendor);
          }
        });

        this.searchingVendors = false;
      });

      subs.unsubscribe();
    });
  }

  async presentDeleteVendorPrompt(vendor: any) {
    this.presentConfirm('Esta seguro que desea rechazar el vendedor: ' + vendor.user.name + '?', () => {
      this.storesService.updateVendor(this.appService.currentStore.id, vendor.vendor.id, { status: VendorStatus.Cancelled }).then(() => {
        this.presentAlert("Vendedor rechazado exitosamente!", '', () => { });
        this.getVendors();
      });
    });
  }

  confirmVendor(vendor: any) {
    let count = 0;
    this.vendors.forEach((vendor: any) => {
      if(vendor.vendor.status == VendorStatus.Confirmed){
        count ++;
      }
    });

    if (count < this.appService.currentStore.vendorsLimit) {
      this.openVendorUpdateDetails(vendor);
    } else {
      this.presentAlert("Has llegado al limite máximo de vendedores en tu tienda, Si necesitas confirmar mas vendedores, comunicate con el administrador de CopaCity para incrementar la capacidad. Gracias.", "", () => { })
    }
  }

  async openVendorDetail(vendor: any) {
    let modal = await this.popoverController.create({
      component: StoreVendorsPage,
      componentProps: { idUser: vendor.vendor.idUser },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
  }

  async openVendorUpdateDetails(vendor: any) {
    let modal = await this.popoverController.create({
      component: StoreVendorsUpdatePage,
      componentProps: { vendor: vendor },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

        if(result){
          this.getVendors();
        }
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

  async presentConfirm(message: string, done: Function, cancel?: Function) {

    const alert = await this.alertController.create({
      header: message,
      mode: 'ios',
      translucent: true,
      animated: true,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => cancel ? cancel() : null
        },
        { text: 'Estoy Seguro!', handler: () => done() }
      ]
    });

    await alert.present();
  }

  async openImageViewer(img: string) {
    let images: string[] = [];
    images.push(img);

    let modal = await this.popoverController.create({
      component: ImageViewerComponent,
      componentProps: { images: images },
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
      });

    modal.present();
  }

  fillUsers(vendor: Vendor) {
    return new Promise((resolve, reject) => {
      this.usersService.getById(vendor.idUser).then(user => {
        resolve({ user: user, vendor: vendor });
      });
    }).catch(err => {
      alert(err);
      this.appService.logError({id:'', message: err, function:'store-vendors - fillUsers', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }
}
