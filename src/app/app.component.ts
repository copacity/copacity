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
import { SignupComponent } from './cs-components/signup/signup.component';
import { AskForAccountComponent } from './cs-components/ask-for-account/ask-for-account.component';

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
    public appService: AppService,
    private angularFireAuth: AngularFireAuth,
    private loaderComponent: LoaderComponent,
    public toastController: ToastController,
    public alertController: AlertController
  ) {
    this.initializeApp();
    this.checkUpdate();
    this.changeDarkMode();
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
    this.presentConfirm("Estás seguro que deseas cerrar la sesión?", () => {
      this.loaderComponent.startLoading("Cerrando sesión, por favor espere un momento...")
      setTimeout(() => {
        this.angularFireAuth.auth.signOut();
        this.popoverController.dismiss();
        this.presentToast("Has abandonado la sesión!");
        this.loaderComponent.stopLoading();
      }, 500);
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
      text: 'Hola! Somos copacity.net, tu Centro Comercial Virtual, aquí podrás ver nuestras tiendas con una gran variedad de productos para tí, promociones, cupones con descuentos, también podrás acumular puntos y obtener regalos!',
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
    let text = 'Hola! Somos copacity.net, tu Centro Comercial Virtual, aquí podrás ver nuestras tiendas con una gran variedad de productos para tí, promociones, cupones con descuentos, también podrás acumular puntos y obtener regalos! ' + this.appService._appInfo.domain;

    let modal = await this.popoverController.create({
      component: CopyToClipboardComponent,
      cssClass: 'notification-popover',
      componentProps: { textLink: text },
      event: e
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

      });

    modal.present();
  }

  async SignIn() {
    this.popoverController.dismiss();

    const popover = await this.popoverController.create({
      component: AskForAccountComponent,
      cssClass: 'cs-popovers',
    });

    popover.onDidDismiss()
      .then(async (data) => {
        const result = data['data'];

        this.popoverController.dismiss();
        if (result == 0) {
          const popover2 = await this.popoverController.create({
            component: SignupComponent,
            cssClass: "signin-popover",
          });

          popover2.onDidDismiss()
            .then((data) => {
              const result = data['data'];
            });

          popover2.present();
        } else if (result == 1) {
          const popover3 = await this.popoverController.create({
            component: SigninComponent,
            cssClass: "signin-popover",
          });

          popover3.onDidDismiss()
            .then((data) => {
              const result = data['data'];
            });

          popover3.present();
        }
      });

    popover.present();
  }

  changeDarkMode() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    //this.updateTheme(prefersDark);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.updateTheme(e);
    });
  }

  updateTheme(element){
    if (element.matches) {
      document.body.classList.add("dark")
      document.body.classList.add("theme-dark")

      document.body.classList.remove("light")
      document.body.classList.remove("theme-light")

      this.eraseCookie('Eazy_light_mode'); 
      this.createCookie('Eazy_dark_mode', true, 1);
    } else {
      document.body.classList.remove("dark")
      document.body.classList.remove("theme-dark")

      document.body.classList.add("light")
      document.body.classList.add("theme-light")

      this.eraseCookie('Eazy_dark_mode'); 
      this.createCookie('Eazy_light_mode', true, 1);
    }
  }

  createCookie(e, t, n) { if (n) { var o: any = new Date; o.setTime(o.getTime() + 48 * n * 60 * 60 * 1e3); var r = "; expires=" + o.toGMTString() } else var r = ""; document.cookie = e + "=" + t + r + "; path=/" }
  eraseCookie(e) { this.createCookie(e, "", -1) }
}