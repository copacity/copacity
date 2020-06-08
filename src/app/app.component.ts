import { Component } from '@angular/core';
import { Platform, PopoverController, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SwUpdate } from '@angular/service-worker';
import { AlertController } from '@ionic/angular';
import { AppService } from './cs-services/app.service';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SigninComponent } from './cs-components/signin/signin.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderComponent } from './cs-components/loader/loader.component';
import { CopyToClipboardComponent } from './cs-components/copy-to-clipboard/copy-to-clipboard.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private ngNavigatorShareService: NgNavigatorShareService,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private swUpdate: SwUpdate,
    public popoverController: PopoverController,
    public appService:AppService,
    private angularFireAuth: AngularFireAuth,
    private loaderComponent: LoaderComponent,
    public toastController: ToastController,
    public alertController: AlertController
  ) {
    this.initializeApp();  
    this.checkUpdate(); 
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();      
    });
  }

  checkUpdate() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(async () => {
          window.location.reload();
      });
    }
  }

  signOut() {
    this.presentConfirm("Estas seguro que deseas cerrar la sesion?", () => {
      this.loaderComponent.startLoading("Cerrando Sesion, por favor espere un momento...")
      setTimeout(() => {
        this.angularFireAuth.auth.signOut();
        this.popoverController.dismiss();
        this.presentToast("Has abandonado la sesión!");
        this.loaderComponent.stopLoading();
      }, 2000);
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
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

    alert.onDidDismiss().then(() => done());
    await alert.present();
  }

  
  shareApp(e) {
    this.ngNavigatorShareService.share({
      title: "COPACITY",
      text: 'Hola! Somos copacity.net, tu Centro Comercial Virtual, allí podrás ver nuestras marcas autorizadas con una gran variedad de productos para tí, promociones, cupones con descuentos, tambien podrás acumular puntos y obtener regalos, y lo mejor!, todo te lo llevamos hasta la puerta de tu casa!',
      url: this.appService._appInfo.domain
    }).then((response) => {
      console.log(response);
    })
      .catch((error) => {
        console.log(error);

        if (error.error.toString().indexOf("not supported") != -1) {
          this.openCopyToClipBoard(e);
        }
      });
  }

  async openCopyToClipBoard(e) {
    let text = 'Hola! Somos copacity.net, tu Centro Comercial Virtual, allí podrás ver nuestras marcas autorizadas con una gran variedad de productos para tí, promociones, cupones con descuentos, tambien podrás acumular puntos y obtener regalos, y lo mejor!, todo te lo llevamos hasta la puerta de tu casa! ' + this.appService._appInfo.domain;

    let modal = await this.popoverController.create({
      component: CopyToClipboardComponent,
      cssClass: 'notification-popover',
      componentProps: { textLink:  text},
      event: e
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

      });

    modal.present();
  }

  async SignIn() {
    const popover = await this.popoverController.create({
      component: SigninComponent,
      cssClass: "signin-popover",
    });
    return await popover.present();
  }
}