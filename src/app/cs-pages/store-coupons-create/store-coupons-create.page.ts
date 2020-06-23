import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, AlertController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StoreCoupon } from 'src/app/app-intefaces';
import { AppService } from 'src/app/cs-services/app.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';

@Component({
  selector: 'app-store-coupons-create',
  templateUrl: './store-coupons-create.page.html',
  styleUrls: ['./store-coupons-create.page.scss'],
})
export class StoreCouponsCreatePage implements OnInit {
  form: FormGroup;
  minDate: string;
  editDate: Date;
  years: string;

  storeCoupon: StoreCoupon = {
    id: '',
    idStore: this.appService.currentStore.id,
    name: '',
    discount: null,
    minAmount: null,
    quantity: 1,
    isVIP: false,
    dateExpiration: new Date(),
    lastUpdated: new Date(),
    dateCreated: new Date(),
    deleted: false
  }

  constructor(
    public popoverController: PopoverController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private loader: LoaderComponent,
    public appService: AppService,
    private storesService: StoresService,
    private navParams: NavParams) {

    if (this.navParams.data.storeCoupon) {
      this.storeCoupon = this.navParams.data.storeCoupon;
    }

    this.buildDate();
    this.buildForm();
  }

  buildDate() {
    let date = this.storeCoupon.dateExpiration;

    if (this.navParams.data.storeCoupon) {
      let test: any;
      test = this.storeCoupon.dateExpiration;
      date = test.toDate(); //new Date(this.storeCoupon.dateExpiration);
    }

    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = date.getFullYear();
    this.minDate = yyyy + '-' + mm + '-' + dd;
    this.editDate = new Date(yyyy + '/' + mm + '/' + dd);
  }

  getYears(): string {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    let years = [];
    for (let i = yyyy; i <= (yyyy + 5); i++) {
      years.push(i);
    }

    return years.join();
  }

  ngOnInit() {

  }

  private buildForm() {

    // let today = new Date();
    // let dd = String(today.getDate()).padStart(2, '0');
    // let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    // let yyyy = today.getFullYear();

    // if (this.storeCoupon.dateExpiration) {
    //   dd = String(this.storeCoupon.dateExpiration.getDate()).padStart(2, '0');
    //   mm = String(this.storeCoupon.dateExpiration.getMonth() + 1).padStart(2, '0'); //January is 0!
    //   yyyy = this.storeCoupon.dateExpiration.getFullYear();
    // }

    // this.editDate = yyyy + '-' + mm + '-' + dd;

    this.form = this.formBuilder.group({
      name: [this.storeCoupon.name, [Validators.required, Validators.maxLength(50)]],
      discount: [this.storeCoupon.discount, [Validators.required]],
      minAmount: [this.storeCoupon.minAmount, [Validators.required]],
      quantity: [this.storeCoupon.quantity, [Validators.required, Validators.min(1), Validators.max(50)]],
      dateExpiration: [this.editDate],
      isVIP: [this.storeCoupon.isVIP],
    });
  }

  close() {
    this.popoverController.dismiss();
  }

  getNumbers(from: number, to: number, ) {

    let numbers = [];

    for (let i = from; i <= to; i++) {
      numbers.push(i);
    }

    return numbers;
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

  saveStoreCoupon() {
    if (this.form.valid) {
      
      this.storeCoupon.name = this.form.value.name;
      this.storeCoupon.discount = this.form.value.discount;
      this.storeCoupon.isVIP = this.form.value.isVIP;
      this.storeCoupon.minAmount = this.form.value.minAmount;

      //this.storeCoupon.dateExpiration = this.form.value.dateExpiration;

      this.storeCoupon.quantity = this.form.value.quantity;

      if (this.navParams.data.storeCoupon) {
        this.loader.startLoading("Actualizando cupon, por favor espere un moento");
        this.storesService.updateStoreCoupon(this.appService.currentStore.id, this.storeCoupon.id, this.storeCoupon).then(() => {
          this.storesService.updateStoreCoupon(this.appService.currentStore.id, this.storeCoupon.id, { dateExpiration: new Date(this.form.value.dateExpiration) }).then(() => {
            this.loader.stopLoading();
            this.presentAlert("Cupon actualizado exitosamente", "", () => {
              this.popoverController.dismiss();
            });
          });
        });
      } else {
        this.loader.startLoading("Creando cupon, por favor espere un moento");
        this.storesService.createStoreCoupon(this.appService.currentStore.id, this.storeCoupon).then(() => {
          this.loader.stopLoading();
          this.presentAlert("Cupon creado exitosamente", "", () => {
            this.popoverController.dismiss();
          });
        });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
