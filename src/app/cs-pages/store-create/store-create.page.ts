import { Component, OnInit, Input } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { StoreCategory, Sector, Store, PlatformFee } from 'src/app/app-intefaces';
import { Validators, FormGroup, FormBuilder } from '@angular/forms'
import { StoresService } from 'src/app/cs-services/stores.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { AppService } from 'src/app/cs-services/app.service';
import { StoreStatus } from 'src/app/app-enums';
import { UsersService } from 'src/app/cs-services/users.service';

@Component({
  selector: 'app-store-create',
  templateUrl: './store-create.page.html',
  styleUrls: ['./store-create.page.scss'],
})
export class StoreCreatePage implements OnInit {
  storeCategories: Observable<StoreCategory[]> = null;
  sectors: Observable<Sector[]> = null;

  form: FormGroup;

  constructor(
    private popoverCtrl: PopoverController,
    private formBuilder: FormBuilder,
    private appService: AppService,
    public alertController: AlertController,
    private storesService: StoresService,
    private loader: LoaderComponent,
    private usersService: UsersService
  ) {

    this.buildForm();
    this.storeCategories = this.appService.storeCategories;
    this.sectors = this.appService.sectors;
  }

  ngOnInit() {

  }

  async presentAlert(message: string, done: Function) {

    const alert = await this.alertController.create({
      header: message,
      mode: 'ios',
      translucent: true,
      animated: true,
      backdropDismiss: false,
      buttons: ['Aceptar!']
    });

    alert.onDidDismiss().then(done());
    await alert.present();
  }

  close() {

    this.popoverCtrl.dismiss();
  }

  private buildForm() {

    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      category: ['', [Validators.required]],
      phone1: ['', [Validators.required, Validators.max(999999999999999)]],
      phone2: ['', [Validators.max(999999999999999)]],
      whatsapp: ['', [Validators.max(999999999999999)]],
      facebook: ['', [Validators.maxLength(250)]],
      //sector: ['', [Validators.required]],
      address: ['', [Validators.maxLength(250)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  save(e: Event) {

    e.preventDefault();
    this.createStore();
  }

  createStore() {

    if (this.form.valid) {
      this.loader.startLoading("Estamos creando su tienda por favor espere un momento...");

      setTimeout(() => {

        let newStore: Store =
        {
          id: '',
          idUser: this.appService.currentUser.id,
          address: this.form.value.address,
          deleted: false,
          logo: '',
          phone1: this.form.value.phone1 ? this.form.value.phone1 : 0,
          phone2: this.form.value.phone2 ? this.form.value.phone2 : 0,
          whatsapp: this.form.value.whatsapp ? this.form.value.whatsapp : 0,
          facebook: this.form.value.facebook,
          lastUpdated: new Date(),
          dateCreated: new Date(),
          name: this.form.value.name,
          idSector:'',  //this.form.value.sector,
          idStoreCategory: this.form.value.category,
          description: this.form.value.description,
          status: StoreStatus.Created,
          visits: 0,
          deliveryPrice: 0,
          orderMinAmount: 0,
          productsCount: 0,
          productsLimit: 100,
          couponsLimit: 5,
          vendorsLimit: 3
        }

        this.storesService.create(newStore).then(async (doc) => {

          let platformFee: PlatformFee = {  
            id: '',
            additionalCoupon:0,
            additionalProduct:0,
            additionalVendor:0,
            platformUse:0,
            platformUseDiscount:0,
            commissionForSale:0
            };

          this.storesService.createPlatformFess(doc.id, platformFee).then(async () => {
            this.storesService.update(doc.id, { id: doc.id }).then(() => {
              this.usersService.update(this.appService.currentUser.id, { isAdmin: true }).then(() => {
                this.loader.stopLoading();
                this.presentAlert("Tienda creada exitosamente", () => {
                  this.appService._userStoreId = doc.id;
                  this.appService.currentUser.isAdmin = true;
                  this.popoverCtrl.dismiss(doc.id);
                });
              });
            });
          });
        })
          .catch(function (error) {
            console.log(error);
            alert(error);
          });
      }, 500); // Animation Delay
    } else {
      this.form.markAllAsTouched();
    }
  }
}
