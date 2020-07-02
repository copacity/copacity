import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PopoverController, AlertController, NavParams } from '@ionic/angular';
import { ShippingMethod, PaymentMethod } from 'src/app/app-intefaces';
import { PaymentMethodsService } from 'src/app/cs-services/payment-methods.service';
import { Observable } from 'rxjs';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { StoresService } from 'src/app/cs-services/stores.service';
import { AppService } from 'src/app/cs-services/app.service';

@Component({
  selector: 'app-store-shipping-methods-create',
  templateUrl: './store-shipping-methods-create.page.html',
  styleUrls: ['./store-shipping-methods-create.page.scss'],
})
export class StoreShippingMethodsCreatePage implements OnInit {

  form: FormGroup;

  paymentMethods: Observable<PaymentMethod[]>;

  shippingMethod: ShippingMethod = {
    id: '',
    name: '',
    price: null,
    limitDays: null,
    addressRequired: false,
    description: '',
    paymentMethods: null,
    dateCreated: new Date(),
    deleted: false
  }

  constructor(
    public popoverController: PopoverController,
    private paymentMethodsService: PaymentMethodsService,
    public alertController: AlertController,
    private loader: LoaderComponent,
    public appService: AppService,
    private navParams: NavParams,
    private storesService: StoresService,
    private formBuilder: FormBuilder) {

    if (this.navParams.data.shippingMethod) {
      this.shippingMethod = this.navParams.data.shippingMethod;
    }

    this.paymentMethods = this.paymentMethodsService.getAll();
    this.buildForm();
  }
  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [this.shippingMethod.name, [Validators.required, Validators.maxLength(50)]],
      price: [this.shippingMethod.price, [Validators.required]],
      limitDays: [this.shippingMethod.limitDays, [Validators.required]],
      addressRequired: [this.shippingMethod.addressRequired],
      description: [this.shippingMethod.description, [Validators.maxLength(500)]],
      paymentMethods: [this.shippingMethod.paymentMethods, [Validators.required]]
    });
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

  saveChanges() {
    if (this.form.valid) {
      this.loader.startLoading("Procesando metodo de envio, por favor espere un momento...");

      setTimeout(() => {
        this.shippingMethod.name = this.form.value.name;
        this.shippingMethod.limitDays = this.form.value.limitDays;
        this.shippingMethod.price = this.form.value.price;
        this.shippingMethod.addressRequired = this.form.value.addressRequired;
        this.shippingMethod.description = this.form.value.description;
        this.shippingMethod.paymentMethods = this.form.value.paymentMethods;

        if (this.shippingMethod.id) {
          this.storesService.updateShippingMethod(this.appService.currentStore.id, this.shippingMethod.id, this.shippingMethod).then(doc => {
            this.loader.stopLoading();
            this.presentAlert("Metodo de envio actualizado exitosamente", "", () => { });
            this.popoverController.dismiss();
          });
        } else {
          this.storesService.createShippingMethod(this.appService.currentStore.id, this.shippingMethod).then(doc => {
            this.storesService.updateShippingMethod(this.appService.currentStore.id, doc.id, { id: doc.id }).then(doc => {
              this.loader.stopLoading();
              this.presentAlert("Metodo de envio creado exitosamente", "", () => { });
              this.popoverController.dismiss();
            });
          });
        }


      }, 500);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
