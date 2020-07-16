import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from 'src/app/cs-services/app.service';
import { PopoverController, AlertController, ToastController } from '@ionic/angular';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { Observable } from 'rxjs';
import { Notification } from '../../app-intefaces'
import { NotificationsService } from 'src/app/cs-services/notifications.service';
import { OrderDetailPage } from '../order-detail/order-detail.page';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { Router } from '@angular/router';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-notifications-history',
  templateUrl: './notifications-history.page.html',
  styleUrls: ['./notifications-history.page.scss'],
})
export class NotificationsHistoryPage implements OnInit {
  @ViewChild('sliderNotifications', null) slider: any;
  userId: string;

  notifications: Observable<Notification[]>;

  constructor(
    private router: Router,
    public appService: AppService,
    public alertController: AlertController,
    private loaderComponent: LoaderComponent,
    public toastController: ToastController,
    private angularFireAuth: AngularFireAuth,
    private notificationsService: NotificationsService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private popoverController: PopoverController
  ) {
    this.angularFireAuth.auth.onAuthStateChanged(user => {

      if (!user) {
        this.router.navigate(['/home']);
      } else {
        this.userId = user.uid;
        this.appService.setuserCredential(user.uid);
        this.getNotifications(user.uid);
      }
    });
  }

  ngOnInit() { }

  getNotifications(idUser: any) {
    this.notifications = this.notificationsService.getGetAllByUser(idUser);
  }

  async openOrderDetailPage(notification: Notification) {

    let modal = await this.popoverController.create({
      component: OrderDetailPage,
      componentProps: { id: notification.idOrder, idStore: notification.idStore },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
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

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------    Share APP

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
        this.presentToast("Has abandonado la sesión!", null);
        this.loaderComponent.stopLoading();
      }, 500);
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

  async openImageViewer(img: string) {
    let images: string[] = [];
    images.push(img);

    let modal = await this.popoverController.create({
      component: ImageViewerComponent,
      componentProps: { images: images },
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
      });

    modal.present();
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

  doRefresh(event) {
    setTimeout(() => {
      this.getNotifications(this.userId);
      event.target.complete();
    }, 500);
  }

  // loadMoreNotifications(event) {
  //   if (this.lastToken != ((this.notifications && this.notifications.length != 0) ? this.notifications[this.notifications.length - 1].dateCreated : null || this.lastToken == null)) {
  //     this.getNotifications();
  //   }

  //   event.target.complete();
  // }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       SLIDER VALIDATIONS

  ionViewDidEnter() {
    try { this.slider.startAutoplay(); } catch (error) { }
  }
}
