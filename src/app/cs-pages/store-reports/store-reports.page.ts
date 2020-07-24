import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { OrdersService } from 'src/app/cs-services/orders.service';

import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { AppService } from 'src/app/cs-services/app.service';
import { Order, StoreCoupon } from 'src/app/app-intefaces';
import { CartService } from 'src/app/cs-services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-store-reports',
  templateUrl: './store-reports.page.html',
  styleUrls: ['./store-reports.page.scss'],
})
export class StoreReportsPage implements OnInit {
  form: FormGroup;
  billingDate: any;
  minDate: any;
  maxDate: any;
  years: string = "";

  sales = 0;
  iva: number;
  total: number;
  commissionForSale: number = 0;
  ordersDetail: any[] = [];

  constructor(
    private router: Router,
    public popoverController: PopoverController,
    private orderService: OrdersService,
    private formBuilder: FormBuilder,
    private loaderComponent: LoaderComponent,
    public appService: AppService,
  ) {

    let storeCreated: any = this.appService.currentStore.dateCreated;
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

  calculateOrdersTotalByMonth(_month: string) {
    let month: any = new Date(_month);
    let endMonth = (new Date(month.setMonth(month.getMonth() + 1)).getMonth().toString() == '0') ? "12" : new Date(month.setMonth(month.getMonth() + 1)).getMonth().toString();

    let startDate = new Date(month.getFullYear().toString() + '/' + new Date(_month).getMonth().toString() + '/01');
    let endDate = new Date(month.getFullYear().toString() + '/' + endMonth + '/01');

    return new Promise((resolve, reject) => {
      let subs = this.orderService.getByDateRange(this.appService.currentStore.id, startDate, endDate
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

  getOrderTotal(order: Order) {
    return new Promise((resolve, reject) => {
      let subs = this.orderService.getCartProducts(this.appService.currentStore.id, order.id).subscribe(cartProducts => {
        let subs2 = this.orderService.getOrderCoupons(this.appService.currentStore.id, order.id).subscribe(orderCoupons => {

          let coupon: StoreCoupon;
          orderCoupons.forEach(_coupon => {
            coupon = _coupon;
          });

          let cartService = new CartService(this.appService);
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
      this.loaderComponent.startLoading("Generando Reporte, este proceso podría tardar algunos minutos. por favor espere.");
      setTimeout(() => {
        this.billingDate = this.form.value.billingDate;
        this.calculateOrdersTotalByMonth(this.billingDate).then((result: number) => {
          this.sales = result;
          this.total = this.sales;
          this.iva = this.total * (this.appService._appInfo.tax / 100);

          this.loaderComponent.stopLoading();
        });
      }, 1000);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
