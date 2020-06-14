import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from 'src/app/cs-services/app.service';
import { Store, Order, CartProduct, Notification } from 'src/app/app-intefaces';
import { CartService } from 'src/app/cs-services/cart.service';
import { OrdersService } from 'src/app/cs-services/orders.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { SuperTabs } from '@ionic-super-tabs/angular';
import { OrderStatus, NotificationTypes, NotificationStatus } from 'src/app/app-enums';
import { AlertController, PopoverController, ToastController } from '@ionic/angular';
import { AddressListPage } from '../address-list/address-list.page';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { Location } from '@angular/common';
import { NotificationsService } from 'src/app/cs-services/notifications.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-order-create',
  templateUrl: './order-create.page.html',
  styleUrls: ['./order-create.page.scss'],
})
export class OrderCreatePage implements OnInit {
  messageToStore: FormControl;
  store: Store;
  cart: CartProduct[]

  @ViewChild(SuperTabs, { static: false }) superTabs: SuperTabs;

  constructor(public appService: AppService,
    public alertController: AlertController,
    public cartService: CartService,
    private ngNavigatorShareService: NgNavigatorShareService,
    public popoverController: PopoverController,
    private loaderComponent: LoaderComponent,
    private ordersService: OrdersService,
    private popoverCtrl: PopoverController,
    public toastController: ToastController,
    private angularFireAuth: AngularFireAuth,
    private notificationsService: NotificationsService,
    public location: Location) {

    // history.pushState(null, null, window.location.href);
    // this.locationStrategy.onPopState(() => {
    //   history.pushState(null, null, window.location.href);
    // });


    this.store = this.appService.currentStore;
    this.cart = this.cartService.getCart();

    this.messageToStore = new FormControl('', [Validators.maxLength(500)]);
  }

  ngOnInit() {

  }

  async SignIn() {
    const popover = await this.popoverController.create({
      component: SigninComponent,
      cssClass: "signin-popover",
    });
    return await popover.present();
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

  shareApp(e) {
    this.ngNavigatorShareService.share({
      title: "COPACITY",
      text: 'Hola! Somos copacity.net, tu Centro Comercial Virtual, allí podrás ver nuestras tiendas con una gran variedad de productos para tí, promociones, cupones con descuentos, tambien podrás acumular puntos y obtener regalos, y lo mejor!, todo te lo llevamos hasta la puerta de tu casa!',
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
    let text = 'Hola! Somos copacity.net, tu Centro Comercial Virtual, allí podrás ver nuestras tiendas con una gran variedad de productos para tí, promociones, cupones con descuentos, tambien podrás acumular puntos y obtener regalos, y lo mejor!, todo te lo llevamos hasta la puerta de tu casa! ' + this.appService._appInfo.domain;

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

  async presentToast(message: string, image: string) {
    const toast = await this.toastController.create({
      duration: 3000,
      message: message,
      position: 'bottom',
    });
    toast.present();
  }

  selectTab(index: number){
    this.superTabs.selectTab(index)
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

  sendOrder() {
    if (this.messageToStore.valid) {
      if (this.appService.currentUser) {
        if (this.appService.addressChecked) {

          this.loaderComponent.startLoading("Enviando Pedido, por favor espere un momento...")

          setTimeout(() => {
            let order: Order = {
              id: '',
              ref: new Date().getTime(),
              deleted: false,
              idStore: this.appService.currentStore.id,
              idUser: this.appService.currentUser.id,
              lastUpdated: new Date(),
              dateCreated: new Date(),
              status: OrderStatus.Pending,
              photoUrl: this.appService.currentUser.photoUrl,
              userName: this.appService.currentUser.name,
              message: this.messageToStore.value,
              messageRejected: ''
            }

            let notification: Notification = {
              type: NotificationTypes.OrderCreated,
              id: '',
              description: '',
              deleted: false,
              idStore: this.appService.currentStore.id,
              dateCreated: new Date(),
              status: NotificationStatus.Created,
              idUser: this.appService.currentUser.id,
              photoUrl: this.appService.currentUser.photoUrl,
              userName: this.appService.currentUser.name,
              idOrder: '',
              idUserNotification: this.appService.currentStore.idUser
            }

            // 1. Create Order
            this.ordersService.create(this.appService.currentStore.id, order).then(doc => {
              // 2. Udpate Id field into Orders collection
              this.ordersService.update(this.appService.currentStore.id, doc.id, { id: doc.id }).then(result => {
                // 3. Added checked address into Addresses sub-collection into order
                this.ordersService.createOrderAddress(this.appService.currentStore.id, doc.id, this.appService.addressChecked).then(result => {
                  notification.description = "Ha realizado un nuevo pedido en " + this.appService.currentStore.name;
                  notification.idOrder = doc.id;

                  this.notificationsService.create(this.appService.currentStore.idUser, notification).then(result => {
                    // 5. Added cart Products into cartProducts sub-collection into order
                    this.addCartProducts(doc.id, 0).then(result => {
                      if (result) {
                        this.loaderComponent.stopLoading();
                        this.cartService.clearCart();
                        this.presentAlert("El pedido ha sido enviado a la tienda exitosamente! Tu numero de pedido es: " + order.ref, "", () => {
                          this.location.back();
                        });
                      }
                    });
                  });
                });
              });
            });
          }, 2000);
        } else {
          this.presentAlert("Debes seleccionar una direccion antes de enviar el pedido", "", () => { }, 'Entendido!');
        }
      } else {
        this.SignIn();
      }
    } else {
      this.messageToStore.markAllAsTouched();
    }
  }

  async presentAlert(title: string, message: string, done: Function, buttonOkName?: string) {

    const alert = await this.alertController.create({
      header: title,
      message: message,
      mode: 'ios',
      translucent: true,
      animated: true,
      backdropDismiss: false,
      buttons: [buttonOkName ? buttonOkName : 'Aceptar!']
    });

    alert.onDidDismiss().then(() => done());
    await alert.present();
  }

  addCartProducts(idOrder: string, index: number) {

    return new Promise(resolve => {
      let addToCart = (index: number) => {
        if (this.cart.length == index) {
          resolve(true);
        }
        else {
          this.ordersService.addCartProduct(this.appService.currentStore.id, idOrder, this.cart[index]).then(() => {
            addToCart(++index);
          });
        }
      };

      addToCart(index);
    });
  }

  close() {
    this.location.back();
  }
}
