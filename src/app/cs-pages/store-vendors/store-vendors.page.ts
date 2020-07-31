import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProfileUpdatePage } from '../profile-update/profile-update.page';
import { Vendor, User, StoreCoupon, Order } from 'src/app/app-intefaces';
import { AppService } from 'src/app/cs-services/app.service';
import { VendorStatus } from 'src/app/app-enums';
import { StoresService } from 'src/app/cs-services/stores.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { CartService } from 'src/app/cs-services/cart.service';
import { UsersService } from 'src/app/cs-services/users.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrdersService } from 'src/app/cs-services/orders.service';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-store-vendors',
  templateUrl: './store-vendors.page.html',
  styleUrls: ['./store-vendors.page.scss'],
})
export class StoreVendorsPage implements OnInit {
  commissionForSale: number = 0;
  total: number = 0;
  form: FormGroup;
  billingDate: any;
  minDate: any;
  maxDate: any;
  years: string = "";
  ordersDetail: any[] = [];

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
    private orderService: OrdersService,
    private usersService: UsersService,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    public alertController: AlertController,
    private loaderComponent: LoaderComponent,
    public router: Router) {

      this.loaderComponent.startLoading("Cargando...");
    this.usersService.getById(this.navParams.data.idUser).then((user: User) => {
      this.user = user;
      let subs = this.storesService.getVendorsByIdUser(this.appService.currentStore.id, user.id).subscribe(result => {
        result.forEach(vendor => {
          this.vendor = vendor;

          let storeCreated: any = this.vendor.dateCreated;
          storeCreated = storeCreated.toDate();

          // min date
          let dd = String(storeCreated.getDay()).padStart(2, '0');
          let mm = String(storeCreated.getMonth() + 1).padStart(2, '0'); //January is 0!
          let yyyy = storeCreated.getFullYear();
          this.minDate = yyyy + '-' + mm + '-' + dd;

          // max date
          let date = new Date();
          dd = String(date.getDate()).padStart(2, '0');
          mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
          yyyy = date.getFullYear();
          this.maxDate = yyyy + '-' + mm + '-' + dd;

        });

        this.loaderComponent.stopLoading();
        subs.unsubscribe();
      });
    });

    this.buildForm();
  }

  ngOnInit() {

  }

  private buildForm() {
    this.form = this.formBuilder.group({
      billingDate: [this.billingDate, [Validators.required]],
    });
  }

  close() {
    this.popoverController.dismiss();
  }

  async openOrderDetailPage(orderDetail: any) {
    this.router.navigate(['order-detail/' + orderDetail.idOrder + "&" + this.appService.currentStore.id]);

    // let modal = await this.popoverController.create({
    //   component: OrderDetailPage,
    //   componentProps: { id: orderDetail.idOrder, idStore: this.appService.currentStore.id },
    //   cssClass: 'cs-popovers'
    // });

    // modal.onDidDismiss()
    //   .then((data) => {
    //     const updated = data['data'];
    //   });

    // modal.present();
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
    this.loaderComponent.startLoading("Enviando Solicitud para revisión. Gracias");

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

  calculateOrdersTotalByMonth(_month: string) {
    let month: any = new Date(_month);
    let endMonth = (new Date(month.setMonth(month.getMonth() + 1)).getMonth().toString() == '0') ? "12" : new Date(month.setMonth(month.getMonth() + 1)).getMonth().toString();

    let startDate = new Date(month.getFullYear().toString() + '/' + new Date(_month).getMonth().toString() + '/01');
    let endDate = new Date(month.getFullYear().toString() + '/' + endMonth + '/01');

    return new Promise((resolve, reject) => {
      let subs = this.orderService.getByDateRangeAndIdVendor(this.appService.currentStore.id, this.vendor.idUser, startDate, endDate
      ).subscribe(result => {
        let orderCaculatePromises = [];

        result.forEach(order => {
          orderCaculatePromises.push(this.getOrderTotal(order));
        });

        Promise.all(orderCaculatePromises).then(totals => {
          this.commissionForSale = 0;
          totals.forEach(orderTotal => {
            this.commissionForSale += orderTotal;
          });

          resolve(this.commissionForSale);
        });

        subs.unsubscribe();
      });
    }).catch(err => {
      alert(err);
      this.appService.logError({id:'', message: err, function:'calculateOrdersTotalByMonth', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  getOrderTotal(order: Order) {
    return new Promise((resolve, reject) => {
      let subs = this.orderService.getCartProducts(this.appService.currentStore.id, order.id).subscribe(cartProducts => {
        let subs2 = this.orderService.getOrderCoupons(this.appService.currentStore.id, order.id).subscribe(orderCoupons => {

          let coupon: StoreCoupon;
          orderCoupons.forEach(_coupon => {
            coupon = _coupon;
          });

          let cartService = new CartService();
          cartService.setCart(cartProducts);

          let totalValue = cartService.getTotalDetail(0);
          let orderResult = totalValue - (coupon ? (totalValue * (coupon.discount / 100)) : 0);

          this.ordersDetail.push({ idOrder: order.id, ref: order.ref, value: orderResult });
          resolve(orderResult);

          subs2.unsubscribe;
        });

        subs.unsubscribe();
      });
    }).catch(err => {
      alert(err);
      this.appService.logError({id:'', message: err, function:'getOrderTotal', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  generate() {
    if (this.form.valid) {
      this.loaderComponent.startLoading("Calculando comisión, este proceso podría tardar algunos minutos. por favor espere.");
      setTimeout(() => {
        this.billingDate = this.form.value.billingDate;
        this.calculateOrdersTotalByMonth(this.billingDate).then((result: number) => {
          
          this.total = result;
          this.commissionForSale = result * (this.vendor.commissionForSale / 100);
          this.loaderComponent.stopLoading();
        });
      }, 1000);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
