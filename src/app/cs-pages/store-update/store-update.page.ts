import { Component, OnInit } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoresService } from 'src/app/cs-services/stores.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { StoreCategoriesService } from 'src/app/cs-services/storeCategories.service';
import { Sector, StoreCategory, Store, ShippingMethod } from 'src/app/app-intefaces';
import { Observable } from 'rxjs';
import { AppService } from 'src/app/cs-services/app.service';
import { StoreShippingMethodsCreatePage } from '../store-shipping-methods-create/store-shipping-methods-create.page';

@Component({
  selector: 'app-store-update',
  templateUrl: './store-update.page.html',
  styleUrls: ['./store-update.page.scss'],
})
export class StoreUpdatePage implements OnInit {
  storeCategories: Observable<StoreCategory[]> = null;
  shippingMethods: Observable<ShippingMethod[]> = null;
  store: Store;

  form: FormGroup;
  constructor(private popoverCtrl: PopoverController,
    private formBuilder: FormBuilder,
    private storesService: StoresService,
    private appService: AppService,
    public alertController: AlertController,
    private loader: LoaderComponent,
    private storeCategoriesService: StoreCategoriesService) {

    this.buildForm();
    this.shippingMethods = this.storesService.getShippingMethods(this.appService.currentStore.id);
    this.storeCategories = this.storeCategoriesService.getAll();
    this.store = this.appService.currentStore;
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
      name: [this.appService.currentStore.name, [Validators.required, Validators.maxLength(50)]],
      category: [this.appService.currentStore.idStoreCategory, [Validators.required]],
      phone1: [this.appService.currentStore.phone1, [Validators.required, Validators.max(999999999999999)]],
      phone2: [this.appService.currentStore.phone2, [Validators.max(999999999999999)]],
      whatsapp: [this.appService.currentStore.whatsapp, [Validators.max(999999999999999)]],
      facebook: [this.appService.currentStore.facebook, [Validators.maxLength(250)]],
      //deliveryPrice: [this.appService.currentStore.deliveryPrice ? this.appService.currentStore.deliveryPrice : 0, [Validators.max(9999999999)]],
      orderMinAmount: [this.appService.currentStore.orderMinAmount ? this.appService.currentStore.orderMinAmount : 0, [Validators.max(9999999999)]],
      address: [this.appService.currentStore.address, [Validators.maxLength(250)]],
      description: [this.appService.currentStore.description, [Validators.maxLength(500)]]
    });
  }

  updateStore() {

    if (this.form.valid) {
      this.loader.startLoading("Estamos actualizando su tienda por favor espere un momento...");

      this.appService.currentStore.name = this.form.value.name;
      this.appService.currentStore.phone1 = this.form.value.phone1 ? this.form.value.phone1 : 0;
      this.appService.currentStore.phone2 = this.form.value.phone2 ? this.form.value.phone2 : 0;
      this.appService.currentStore.whatsapp = this.form.value.whatsapp ? this.form.value.whatsapp : 0;
      this.appService.currentStore.facebook = this.form.value.facebook;
      this.appService.currentStore.address = this.form.value.address;
      //this.appService.currentStore.idSector = this.form.value.sector;
      this.appService.currentStore.idStoreCategory = this.form.value.category;
      this.appService.currentStore.description = this.form.value.description;
      this.appService.currentStore.deliveryPrice = 0;
      this.appService.currentStore.orderMinAmount = this.form.value.orderMinAmount ? this.form.value.orderMinAmount : 0;

      setTimeout(() => {
        this.storesService.update(this.appService.currentStore.id, this.appService.currentStore).then(async (doc) => {
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
      this.storesService.updateShippingMethod(this.appService.currentStore.id, shippingMethod.id, { deleted: true }).then(doc => {
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
