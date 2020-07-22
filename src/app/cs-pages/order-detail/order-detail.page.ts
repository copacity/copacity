import { Component, OnInit } from '@angular/core';
import { AlertController, PopoverController, ToastController } from '@ionic/angular';
import { Order, CartProduct, User, Address, Notification, Store, StorePoint, StoreCoupon, ShippingMethod, PaymentMethod } from 'src/app/app-intefaces';
import { OrdersService } from 'src/app/cs-services/orders.service';
import { AppService } from 'src/app/cs-services/app.service';
import { Observable } from 'rxjs';
import { OrderStatus, NotificationTypes, NotificationStatus, StoreStatus } from 'src/app/app-enums';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { UsersService } from 'src/app/cs-services/users.service';
import { NotificationsService } from 'src/app/cs-services/notifications.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { PopoverMessageComponent } from 'src/app/cs-components/popover-message/popover-message.component';
import { CartService } from 'src/app/cs-services/cart.service';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { ProductsService } from 'src/app/cs-services/products.service';
import { PaymentMethodsService } from 'src/app/cs-services/payment-methods.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Location } from '@angular/common';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss']
})
export class OrderDetailPage implements OnInit {
  isAdmin: boolean;
  store: Store;
  order: Order;
  cartProducts: Observable<CartProduct[]>;
  storeCoupon: StoreCoupon;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  addresses: Observable<Address[]>;
  total: number;
  discount: number;
  vendorName: string;
  user: User;

  constructor(private popoverCtrl: PopoverController,
    private router: Router,
    private route: ActivatedRoute,
    public location: Location,
    public cartService: CartService,
    private notificationsService: NotificationsService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private loaderComponent: LoaderComponent,
    private paymentMethodsService: PaymentMethodsService,
    public toastController: ToastController,
    private loaderCOmponent: LoaderComponent,
    private productsService: ProductsService,
    public alertController: AlertController,
    private usersService: UsersService,
    private ordersService: OrdersService,
    private angularFireAuth: AngularFireAuth,
    private storesService: StoresService,
    public appService: AppService) {

    this.angularFireAuth.auth.onAuthStateChanged(user => {
      this.initialize(user);
    });

    this.initialize();
  }

  initialize(user?: any) {
    let orderId = this.route.snapshot.params.id.toString().split("&")[0];
    let storeId = this.route.snapshot.params.id.toString().split("&")[1];
    this.storesService.getById(storeId).then(result => {
      this.store = result;
      this.ordersService.getById(this.store.id, orderId).then((orderResult: Order) => {
        this.usersService.getById(orderResult.idUser).then(result => {
          this.user = result;
        });

        this.order = orderResult;
        this.cartProducts = this.ordersService.getCartProducts(this.store.id, this.order.id);
        this.addresses = this.ordersService.getAddresses(this.store.id, this.order.id);

        // Get Coupon
        this.storeCoupon = null;
        let subs = this.ordersService.getOrderCoupons(this.store.id, this.order.id).subscribe(orderCoupons => {
          orderCoupons.forEach(coupon => {
            this.storeCoupon = coupon;
          });

          subs.unsubscribe;
        });

        // Get shipping method
        this.shippingMethod = null;
        let subs1 = this.ordersService.getOrderShippingMethods(this.store.id, this.order.id).subscribe(sm => {
          sm.forEach(shippingMethod => {
            this.shippingMethod = shippingMethod;
          });

          subs1.unsubscribe;
        });

        // Get PaymentMethod
        this.paymentMethodsService.getById(this.order.idPaymentMethod).then((result: PaymentMethod) => {
          this.paymentMethod = result;
        });

        this.cartProducts.subscribe((cartP) => {
          this.cartService.setCart(cartP);
        });

        if (this.order.idVendor == "1") {
          this.vendorName = "Compra directa sin asesor";
        } else {
          this.usersService.getById(this.order.idVendor).then((_user: User) => {
            this.vendorName = _user.name;
          });
        }

        if (this.appService.currentUser && this.store.idUser == this.appService.currentUser.id) {
          this.isAdmin = true;
        } else {
          if (this.appService.currentUser && this.order.idUser == this.appService.currentUser.id) {
            this.isAdmin = false;
          } else {
            this.router.navigate(['/store', this.store.id]);
          }
        }

        if (this.store.status != StoreStatus.Published) {
          if (!this.isAdmin) {
            this.router.navigate(['/home']);
          }
        }
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

  async SignIn() {
    const popover = await this.popoverCtrl.create({
      component: SigninComponent,
      cssClass: "signin-popover",
    });
    return await popover.present();
  }

  async presentMenuUser(e) {
    const popover = await this.popoverCtrl.create({
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
    this.presentConfirm("Estás seguro que deseas cerrar la sesión?", () => {
      this.loaderComponent.startLoading("Cerrando sesión, por favor espere un momento...")
      setTimeout(() => {
        this.angularFireAuth.auth.signOut();
        this.popoverCtrl.dismiss();
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

    let modal = await this.popoverCtrl.create({
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
    const popover = await this.popoverCtrl.create({
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

  close() {
    this.location.back();
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
    }, 500);
  }

  revertPoints() {
    return new Promise((resolve, reject) => {
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
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'revertPoints', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  addPoints() {
    return new Promise((resolve, reject) => {
      let total = this.cartService.getTotalDetail(this.store.deliveryPrice);

      let points = (this.storeCoupon ? (total * this.storeCoupon.discount / 100) : total) / 500;

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
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'addPoints', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
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
      idUserNotification: this.order.idUser
    }

    this.loaderCOmponent.startLoading("Cancelando pedido, por favor espere un momento...")
    setTimeout(() => {
      this.ordersService.update(this.store.id, this.order.id, { status: OrderStatus.Cancelled, lastUpdated: new Date(), messageRejected: message }).then(result => {
        notification.description = "Lo sentimos, tu pedido fue rechazado.";
        notification.idOrder = this.order.id;
        this.notificationsService.create(this.order.idUser, notification).then(result => {

          this.revertToInventory().then(result => {
            this.revertPoints().then(() => {
              this.revertCouponQuantity().then(() => {
                this.notificationsService.getGetByIdOrder(this.appService.currentUser.id, this.order.id).subscribe(result => {
                  result.forEach(notification => {
                    this.notificationsService.update(this.appService.currentUser.id, notification.id, { status: NotificationStatus.Readed });
                  });
                });

                this.loaderCOmponent.stopLoading();
                this.presentAlert("El pedido ha sido rechazado exitosamente", "", () => {
                  this.cartService.clearCart();
                  this.popoverCtrl.dismiss(true);
                });
              });
            });
          });
        });
      });
    }, 500);
  }

  revertToInventory() {
    return new Promise((resolve, reject) => {
      let promises = [];

      for (let [index, p] of this.cartService.getCart().entries()) {
        promises.push(this.updateCartProductInventory(p));
      }

      Promise.all(promises).then(() => {
        resolve();
      });
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'revertToInventory', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  updateCartProductInventory(cartProduct: CartProduct) {
    return new Promise((resolve, reject) => {

      let subs = this.productsService.getCartInventory(this.appService.currentStore.id, cartProduct.product.id)
        .subscribe((cartP) => {
          for (let [index, pInventory] of cartP.entries()) {
            if (this.cartService.compareProducts(pInventory, cartProduct)) {
              let finalProductQuantity = pInventory.quantity + cartProduct.quantity;
              this.productsService.updateCartInventory(this.appService.currentStore.id, cartProduct.product.id, pInventory.id, { quantity: finalProductQuantity });
            }
          }

          subs.unsubscribe();
        });

      resolve();
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'updateCartProductInventory', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  revertCouponQuantity() {
    return new Promise((resolve, reject) => {
      if (this.storeCoupon) {
        // validate Coupon 
        this.storesService.getCouponById(this.store.id, this.storeCoupon.id).then((storeCoupon: StoreCoupon) => {
          if (storeCoupon) {
            this.storesService.updateStoreCoupon(this.store.id, this.storeCoupon.id, { quantity: (storeCoupon.quantity + 1) }).then(() => {
              resolve(true);
            });
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'revertCouponQuantity', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }
}