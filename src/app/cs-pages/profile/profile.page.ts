import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from 'src/app/cs-services/app.service';
import { LocationStrategy } from '@angular/common';
import { AddressListPage } from '../address-list/address-list.page';
import { PopoverController, AlertController, ToastController } from '@ionic/angular';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { StorageService } from 'src/app/cs-services/storage.service';
import { UsersService } from 'src/app/cs-services/users.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { ProfileUpdatePage } from '../profile-update/profile-update.page';
import { CropperImageComponent } from 'src/app/cs-components/cropper-image/cropper-image.component';
import { File } from 'src/app/app-intefaces';
import { Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('sliderProfile', null) slider: any;
  file: File;
  public imagePath;

  constructor(
    public appService: AppService,
    public toastController: ToastController,
    public router: Router,
    private angularFireAuth: AngularFireAuth,
    private popoverCtrl: PopoverController,
    public popoverController: PopoverController,
    private storageService: StorageService,
    private usersService: UsersService,
    private ngNavigatorShareService: NgNavigatorShareService,
    public alertController: AlertController,
    private locationStrategy: LocationStrategy,
    private loaderComponent: LoaderComponent,
  ) {

    history.pushState(null, null, window.location.href);
    this.locationStrategy.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  ngOnInit() {
  }

  close() {
    this.router.navigate(["/home"]);
  }

  async openAddressListPage() {

    let modal = await this.popoverCtrl.create({
      component: AddressListPage,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
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

  async openCropperImageComponent(imageUrl: any) {

    let modal = await this.popoverController.create({
      component: CropperImageComponent,
      cssClass: 'cs-popovers',
      componentProps: { image: imageUrl },
      backdropDismiss: false
    });

    modal.onDidDismiss()
      .then((data) => {
        const image = data['data'];
        if (image) {
          this.loaderComponent.startLoading("Actualizando imagen, por favor espere un momento...");
          setTimeout(() => {
            this.storageService.ResizeImage(image, this.appService.currentUser.id, 500, 500).then((url) => {
              this.usersService.update(this.appService.currentUser.id, { photoUrl: url }).then(result => {
                this.appService.currentUser.photoUrl = url.toString();
                this.loaderComponent.stopLoading();
                this.presentAlert("Tu foto ha sido actualizada exitosamente!", "", () => { });
              });
            });
          }, 2000);
        }
      });

    modal.present();
  }

  async uploadFileProfile(event: any) {
    this.file = {
      file: '',
      downloadURL: null,
      filePath: ''
    };

    this.file.file = event.target.files[0];

    var mimeType = this.file.file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.presentAlert("Solo se admiten imagenes", "", () => { });
      return;
    }

    var reader = new FileReader();
    this.imagePath = event.target.files;
    reader.readAsDataURL(this.file.file);
    reader.onload = (_event) => {
      this.storageService.ResizeImage2(reader.result.toString(), this.appService.currentUser.id, 500, 500).then((image) => {
        this.openCropperImageComponent(image);
      });
    }
  }

  takePictureProfile() {

    this.storageService.takePhoto(this.appService.currentUser.id, 500, 500).then((url) => {
      this.loaderComponent.startLoading("Actualizando foto, por favor espere un momento...");
      this.usersService.update(this.appService.currentUser.id, { photoUrl: url }).then(result => {
        this.appService.currentUser.photoUrl = url.toString();
        this.presentAlert("Tu foto ha sido actualizada exitosamente!", "", () => { });
      });
    });
  }

  async openProfileUpdatePage() {

    let modal = await this.popoverCtrl.create({
      component: ProfileUpdatePage,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
      });

    modal.present();
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

  doRefresh(event) {
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async SignIn() {
    const popover = await this.popoverController.create({
      component: SigninComponent,
      cssClass: "signin-popover",
    });
    return await popover.present();
  }

  
  signOut() {
    this.presentConfirm("Estas seguro que deseas cerrar la sesion?", () => {
      this.loaderComponent.startLoading("Cerrando Sesion, por favor espere un momento...")
      setTimeout(() => {
        this.angularFireAuth.auth.signOut();
        this.popoverController.dismiss();
        this.presentToast("Has abandonado la sesión!", null);
        this.loaderComponent.stopLoading();
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

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       SLIDER VALIDATIONS

  ionViewDidEnter() {
    try { this.slider.startAutoplay(); } catch (error) { }
  }

  shareApp(e) {
    this.ngNavigatorShareService.share({
      title: "COPACITY",
      text: 'Hola ingresa a copacity.net y podrás buscar tiendas en Copacabana, comprar productos y recibirlos a domicilio!',
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
    let text = 'Hola ingresa a copacity.net, y podrás buscar tiendas en Copacabana, comprar productos y recibirlos a domicilio! ' + this.appService._appInfo.domain;

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
}