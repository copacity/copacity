import { Component, OnInit } from '@angular/core';
import { PopoverController, AlertController, NavParams } from '@ionic/angular';
import { Observable } from 'rxjs';
import { StoreCoupon } from 'src/app/app-intefaces';
import { AppService } from 'src/app/cs-services/app.service';
import { StoreCouponsCreatePage } from '../store-coupons-create/store-coupons-create.page';
import { StoresService } from 'src/app/cs-services/stores.service';
import { BarcodeGeneratorComponent } from 'src/app/cs-components/barcode-generator/barcode-generator.component';

@Component({
  selector: 'app-store-coupons',
  templateUrl: './store-coupons.page.html',
  styleUrls: ['./store-coupons.page.scss'],
})
export class StoreCouponsPage implements OnInit {
  isAdmin: boolean;
  dashboard: boolean;
  orderTotal: number;
  storeCoupons: Observable<StoreCoupon[]>;
  searchingCoupons: boolean = false;
  couponSearchHits: number = 0;
  today: any;

  constructor(
    public popoverController: PopoverController,
    private storesService: StoresService,
    public alertController: AlertController,
    public appService: AppService,
    private navParams: NavParams) {
    this.today = new Date(new Date().setHours(23, 59, 59, 0));
    this.isAdmin = this.navParams.data.isAdmin;
    this.dashboard = this.navParams.data.dashboard;
    this.orderTotal = this.navParams.data.orderTotal;
    this.getCoupons();
  }

  ngOnInit() { }

  close() {
    this.popoverController.dismiss();
  }

  async openBarCodeGenerator(storeCoupon: StoreCoupon) {
    let value = this.appService._appInfo.domain + "/store-coupons-detail/" + storeCoupon.id + "&" + this.appService.currentStore.id;

    let modal = await this.popoverController.create({
      component: BarcodeGeneratorComponent,
      backdropDismiss: false,
      componentProps: { value: value, title: storeCoupon.name },
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
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

  async presentDeleteProductPrompt(storeCoupon: StoreCoupon) {
    this.presentConfirm('Esta seguro que desea eliminar el cupón: ' + storeCoupon.name + '?', () => {
      this.storesService.updateStoreCoupon(this.appService.currentStore.id, storeCoupon.id, { deleted: true }).then(() => {
        this.presentAlert("Cupon eliminado exitosamente!", '', () => { });
      });
    });
  }

  getCoupons() {
    this.storeCoupons = null;
    this.searchingCoupons = true;
    this.couponSearchHits = 0;

    setTimeout(() => {

      if (this.isAdmin) {
        this.storeCoupons = this.storesService.getAllStoreCoupons(this.appService.currentStore.id);

        this.storeCoupons.subscribe((products) => {
          this.couponSearchHits = 0;
          this.searchingCoupons = false;
          products.forEach(product => {
            if (product) {
              this.couponSearchHits++;
            }
          });
        });
      } else {
        this.storeCoupons = this.storesService.getStoreCouponsNoVIP(this.appService.currentStore.id);

        this.storeCoupons.subscribe((products) => {
          this.couponSearchHits = 0;
          this.searchingCoupons = false;
          products.forEach(product => {
            if (product) {
              this.couponSearchHits++;
            }
          });
        });
      }
    }, 500);
  }

  async openStoreCouponsCreatePage() {
    if (this.couponSearchHits < this.appService.currentStore.couponsLimit) {
      let modal = await this.popoverController.create({
        component: StoreCouponsCreatePage,
        componentProps: {},
        cssClass: 'cs-popovers',
        backdropDismiss: false,
      });

      modal.onDidDismiss()
        .then((data) => {
          const result = data['data'];
        });

      modal.present();
    } else {
      this.presentAlert("Has llegado al limite máximo de cupones permitidos, si deseas incrementar la cuota de cupones en tu tienda, debes comunicarte con los administradores del sitio. Gracias", "", () => { });
    }
  }

  async openStoreCouponsCreatePage_Update(storeCoupon: StoreCoupon) {
    let modal = await this.popoverController.create({
      component: StoreCouponsCreatePage,
      componentProps: { storeCoupon: storeCoupon },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
  }

  setLikeTemporalCoupon(storeCoupon: StoreCoupon) {
    if (!this.appService.temporalCoupon) {
      this.popoverController.dismiss(storeCoupon);
    }else{
      this.presentAlert("Ya tienes un cupón en tus manos, debes descartarlo primero si quieres tomar otro", "", () => {});
    }
  }
}
