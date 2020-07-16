import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/cs-services/app.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { PlatformFee, Order, StoreCoupon } from 'src/app/app-intefaces';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { OrdersService } from 'src/app/cs-services/orders.service';
import { CartService } from 'src/app/cs-services/cart.service';

@Component({
  selector: 'app-store-billing',
  templateUrl: './store-billing.page.html',
  styleUrls: ['./store-billing.page.scss'],
})
export class StoreBillingPage implements OnInit {
  form: FormGroup;
  billingDate: any;
  minDate: any;
  maxDate: any;
  years: string = "";
  platformFee: PlatformFee;
  sales = 0;
  commissionForSale: number = 0;
  platformUse: number;
  saving: number;
  iva: number;
  total: number;

  vendorsQuantity: number;
  vendorsPrice: number;

  couponsQuantity: number;
  couponsPrice: number;

  productsQuantity: number;
  productsPrice: number;

  constructor(
    public popoverController: PopoverController,
    private orderService: OrdersService,
    private formBuilder: FormBuilder,
    private storesService: StoresService,
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

    let subs = this.storesService.getPlatformFess(this.appService.currentStore.id).subscribe(pfArray => {
      pfArray.forEach(pf => {
        this.platformFee = pf;
      });

      subs.unsubscribe();
    });
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
    }).catch(err => alert(err));
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
          resolve(orderResult);

          subs2.unsubscribe;
        });

        subs.unsubscribe();
      });
    }).catch(err => alert(err));
  }

  generate() {
    if (this.form.valid) {
      this.loaderComponent.startLoading("Generando Factura, este proceso podría tardar algunos minutos. por favor espere.");
      setTimeout(() => {
        this.billingDate = this.form.value.billingDate;
        this.calculateOrdersTotalByMonth(this.billingDate).then((result: number) => {
          this.platformUse = (this.platformFee.platformUseDiscount == 0) ? this.platformFee.platformUse : (this.platformFee.platformUse - (this.platformFee.platformUse * (this.platformFee.platformUseDiscount / 100)));

          this.sales = result;
          this.commissionForSale = result * (this.platformFee.commissionForSale / 100);
          this.saving = (this.platformFee.platformUse * (this.platformFee.platformUseDiscount / 100));

          this.vendorsQuantity = this.appService.currentStore.vendorsLimit - 3;
          this.vendorsPrice = (this.platformFee ? this.platformFee.additionalVendor : 0) * this.vendorsQuantity;

          this.couponsQuantity = this.appService.currentStore.couponsLimit - 5;
          this.couponsPrice = (this.platformFee ? this.platformFee.additionalCoupon : 0) * this.couponsQuantity;

          this.productsQuantity = this.appService.currentStore.productsLimit - 100;
          this.productsPrice = (this.platformFee ? this.platformFee.additionalProduct : 0) * this.productsQuantity;

          this.total = this.platformUse + this.vendorsPrice + this.couponsPrice + this.productsPrice + this.commissionForSale;
          this.iva = this.total * (this.appService._appInfo.tax / 100);

          this.loaderComponent.stopLoading();
        });
      }, 1000);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
