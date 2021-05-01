import { Component, OnInit, ViewChild } from '@angular/core';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { PopoverController, AlertController, ToastController } from '@ionic/angular';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { AppService } from 'src/app/cs-services/app.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { PQRSF } from 'src/app/app-intefaces';
import { Location } from '@angular/common';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { Router } from '@angular/router';
import { StoresService } from 'src/app/cs-services/stores.service';
import { SignupComponent } from 'src/app/cs-components/signup/signup.component';
import { AskForAccountComponent } from 'src/app/cs-components/ask-for-account/ask-for-account.component';
import { MenuService } from 'src/app/cs-services/menu.service';
import { CartManagerService } from 'src/app/cs-services/cart-manager.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  @ViewChild('sliderContact', null) slider: any;

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
    private ngNavigatorShareService: NgNavigatorShareService,
    public popoverController: PopoverController,
    private formBuilder: FormBuilder,
    private loader: LoaderComponent,
    private router: Router,
    public menuService: MenuService,
    private storesService: StoresService,
    public toastController: ToastController,
    public cartManagerService: CartManagerService,
    public alertController: AlertController,
    public appService: AppService,
    public location: Location) {

    // history.pushState(null, null, window.location.href);
    // this.locationStrategy.onPopState(() => {
    //   history.pushState(null, null, window.location.href);
    // });

    this.buildForm();
    this.appService.loadCustomScript();
  }

  ngOnInit() {
  }

  back() {
    window.history.back();
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

  close() {
    this.router.navigate(['/home']);
  }

  // getStores() {
  //   this.storesService.getAll('').then(stores => {
  //     stores.forEach((store: Store) => {
  //       this.stores.push(store);
  //     });
  //   });
  // }

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
      idType: ['-1', [Validators.required]],
      userName: ['', [Validators.required]],
      userEmail: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.maxLength(500)]]
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

  sendMessage() {
    if (this.appService.currentUser) {
      if (this.form.valid) {
        this.loader.startLoading("Enviando mensaje por favor espere un momento...");
        setTimeout(() => {

          this.pqrsf.idUser = "";
          this.pqrsf.userName = this.form.value.userName;
          this.pqrsf.userPhotoUrl = "";
          this.pqrsf.userEmail = this.appService.currentUser.email;
          this.pqrsf.userPhone = "";
          this.pqrsf.idStore = "";
          this.pqrsf.idType = this.form.value.idType;
          this.pqrsf.message = this.form.value.message;

          this.storesService.createPQRSF(this.pqrsf).then(result => {
            this.loader.stopLoading();
            this.presentAlert("Mensaje enviado exitosamente", () => { });
            this.buildForm();
          });
        }, 500);
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
    }, 500);
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       SLIDER VALIDATIONS

  ionViewDidEnter() {
    try { this.slider.startAutoplay(); } catch (error) { }
  }
}
