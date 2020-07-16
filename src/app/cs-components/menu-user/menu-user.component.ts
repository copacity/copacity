import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/cs-services/app.service';
import { SigninComponent } from '../signin/signin.component';
import { PopoverController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-menu-user',
  templateUrl: './menu-user.component.html',
  styleUrls: ['./menu-user.component.scss'],
})
export class MenuUserComponent implements OnInit {

  constructor(
    public router: Router,
    private angularFireAuth: AngularFireAuth,
    private alertController: AlertController,
    public appService: AppService,
    private loaderComponent: LoaderComponent,
    public toastController: ToastController,
    public popoverController: PopoverController) { }

  ngOnInit() { }

  async SignIn() {
    this.popoverController.dismiss();

    const popover = await this.popoverController.create({
      component: SigninComponent,
      cssClass: "signin-popover",
    });
    return await popover.present();
  }

  signOut() {
    this.presentConfirm("Estas seguro que deseas cerrar la sesión?", () => {
      this.loaderComponent.startLoading("Cerrando sesión, por favor espere un momento...")
      setTimeout(() => {
        this.angularFireAuth.auth.signOut();
        this.popoverController.dismiss();
        this.presentToast("Has abandonado la sesión!");
        this.loaderComponent.stopLoading();
      }, 500);
    });
  }

  goToUserProfile() {
    this.router.navigate(['profile/']);
    this.popoverController.dismiss();
  }

  goToUserStore() {
    this.router.navigate(['store/' + this.appService._userStoreId]);
    this.popoverController.dismiss();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      buttons: ['Cerrar']
    });
    toast.present();
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
