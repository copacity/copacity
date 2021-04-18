import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, PopoverController } from '@ionic/angular';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { AppService } from 'src/app/cs-services/app.service';
import { StoresService } from 'src/app/cs-services/stores.service';

@Component({
  selector: 'app-store-update-category',
  templateUrl: './store-update-category.page.html',
  styleUrls: ['./store-update-category.page.scss'],
})
export class StoreUpdateCategoryPage implements OnInit {

  form: FormGroup;
  constructor(private popoverCtrl: PopoverController,
    private formBuilder: FormBuilder,
    private storesService: StoresService,
    private appService: AppService,
    public alertController: AlertController,
    private loader: LoaderComponent) {

    this.buildForm();
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
      description: [this.appService.currentStore.description, [Validators.maxLength(500)]],
    });
  }

  updateStore() {

    if (this.form.valid) {
      this.loader.startLoading("Estamos actualizando su catgoria por favor espere un momento...");

      this.appService.currentStore.name = this.form.value.name;
      this.appService.currentStore.description = this.form.value.description;

      setTimeout(() => {
        this.storesService.update(this.appService.currentStore.id, this.appService.currentStore).then(async (doc) => {
          this.loader.stopLoading();
          this.presentAlert("Tu categoria ha sido actualizada exitosamente!", '', () => this.popoverCtrl.dismiss(true));
        })
          .catch(function (error) {
            console.log(error);
            this.presentAlert("Ha ocurrido un error mientras acutalizabamos tu categoria!", error, () => this.modalCtrl.dismiss(true));
            this.appService.logError({id:'', message: error, function:'updateStore', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
          });
      }, 500); // Animation Delay
    } else {
      this.form.markAllAsTouched();
    }
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
}
