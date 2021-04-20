import { Component, OnInit } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoresService } from 'src/app/cs-services/stores.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { ShippingMethod } from 'src/app/app-intefaces';
import { Observable } from 'rxjs';
import { AppService } from 'src/app/cs-services/app.service';
import { StoreShippingMethodsCreatePage } from '../store-shipping-methods-create/store-shipping-methods-create.page';

@Component({
  selector: 'app-store-update',
  templateUrl: './store-update.page.html',
  styleUrls: ['./store-update.page.scss'],
})
export class StoreUpdatePage implements OnInit {
  shippingMethods: Observable<ShippingMethod[]> = null;

  form: FormGroup;
  constructor(private popoverCtrl: PopoverController,
    private formBuilder: FormBuilder,
    private storesService: StoresService,
    private appService: AppService,
    public alertController: AlertController,
    private loader: LoaderComponent) {

    this.buildForm();
    this.shippingMethods = this.storesService.getShippingMethods();
  }

  ngOnInit() {

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

  private buildForm() {

    this.form = this.formBuilder.group({
      name1: [this.appService._appInfo.name1, [Validators.required, Validators.maxLength(50)]],
      name2: [this.appService._appInfo.name2, [Validators.maxLength(50)]],
      homeTitle: [this.appService._appInfo.homeTitle, [Validators.required, Validators.maxLength(20)]],
      phone: [this.appService._appInfo.phone, [Validators.required, Validators.max(999999999999999)]],
      whatsapp: [this.appService._appInfo.whatsapp, [Validators.max(999999999999999)]],
      facebook: [this.appService._appInfo.facebook, [Validators.maxLength(250)]],
      instagram: [this.appService._appInfo.instagram, [Validators.maxLength(250)]],
      orderMinAmount: [this.appService._appInfo.orderMinAmount ? this.appService._appInfo.orderMinAmount : 0, [Validators.max(9999999999)]],
      address: [this.appService._appInfo.address, [Validators.maxLength(250)]],
      video1: [this.appService._appInfo.video1, [Validators.maxLength(250)]],
      video2: [this.appService._appInfo.video2, [Validators.maxLength(250)]],
      video3: [this.appService._appInfo.video3, [Validators.maxLength(250)]],
      description: [this.appService._appInfo.description, [Validators.maxLength(500)]],
    });
  }

  updateStore() {

    if (this.form.valid) {
      this.loader.startLoading("Estamos actualizando su tienda por favor espere un momento...");

      this.appService._appInfo.name1 = this.form.value.name1;
      this.appService._appInfo.name2 = this.form.value.name2;
      this.appService._appInfo.homeTitle = this.form.value.homeTitle;
      this.appService._appInfo.phone = this.form.value.phone ? this.form.value.phone : 0;
      this.appService._appInfo.whatsapp = this.form.value.whatsapp ? this.form.value.whatsapp : 0;
      this.appService._appInfo.facebook = this.form.value.facebook;
      this.appService._appInfo.instagram = this.form.value.instagram;
      this.appService._appInfo.video1 = this.form.value.video1;
      this.appService._appInfo.video2 = this.form.value.video2;
      this.appService._appInfo.video3 = this.form.value.video3;
      this.appService._appInfo.address = this.form.value.address;
      this.appService._appInfo.description = this.form.value.description;
      this.appService._appInfo.orderMinAmount = this.form.value.orderMinAmount;

      setTimeout(() => {
        this.appService.updateAppInfo().then(async (doc) => {
          this.loader.stopLoading();
          this.presentAlert("Tu tienda ha sido actualizada exitosamente!", '', () => this.popoverCtrl.dismiss(true));
        })
          .catch(function (error) {
            console.log(error);
            this.presentAlert("Ha ocurrido un error mientras acutalizabamos tu tienda!", error, () => this.modalCtrl.dismiss(true));
            this.appService.logError({id:'', message: error, function:'updateStore', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
          });
      }, 500); // Animation Delay
    } else {
      this.form.markAllAsTouched();
    }
  }

  async openStoreShippingMethodsCreatePage() {
    let modal = await this.popoverCtrl.create({
      component: StoreShippingMethodsCreatePage,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
  }

  close() {

    this.popoverCtrl.dismiss();
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

  shippingMethodDelete(shippingMethod: ShippingMethod) {
    this.presentConfirm('Esta seguro que desea eliminar el metodo de envío: ' + shippingMethod.name + '?', () => {
      this.storesService.updateShippingMethod(shippingMethod.id, { deleted: true }).then(doc => {
        this.loader.stopLoading();
        this.presentAlert("Metodo de envío eliminado exitosamente", "", () => { });
      });
    });
  }

  async shippingMethodUpdate(shippingMethod: ShippingMethod) {
    let modal = await this.popoverCtrl.create({
      component: StoreShippingMethodsCreatePage,
      cssClass: 'cs-popovers',
      componentProps: { shippingMethod: shippingMethod },
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
  }
}