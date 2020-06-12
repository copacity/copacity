import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, PopoverController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { UsersService } from 'src/app/cs-services/users.service';

@Component({
  selector: 'app-profile-update',
  templateUrl: './profile-update.page.html',
  styleUrls: ['./profile-update.page.scss'],
})
export class ProfileUpdatePage implements OnInit {

  form: FormGroup;
  
  constructor(private popoverCtrl: PopoverController, 
    public alertController: AlertController,
    private formBuilder: FormBuilder,
    public appService: AppService,
    private usersSerevice: UsersService,
    private loaderComponent: LoaderComponent) { 
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
      name: [this.appService.currentUser.name, [Validators.required, Validators.maxLength(30)]],
      phone1: [this.appService.currentUser.phone1, [Validators.max(999999999999999)]],
      phone2: [this.appService.currentUser.phone2, [Validators.max(999999999999999)]],
      whatsapp: [this.appService.currentUser.whatsapp, [Validators.max(999999999999999)]]
    });
  }

  updateUser() {
     
    if (this.form.valid) {
      this.loaderComponent.startLoading("Estamos actualizando su tienda por favor espere un momento...");

      this.appService.currentUser.name = this.form.value.name;
      this.appService.currentUser.phone1 = this.form.value.phone1 ? this.form.value.phone1 : 0;
      this.appService.currentUser.phone2 = this.form.value.phone2 ? this.form.value.phone2 : 0;
      this.appService.currentUser.whatsapp = this.form.value.whatsapp ? this.form.value.whatsapp : 0;

      setTimeout(() => {
        this.usersSerevice.update(this.appService.currentUser.id, this.appService.currentUser).then(async (doc) => {
          this.loaderComponent.stopLoading();
          this.presentAlert("Tu perfil ha sido actualizado exitosamente!", '', () => this.popoverCtrl.dismiss(true));
        })
          .catch(function (error) {
            console.log(error);
            this.presentAlert("Ha ocurrido un error mientras acutalizabamos tu perfil!", error, () => this.popoverCtrl.dismiss(true));
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
