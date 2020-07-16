import { Component, OnInit } from '@angular/core';
import { PopoverController, AlertController } from '@ionic/angular';
import { PQRSF } from 'src/app/app-intefaces';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AppService } from 'src/app/cs-services/app.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';

@Component({
  selector: 'app-store-pqrsf-create',
  templateUrl: './store-pqrsf-create.page.html',
  styleUrls: ['./store-pqrsf-create.page.scss'],
})
export class StorePqrsfCreatePage implements OnInit {
  pqrsf: PQRSF = {
    id: '',
    idUser: '',
    userName: '',
    userPhotoUrl: '',
    userEmail: '',
    userPhone: '',
    idStore: '',
    idType: '',
    message: '',
    deleted: false,
    dateCreated: new Date()
  };

  form: FormGroup;

  constructor(
    public popoverController: PopoverController,
    public appService: AppService,
    private loader: LoaderComponent,
    public alertController: AlertController,
    private storesService: StoresService,
    private formBuilder: FormBuilder, ) {
    this.buildForm();
  }

  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      idType: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.maxLength(500)]]
    });
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

  sendMessage() {
    if (this.form.valid) {
      this.loader.startLoading("Enviando mensaje por favor espere un momento...");
      setTimeout(() => {

        this.pqrsf.idUser = this.appService.currentUser.id;
        this.pqrsf.userName = this.appService.currentUser.name;
        this.pqrsf.userPhotoUrl = this.appService.currentUser.photoUrl;
        this.pqrsf.userEmail = this.appService.currentUser.email;
        this.pqrsf.userPhone = this.appService.currentUser.phone1.toString();
        this.pqrsf.idStore = this.appService.currentStore.id;
        this.pqrsf.idType = this.form.value.idType;
        this.pqrsf.message = this.form.value.message;

        this.storesService.createPQRSF(this.appService.currentStore.id, this.pqrsf).then(result => {
          this.loader.stopLoading();
          this.presentAlert("Mensaje enviado exitosamente", () => { });
          this.popoverController.dismiss();
        });
      }, 500);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
