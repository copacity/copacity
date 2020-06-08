import { Component, OnInit, ViewChild } from '@angular/core';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { PopoverController, AlertController, ToastController } from '@ionic/angular';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { AppService } from 'src/app/cs-services/app.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { AppMessage } from 'src/app/app-intefaces';
import { Location, LocationStrategy } from '@angular/common';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  @ViewChild('sliderContact', null) slider: any;

  appMessage: AppMessage = {
    id: '',
    idUser: '',
    title: '',
    message: '',
    deleted: false,
    dateCreated: new Date()
  };

  form: FormGroup;

  constructor(
    private ngNavigatorShareService: NgNavigatorShareService,
    public popoverController: PopoverController,
    private formBuilder: FormBuilder,
    private loader: LoaderComponent,
    private router: Router,
    public toastController: ToastController,
    private angularFireAuth: AngularFireAuth,
    public alertController: AlertController,
    public appService: AppService,
    private locationStrategy: LocationStrategy,
    public location: Location) {

    history.pushState(null, null, window.location.href);
    this.locationStrategy.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

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

  async SignIn() {
    const popover = await this.popoverController.create({
      component: SigninComponent,
      cssClass: "signin-popover",
    });
    return await popover.present();
  }

  close() {
    this.router.navigate(['/home']);
  }

  async presentMenuUser(e) {
    const popover = await this.popoverController.create({
      component: MenuUserComponent,
      animated: false,
      showBackdrop: true,
      mode: 'ios',
      translucent: false,
      event: e
    });

    return await popover.present();
  }

  async presentMenuNotifications(e) {
    const popover = await this.popoverController.create({
      component: MenuNotificationsComponent,
      animated: false,
      showBackdrop: true,
      mode: 'ios',
      translucent: false,
      event: e,
      cssClass: 'notification-popover'
    });

    return await popover.present();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      message: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  signOut() {
    this.presentConfirm("Estas seguro que deseas cerrar la sesion?", () => {
      this.loader.startLoading("Cerrando Sesion, por favor espere un momento...")
      setTimeout(() => {
        this.angularFireAuth.auth.signOut();
        this.popoverController.dismiss();
        this.presentToast("Has abandonado la sesión!", null);
        this.loader.stopLoading();
      }, 2000);
    });
  }

  async presentToast(message: string, image: string) {
    const toast = await this.toastController.create({
      duration: 3000,
      message: message,
      position: 'bottom',
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

  shareApp(e) {
    this.ngNavigatorShareService.share({
      title: "COPACITY",
      text: 'Hola ingresa a copacity.net donde podrás ver nuestras marcas autorizadas con variedad de productos para ti, promociones, cupones con descuentos, tambien puedes acumular puntos y obtener regalos, todo te lo llevamos hasta la puerta de tu casa!',
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
    let text = 'Hola ingresa a copacity.net donde podrás ver nuestras marcas autorizadas con variedad de productos para ti, promociones, cupones con descuentos, tambien puedes acumular puntos y obtener regalos, todo te lo llevamos hasta la puerta de tu casa! ' + this.appService._appInfo.domain;

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

  sendMessage() {
    if (this.appService.currentUser) {
      if (this.form.valid) {
        this.loader.startLoading("Enviando mensaje por favor espere un momento...");
        setTimeout(() => {

          this.appMessage.idUser = this.appService.currentUser.id;
          this.appMessage.title = this.form.value.title;
          this.appMessage.message = this.form.value.title;

          this.appService.createAppMessage(this.appMessage).then(result => {
            this.loader.stopLoading();
            this.presentAlert("Mensaje enviado exitosamente", () => { });
            this.buildForm();
          });
        }, 2000);
      } else {
        this.form.markAllAsTouched();
      }
    } else {
      this.SignIn();
    }
  }

  doRefresh(event) {
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       SLIDER VALIDATIONS

  ionViewDidEnter() {
    try { this.slider.startAutoplay(); } catch (error) { }
  }
}
