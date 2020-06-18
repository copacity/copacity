import { Component, OnInit } from '@angular/core';
import { NavParams, AlertController, PopoverController } from '@ionic/angular';
import { Order, CartProduct, User, Address, Notification, Store, StorePoint } from 'src/app/app-intefaces';
import { OrdersService } from 'src/app/cs-services/orders.service';
import { AppService } from 'src/app/cs-services/app.service';
import { Observable } from 'rxjs';
import { OrderStatus, NotificationTypes, NotificationStatus } from 'src/app/app-enums';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { UsersService } from 'src/app/cs-services/users.service';
import { NotificationsService } from 'src/app/cs-services/notifications.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { PopoverMessageComponent } from 'src/app/cs-components/popover-message/popover-message.component';
import { CartService } from 'src/app/cs-services/cart.service';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss']
})
export class OrderDetailPage implements OnInit {
  store: Store;
  order: Order;
  cartProducts: Observable<CartProduct[]>;
  addresses: Observable<Address[]>;
  total: number;
  discount: number;
  user: User;

  constructor(private popoverCtrl: PopoverController,
    private navParams: NavParams,
    public cartService: CartService,
    private notificationsService: NotificationsService,
    private loaderCOmponent: LoaderComponent,
    public alertController: AlertController,
    private usersService: UsersService,
    private ordersService: OrdersService,
    private storesService: StoresService,
    public appService: AppService) {

    this.storesService.getById(this.navParams.data.idStore).then(result => {
      this.store = result;
      this.ordersService.getById(this.store.id, this.navParams.data.id).then((orderResult: Order) => {
        this.usersService.getById(orderResult.idUser).then(result => {
          this.user = result;
        });

        this.order = orderResult;
        this.cartProducts = this.ordersService.getCartProducts(this.store.id, this.navParams.data.id);
        this.addresses = this.ordersService.getAddresses(this.store.id, this.navParams.data.id);

        this.cartProducts.subscribe((cartP) => {
          this.cartService.setCart(cartP);
        });
      });
    });
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

  close() {

    this.popoverCtrl.dismiss();
  }

  getTotal() {
    return this.total + (this.store && this.store.deliveryPrice ? this.store.deliveryPrice : 0) - this.discount;
  }

  async openMessage(event: any) {

    let modal = await this.popoverCtrl.create({
      component: PopoverMessageComponent,
      cssClass: 'cs-popovers',
      componentProps: { title: 'Motivo de rechazo', message: '' },
    });

    modal.onDidDismiss()
      .then((data) => {
        const message = data['data'];

        if (message != undefined) {
          this.reject(message);
        }
      });

    modal.present();
  }

  async openMessageSendToClient(event: any) {

    let modal = await this.popoverCtrl.create({
      component: PopoverMessageComponent,
      cssClass: 'cs-popovers',
      componentProps: { title: 'Notificacion para el cliente', message: 'Gracias por comprar en nuestra tienda' },
    });

    modal.onDidDismiss()
      .then((data) => {
        const message = data['data'];

        if (message != undefined) {
          this.sendToClient(message);
        }
      });

    modal.present();
  }

  getSubTotal() {
    return this.total;
  }

  getDiscount() {
    return this.discount;
  }

  checkProduct(event, cartProduct: CartProduct) {
    this.ordersService.updateCartProduct(this.store.id, this.order.id, cartProduct.id, { checked: event.target.checked })
  }

  async openImageViewer(img: string) {
    let images: string[] = [];
    images.push(img);

    let modal = await this.popoverCtrl.create({
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

  sendToClient(message: string) {
    let notification: Notification = {
      type: NotificationTypes.OrderCreated,
      id: '',
      description: '',
      deleted: false,
      idStore: this.store.id,
      dateCreated: new Date(),
      status: NotificationStatus.Created,
      idUser: this.appService.currentUser.id,
      photoUrl: this.store.logo,
      userName: this.store.name,
      idOrder: '',
      idUserNotification: this.order.idUser
    }

    this.loaderCOmponent.startLoading("Confirmando pedido, por favor espere un momento...")
    setTimeout(() => {
      this.ordersService.update(this.store.id, this.order.id, { status: OrderStatus.Sent, lastUpdated: new Date() }).then(result => {
        this.addPoints().then(points => {

          if (points > 0) {
            notification.description = "Tu pedido fue confirmado. Ganaste " + points + " Puntos!. " + message;
          } else {
            notification.description = "Tu pedido fue confirmado! " + message;
          }

          notification.idOrder = this.order.id;
          this.notificationsService.create(this.order.idUser, notification).then(result => {
            this.notificationsService.getGetByIdOrder(this.appService.currentUser.id, this.order.id).subscribe(result => {
              result.forEach(notification => {
                this.notificationsService.update(this.appService.currentUser.id, notification.id, { status: NotificationStatus.Readed });
              });
            });

            this.loaderCOmponent.stopLoading();
            this.presentAlert("El pedido ha sido confirmado exitosamente", "", () => {
              this.cartService.clearCart();
              this.popoverCtrl.dismiss(true);
            });
          });
        });
      });
    }, 2000);
  }

  revertPoints() {
    return new Promise(resolve => {
      let subscribe = this.usersService.getStorePoints(this.user.id).subscribe(StorePoints => {

        let hasPoints = false;
        StorePoints.forEach(storePoint => {
          if (storePoint.idStore === this.store.id) {
            let points = storePoint.points + this.cartService.getPoints();
            this.usersService.updateStorePoint(this.user.id, storePoint.id, { points: points }).then(() => {
              resolve();
            });
          }
        });

        if (!hasPoints) {
          resolve();
        }

        subscribe.unsubscribe();
      });
    });
  }

  addPoints() {
    return new Promise(resolve => {
      let total = this.cartService.getTotalDetail(this.store.deliveryPrice);
      let points = total / 500;

      let subscribe = this.usersService.getStorePoints(this.user.id).subscribe(StorePoints => {
        let hasStorepoints: boolean = false;

        let currentStorePoint: StorePoint = {
          id: '',
          idStore: this.store.id,
          points: 0,
          deleted: false,
          dateCreated: new Date(),
          lastUpdated: new Date(),
        };

        StorePoints.forEach(storePoint => {
          if (storePoint.idStore === this.store.id) {
            currentStorePoint = storePoint
            hasStorepoints = true;
          }
        });

        if (hasStorepoints) {
          this.usersService.updateStorePoint(this.user.id, currentStorePoint.id, { points: currentStorePoint.points + points }).then(() => {
            resolve(points);
          });
        } else {
          currentStorePoint.points = currentStorePoint.points + points;
          this.usersService.createStorePoint(this.user.id, currentStorePoint).then(() => {
            resolve(points);
          });
        }

        subscribe.unsubscribe();
      });
    });
  }

  reject(message: string) {
    let notification: Notification = {
      type: NotificationTypes.OrderCreated,
      id: '',
      description: '',
      deleted: false,
      idStore: this.store.id,
      dateCreated: new Date(),
      status: NotificationStatus.Created,
      idUser: this.appService.currentUser.id,
      photoUrl: this.store.logo,
      userName: this.store.name,
      idOrder: '',
      idUserNotification: this.order.idUser,
    }

    this.loaderCOmponent.startLoading("Cancelando pedido, por favor espere un momento...")
    setTimeout(() => {
      this.ordersService.update(this.store.id, this.order.id, { status: OrderStatus.Cancelled, lastUpdated: new Date(), messageRejected: message }).then(result => {
        notification.description = "Lo sentimos, tu pedido fue cancelado.";
        notification.idOrder = this.order.id;
        this.notificationsService.create(this.order.idUser, notification).then(result => {
          this.revertPoints().then(() => {
            this.notificationsService.getGetByIdOrder(this.appService.currentUser.id, this.order.id).subscribe(result => {
              result.forEach(notification => {
                this.notificationsService.update(this.appService.currentUser.id, notification.id, { status: NotificationStatus.Readed });
              });
            });

            this.loaderCOmponent.stopLoading();
            this.presentAlert("El pedido ha sido CANCELADO exitosamente", "", () => {
              this.cartService.clearCart();
              this.popoverCtrl.dismiss(true);
            });
          });
        });
      });
    }, 2000);
  }
}
