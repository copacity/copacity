import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/cs-services/app.service';
import { AlertController, PopoverController, ToastController } from '@ionic/angular';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { StoreCoupon } from 'src/app/app-intefaces';
import { ActivatedRoute, Router } from '@angular/router';
import { StoresService } from 'src/app/cs-services/stores.service';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { BarcodeScannerComponent } from 'src/app/cs-components/barcode-scanner/barcode-scanner.component';

@Component({
  selector: 'app-store-coupons-detail',
  templateUrl: './store-coupons-detail.page.html',
  styleUrls: ['./store-coupons-detail.page.scss'],
})
export class StoreCouponsDetailPage implements OnInit {
  storeCoupon: StoreCoupon;
  storeId: string;
  couponExpirationDate: any;

  constructor(
    private router: Router,
    public appService: AppService,
    private popoverCtrl: PopoverController,
    private ngNavigatorShareService: NgNavigatorShareService,
    public toastController: ToastController,
    private route: ActivatedRoute,
    private loaderComponent: LoaderComponent,
    private angularFireAuth: AngularFireAuth,
    private storesService: StoresService,
    public alertController: AlertController,
  ) {
    this.angularFireAuth.auth.onAuthStateChanged(user => {
      this.initialize(user);
    });

    this.initialize();
  }

  initialize(user?: any) {
    let storeCouponId = this.route.snapshot.params.id.toString().split("&")[0];
    this.storeId = this.route.snapshot.params.id.toString().split("&")[1];

    this.storesService.getCouponById(this.storeId, storeCouponId).then((storeCoupon: StoreCoupon) => {
      if (storeCoupon) {
        
        this.storeCoupon = storeCoupon
        this.couponExpirationDate = this.storeCoupon.dateExpiration;
      }
    });
  }

  ngOnInit() {
  }

  async SignIn() {
    const popover = await this.popoverCtrl.create({
      component: SigninComponent,
      cssClass: "signin-popover",
    });
    return await popover.present();
  }

  signOut() {
    this.presentConfirm("Estas seguro que deseas cerrar la sesion?", () => {
      this.loaderComponent.startLoading("Cerrando Sesion, por favor espere un momento...")
      setTimeout(() => {
        this.angularFireAuth.auth.signOut();
        //this.popoverCtrl.dismiss();
        this.presentToast("Has abandonado la sesión!");
        this.loaderComponent.stopLoading();
      }, 500);
    });
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

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
  }

  async presentMenuUser(e) {
    const popover = await this.popoverCtrl.create({
      component: MenuUserComponent,
      animated: false,
      showBackdrop: true,
      mode: 'ios',
      translucent: false,
      event: e
    });

    return await popover.present();
  }

  async openBarCodeScanner() {
    let modal = await this.popoverCtrl.create({
      component: BarcodeScannerComponent,
      backdropDismiss: false,
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

        if (result) {
          if (result.indexOf("store-coupons-detail") != -1) {
            let value = result.toString().split("/");
            this.router.navigate(['store-coupons-detail/', value[value.length - 1]]);
          } else if (result.indexOf("product-detail") != -1) {
            let value = result.toString().split("/");
            this.router.navigate(['product-detail/', value[value.length - 1]]);
          } else if (result.indexOf("store") != -1) {
            let value = result.toString().split("/");
            this.router.navigate(['store/', value[value.length - 1]]);
          }
        }
      });

    modal.present();
  }

  async presentMenuNotifications(e) {
    const popover = await this.popoverCtrl.create({
      component: MenuNotificationsComponent,
      animated: false,
      showBackdrop: true,
      mode: 'ios',
      translucent: false,
      event: e,
      cssClass: 'notification-popover'
    });

    return await popover.present();
  }

  shareApp(e) {
    this.ngNavigatorShareService.share({
      title: "COPACITY",
      text: 'Hola! Somos copacity.net, tu Centro Comercial Virtual, aquí podrás ver nuestras tiendas con una gran variedad de productos para tí, promociones, cupones con descuentos, tambien podrás acumular puntos y obtener regalos, y lo mejor!, todo te lo llevamos hasta la puerta de tu casa!',
      url: this.appService._appInfo.domain
    }).then((response) => {
      console.log(response);
    })
      .catch((error) => {
        console.log(error);

        if (error.error.toString().indexOf("not supported") != -1) {
          this.openCopyToClipBoard(e);
        }
      });
  }

  async openCopyToClipBoard(e) {
    let text = 'Hola! Somos copacity.net, tu Centro Comercial Virtual, aquí podrás ver nuestras tiendas con una gran variedad de productos para tí, promociones, cupones con descuentos, tambien podrás acumular puntos y obtener regalos, y lo mejor!, todo te lo llevamos hasta la puerta de tu casa! ' + this.appService._appInfo.domain;

    let modal = await this.popoverCtrl.create({
      component: CopyToClipboardComponent,
      cssClass: 'notification-popover',
      componentProps: { textLink: text },
      event: e
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

      });

    modal.present();
  }

  close() {
    this.router.navigate(['/store', this.storeId]);
  }
}
