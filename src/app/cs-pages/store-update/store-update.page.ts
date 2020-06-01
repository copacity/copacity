import { Component, OnInit } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoresService } from 'src/app/cs-services/stores.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { SectorsService } from 'src/app/cs-services/sectors.service';
import { StoreCategoriesService } from 'src/app/cs-services/storeCategories.service';
import { Sector, StoreCategory, Store } from 'src/app/app-intefaces';
import { Observable } from 'rxjs';
import { AppService } from 'src/app/cs-services/app.service';

@Component({
  selector: 'app-store-update',
  templateUrl: './store-update.page.html',
  styleUrls: ['./store-update.page.scss'],
})
export class StoreUpdatePage implements OnInit {
  storeCategories: Observable<StoreCategory[]> = null;
  sectors: Observable<Sector[]> = null;
  store: Store;

  form: FormGroup;
  constructor(private popoverCtrl: PopoverController,
    private formBuilder: FormBuilder,
    private storesService: StoresService,
    private appService: AppService,
    public alertController: AlertController,
    private sectorsService: SectorsService,
    private loader: LoaderComponent,
    private storeCategoriesService: StoreCategoriesService) {
     
    this.buildForm();
    this.storeCategories = this.storeCategoriesService.getAll();
    //this.sectors = this.sectorsService.getAll();
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
      name: [this.appService.currentStore.name, [Validators.required, Validators.maxLength(30)]],
      category: [this.appService.currentStore.idStoreCategory, [Validators.required]],
      phone1: [this.appService.currentStore.phone1, [Validators.required, Validators.max(999999999999999)]],
      phone2: [this.appService.currentStore.phone2, [Validators.max(999999999999999)]],
      whatsapp: [this.appService.currentStore.whatsapp, [Validators.max(999999999999999)]],
      facebook: [this.appService.currentStore.facebook, [Validators.maxLength(250)]],
      deliveryPrice: [this.appService.currentStore.deliveryPrice ? this.appService.currentStore.deliveryPrice : 0, [Validators.max(9999999999)]],
      orderMinAmount: [this.appService.currentStore.orderMinAmount ? this.appService.currentStore.orderMinAmount : 0, [Validators.max(9999999999)]],
      address: [this.appService.currentStore.address, [Validators.maxLength(250)]],
      //sector: [this.appService.currentStore.idSector, [Validators.required]],
      description: [this.appService.currentStore.description, [Validators.maxLength(500)]]
    });

    // this.form.valueChanges
    //   .pipe(debounceTime(500))
    //   .subscribe(value => console.log(value));
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
      this.appService.currentStore.deliveryPrice = this.form.value.deliveryPrice ? this.form.value.deliveryPrice : 0;
      this.appService.currentStore.orderMinAmount = this.form.value.orderMinAmount ? this.form.value.orderMinAmount : 0;

      setTimeout(() => {
        this.storesService.update(this.appService.currentStore.id, this.appService.currentStore).then(async (doc) => {
          this.loader.stopLoading();
          this.presentAlert("Tu tienda ha sido actualizada exitosamente!", '', () => this.popoverCtrl.dismiss(true));
        })
          .catch(function (error) {
            console.log(error);
            this.presentAlert("Ha ocurrido un error mientras acutalizabamos tu tienda!", error, () => this.modalCtrl.dismiss(true));
          });
      }, 2000); // Animation Delay
    } else {
      this.form.markAllAsTouched();
    }
  }

  close() {
     
    this.popoverCtrl.dismiss();
  }
}
