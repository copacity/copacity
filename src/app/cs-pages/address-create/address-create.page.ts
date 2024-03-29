import { Component, OnInit } from '@angular/core';
import { AlertController, NavParams, PopoverController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Address } from 'src/app/app-intefaces';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { AddressesService } from 'src/app/cs-services/addresses.service';

@Component({
  selector: 'app-address-create',
  templateUrl: './address-create.page.html',
  styleUrls: ['./address-create.page.scss'],
})
export class AddressCreatePage implements OnInit {
  address: Address = {
    id: '',
    name: '',
    lastName: '',
    phone1: null,
    phone2: null,
    idSector: '',
    country: 'Colombia',
    city: '',
    address: '',
    postalCode: '',
    description: '',
    dateCreated: new Date(),
    lastUpdated: new Date(),
    checked: false,
    deleted: false,
  };

  form: FormGroup;

  constructor(private popoverCtrl: PopoverController,
    public alertController: AlertController,
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private loader: LoaderComponent,
    private addressesService: AddressesService,
    public appService: AppService) {
     
    if (this.navParams.data.id) {
      this.addressesService.getById(this.appService.currentUser.id, this.navParams.data.id).then((address: Address) => {
        this.address = address;
        this.buildForm();
      });
    } 
    
    this.buildForm();
  }

  ngOnInit() {
  }

  close() {
     
    this.popoverCtrl.dismiss();
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

  createAddress() {
     
    if (this.form.valid) {
      this.loader.startLoading("Guardando cambios, por favor espere un momento...");

      setTimeout(() => {
        this.address.name = this.form.value.name;
        this.address.lastName = this.form.value.lastName;
        this.address.phone1 = this.form.value.phone1;
        this.address.phone2 = this.form.value.phone2;
        this.address.country = this.form.value.country;
        this.address.city = this.form.value.city;
        this.address.address = this.form.value.address;
        this.address.postalCode = this.form.value.postalCode;
        this.address.description = this.form.value.description;

        if (this.address.id != '') {
          this.addressesService.update(this.appService.currentUser.id, this.address.id, this.address).then(() => {
            this.loader.stopLoading();
            this.presentAlert("Dirección actualizada exitosamente", "", () => {
              this.popoverCtrl.dismiss();
            });
          });
        } else {
          this.addressesService.create(this.appService.currentUser.id, this.address).then(async (doc) => {
            this.addressesService.update(this.appService.currentUser.id, doc.id, { id: doc.id }).then(() => {
              this.loader.stopLoading();
              this.presentAlert("Dirección creada exitosamente", "", () => {
                this.popoverCtrl.dismiss(doc.id);
              });
            });
          })
            .catch(function (error) {
              console.log(error);
              this.appService.logError({id:'', message: error, idUser: this.appService.currentUser.id?this.appService.currentUser.id:0, dateCreated: new Date()});
              alert(error);
            });
        }
      }, 500);
    } else {
      this.form.markAllAsTouched();
    }
  }

  private buildForm() {
     
    this.form = this.formBuilder.group({
      name: [this.address.name, [Validators.required, Validators.maxLength(50)]],
      lastName: [this.address.lastName, [Validators.required, Validators.maxLength(50)]],
      phone1: [this.address.phone1, [Validators.required, Validators.max(999999999999999)]],
      phone2: [this.address.phone2, [Validators.max(999999999999999)]],
      country: [this.address.country, [Validators.required, Validators.maxLength(50)]],
      city: [this.address.city, [Validators.required, Validators.maxLength(50)]],
      address: [this.address.address, [Validators.required, Validators.maxLength(250)]],
      postalCode: [this.address.postalCode, [Validators.maxLength(50)]],
      description: [this.address.description, [Validators.maxLength(500)]]
    });
  }
}
