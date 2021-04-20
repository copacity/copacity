import { Component, OnInit, Input } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { StoreCategory, Category, PlatformFee } from 'src/app/app-intefaces';
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
  //storeCategories: Observable<StoreCategory[]> = null;
  //sectors: Observable<Sector[]> = null;

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

        let newStore: Category =
        {
          id: '',
          deleted: false,
          logo: '',
          thumb_logo: '',
          lastUpdated: new Date(),
          dateCreated: new Date(),
          name: this.form.value.name,
          description: this.form.value.description,
          status: StoreStatus.Published,
        }

        this.storesService.create(newStore).then(async (doc) => {

          let platformFee: PlatformFee = {
            id: '',
            additionalCoupon: 5000,
            additionalProduct: 1000,
            additionalVendor: 5000,
            platformUse: 19900,
            platformUseDiscount: 0,
            commissionForSale: 10
          };

          this.storesService.createPlatformFess(platformFee).then(async () => {
            this.storesService.update(doc.id, { id: doc.id }).then(() => {
              this.usersService.update(this.appService.currentUser.id, { isAdmin: true }).then(() => {
                this.loader.stopLoading();
                this.presentAlert("Tienda creada exitosamente", () => {
                  //this.appService._userStoreId = doc.id;
                  this.appService.currentUser.isAdmin = true;
                  this.popoverCtrl.dismiss(doc.id);
                });
              });
            });
          });
        }).catch(err => {
          alert(err);
          this.appService.logError({ id: '', message: err, function: 'createStore', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
        });
      }, 500); // Animation Delay
    } else {
      this.form.markAllAsTouched();
    }
  }
}
