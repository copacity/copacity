import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NavParams, PopoverController, AlertController } from '@ionic/angular';
import { StoresService } from 'src/app/cs-services/stores.service';
import { AppService } from 'src/app/cs-services/app.service';
import { VendorStatus } from 'src/app/app-enums';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';

@Component({
  selector: 'app-store-vendors-update',
  templateUrl: './store-vendors-update.page.html',
  styleUrls: ['./store-vendors-update.page.scss'],
})
export class StoreVendorsUpdatePage implements OnInit {
  form: FormGroup;
  active: boolean;
  vendorName: string;

  constructor(
    private popoverController: PopoverController,
    public alertController: AlertController,
    private navParams: NavParams,
    private loaderComponent: LoaderComponent,
    public appService: AppService,
    private storesService: StoresService,
    private formBuilder: FormBuilder) {

    this.vendorName = this.navParams.data.vendor.user.name;
    this.active = this.navParams.data.vendor.vendor.active;
    this.buildForm();
  }

  ngOnInit() {

  }

  close() {
    this.popoverController.dismiss();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      commissionForSale: [this.navParams.data.vendor.vendor.commissionForSale.toString(), [Validators.required]],
      active: [this.navParams.data.vendor.vendor.active]
    });
  }

  getNumbers() {
    let numbers = [];

    for (let i = 0; i <= 100; i++) {
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

  confirmVendor() {
    if (this.form.valid) {
      this.loaderComponent.startLoading("Confirmando vendedor, por favor espere un momento...");
      setTimeout(() => {
        this.storesService.updateVendor(this.appService.currentStore.id, this.navParams.data.vendor.vendor.id, { status: VendorStatus.Confirmed, active: this.form.value.active, commissionForSale: this.form.value.commissionForSale }).then(() => {
          this.loaderComponent.stopLoading();
          this.presentAlert("Vendedor confirmado exitosamente!", '', () => { 
            this.popoverController.dismiss(true);
          });
        });
      }, 1000);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
