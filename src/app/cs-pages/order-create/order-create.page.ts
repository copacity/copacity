import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from 'src/app/cs-services/app.service';
import { Store, Order, CartProduct, Notification, StorePoint, StoreCoupon, PaymentMethod, ShippingMethod, Vendor, User } from 'src/app/app-intefaces';
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
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { UsersService } from 'src/app/cs-services/users.service';
import { BarcodeScannerComponent } from 'src/app/cs-components/barcode-scanner/barcode-scanner.component';
import { ProductsService } from 'src/app/cs-services/products.service';
import { StoreCouponsPage } from '../store-coupons/store-coupons.page';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StoresService } from 'src/app/cs-services/stores.service';
import { Observable } from 'rxjs';
import { PaymentMethodsService } from 'src/app/cs-services/payment-methods.service';
import { ProfileUpdatePage } from '../profile-update/profile-update.page';

@Component({
  selector: 'app-order-create',
  templateUrl: './order-create.page.html',
  styleUrls: ['./order-create.page.scss'],
})
export class OrderCreatePage implements OnInit {
  messageToStore: FormControl;
  couponCode: FormControl;
  idVendor: FormControl;
  storeCoupon: StoreCoupon;

  store: Store;
  cart: CartProduct[];
  isValidInventory: boolean = true;

  shippingMethods: Observable<ShippingMethod[]> = null;
  shippingMethod: ShippingMethod = null;

  paymentMethods: Observable<PaymentMethod[]>;
  paymentsMethodbyShipping: PaymentMethod[] = [];
  paymentMethod: PaymentMethod = null;

  users: User[];

  @ViewChild(SuperTabs, { static: false }) superTabs: SuperTabs;

  constructor(public appService: AppService,
    public alertController: AlertController,
    public cartService: CartService,
    private usersService: UsersService,
    private storesService: StoresService,
    private ngNavigatorShareService: NgNavigatorShareService,
    public popoverController: PopoverController,
    private productsService: ProductsService,
    private loaderComponent: LoaderComponent,
    private ordersService: OrdersService,
    private popoverCtrl: PopoverController,
    public toastController: ToastController,
    private angularFireAuth: AngularFireAuth,
    private paymentMethodsService: PaymentMethodsService,
    private notificationsService: NotificationsService,
    public location: Location) {

    this.store = this.appService.currentStore;
    this.cart = this.cartService.getCart();
    this.paymentMethods = this.paymentMethodsService.getAll();
    this.shippingMethods = this.storesService.getShippingMethods(this.appService.currentStore.id);

    this.messageToStore = new FormControl('', [Validators.maxLength(500)]);
    this.idVendor = new FormControl('', [Validators.required]);
    this.buildStoreCoupon('');

    setTimeout(() => {
      if (this.appService.currentUser.phone1 == 0 || this.appService.currentUser.phone2 == 0 || this.appService.currentUser.whatsapp == 0) {
        this.openProfileUpdatePage();
      }
    }, 5000);

    let subs = this.storesService.getActiveVendors(this.appService.currentStore.id).subscribe(result => {

      let vendorPromises = [];
      result.forEach(vendor => {
        vendorPromises.push(this.fillUsers(vendor));
      });

      Promise.all(vendorPromises).then(users => {
        this.users = users;
      });

      subs.unsubscribe();
    });
  }

  fillUsers(vendor: Vendor) {
    return new Promise((resolve, reject) => {
      this.usersService.getById(vendor.idUser).then(user => {
        resolve(user);
      });
    }).catch(err => alert(err));
  }

  ngOnInit() {

  }

  async openProfileUpdatePage() {

    let modal = await this.popoverController.create({
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

  clearCouponCode() {
    this.storeCoupon = null;
    this.buildStoreCoupon('');
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

  async presentToast(message: string, image: string) {
    const toast = await this.toastController.create({
      duration: 3000,
      message: message,
      position: 'bottom',
    });
    toast.present();
  }

  selectTab(index: number) {
    this.superTabs.selectTab(index)
  }

  shippingMethodChanged(e: any) {
    this.shippingMethod = null;
    this.paymentMethod = null;
    let subs = this.shippingMethods.subscribe(smArray => {

      smArray.forEach(sm => {
        if (e.target.value == sm.id) {
          this.shippingMethod = sm;

          this.paymentsMethodbyShipping = [];

          let subs = this.paymentMethods.subscribe(payments => {
            payments.forEach(payment => {
              if (sm.paymentMethods.some(x => x === payment.id)) {
                this.paymentsMethodbyShipping.push(payment);
              }
            });

            subs.unsubscribe;
          });
        }
      });

      subs.unsubscribe;
    });
  }

  paymentMethodChanged(e: any) {
    this.paymentMethod = null;
    this.paymentsMethodbyShipping.forEach(payment => {
      if (payment.id == e.target.value) {
        this.paymentMethod = payment;
      }
    });
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

  async openBarCodeScanner() {
    let modal = await this.popoverCtrl.create({
      component: BarcodeScannerComponent,
      backdropDismiss: false,
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

        if (result) {
          if (result.indexOf("store-coupons-detail") != -1) {
            let value = result.toString().split("/");
            let storeCouponId = value[value.length - 1].toString().split("&")[0];
            let storeId = value[value.length - 1].toString().split("&")[1];

            if (this.appService.currentStore.id == storeId) {
              this.buildStoreCoupon(storeCouponId);

              this.validateCoupon().then(result => {
                if (result) {
                  this.presentAlert("Cupón aplicado exitosamente, El descuento se verá reflejado en la factura del pedido. Gracias", "", () => { });
                }
              }).catch(err => alert(err));
            } else {
              this.presentAlert("Lo sentimos, el cupón seleccionado no pertenece a esta tienda", "", () => { });
            }
          } else {
            this.presentAlert("El código leído no es un cupón", "", () => { });
          }
        }
      });

    modal.present();
  }

  async sendOrder() {
    if (this.messageToStore.valid) {
      if (this.appService.currentUser) {
        if (this.shippingMethod) {
          if (this.paymentMethod) {
            if ((this.shippingMethod.addressRequired && this.appService.addressChecked) || !this.shippingMethod.addressRequired) {
              if (this.idVendor.valid) {
                this.loaderComponent.startLoading("Enviando Pedido, por favor espere un momento...");

                setTimeout(() => {
                  let order: Order = {
                    id: '',
                    ref: new Date().getTime(),
                    deleted: false,
                    idStore: this.appService.currentStore.id,
                    idUser: this.appService.currentUser.id,
                    idPaymentMethod: this.paymentMethod.id,
                    idVendor: this.idVendor.value,
                    lastUpdated: new Date(),
                    dateCreated: new Date(),
                    status: OrderStatus.Pending,
                    photoUrl: this.appService.currentUser.photoUrl,
                    userName: this.appService.currentUser.name,
                    message: this.messageToStore.value,
                    messageRejected: '',
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

                  this.validateFromInventory().then(() => {
                    if (this.isValidInventory) {
                      // 1. Create Order
                      this.ordersService.create(this.appService.currentStore.id, order).then(doc => {

                        // 2. Udpate Id field into Orders collection
                        this.ordersService.update(this.appService.currentStore.id, doc.id, { id: doc.id }).then(async result => {

                          // 3. Added checked address into Addresses sub-collection into order
                          if (this.appService.addressChecked) {
                            await this.ordersService.createOrderAddress(this.appService.currentStore.id, doc.id, this.appService.addressChecked);
                          }

                          // 4. Added cart Products into cartProducts sub-collection into order
                          this.addCartProducts(doc.id, 0).then(result => {

                            // 5. Adding Shipping method
                            this.addShippingMethod(doc.id).then(() => {

                              // 6. Discount each product from Inventory
                              this.discountFromInventory().then(result => {

                                // 7. Of the order has gifts then the process go to discount points to the user
                                this.discountPoints().then(async () => {

                                  if (this.storeCoupon) {
                                    await this.ordersService.addOrderCoupon(this.appService.currentStore.id, doc.id, this.storeCoupon);
                                  }

                                  // 8. Discount Coupon Quantity
                                  this.discountCouponQuantity().then(() => {

                                    notification.description = "Ha realizado un nuevo pedido en " + this.appService.currentStore.name;
                                    notification.idOrder = doc.id;

                                    // 9. Configure Notification
                                    this.notificationsService.create(this.appService.currentStore.idUser, notification).then(result => {
                                      this.loaderComponent.stopLoading();
                                      this.cartService.clearCart();
                                      this.presentAlert("El pedido ha sido enviado a la tienda exitosamente! Tu numero de pedido es: " + order.ref, "", () => {
                                        this.location.back();
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    }
                  });
                }, 500);
              } else {
                this.presentAlert("Debes seleccionar una opción en 'Quien te Asesoro?' antes de hacer el pedido", "", () => { }, 'Entendido!');
              }
            } else {
              this.presentAlert("Debes seleccionar una dirección antes de hacer el pedido", "", () => { }, 'Entendido!');
            }
          } else {
            this.presentAlert("Debes seleccionar un método de pago antes de hacer el pedido", "", () => { }, 'Entendido!');
          }
        } else {
          this.presentAlert("Debes seleccionar un método de envío antes de hacer el pedido", "", () => { }, 'Entendido!');
        }
      } else {
        this.SignIn();
      }
    } else {
      this.messageToStore.markAllAsTouched();
    }
  }

  discountFromInventory() {
    return new Promise((resolve, reject) => {
      let promises = [];

      for (let [index, p] of this.cart.entries()) {
        promises.push(this.updateCartProductInventory(p));
      }

      Promise.all(promises).then(() => {
        resolve();
      });
    }).catch(err => alert(err));
  }

  addShippingMethod(idOrder: string) {
    return new Promise((resolve, reject) => {
      this.ordersService.addOrderShippingMethod(this.appService.currentStore.id, idOrder, this.shippingMethod).then(() => {
        resolve();
      });
    }).catch(err => alert(err));
  }

  updateCartProductInventory(cartProduct: CartProduct) {
    return new Promise((resolve, reject) => {

      let subs = this.productsService.getCartInventory(this.appService.currentStore.id, cartProduct.product.id)
        .subscribe((cartP) => {
          for (let [index, pInventory] of cartP.entries()) {
            if (this.cartService.compareProducts(pInventory, cartProduct)) {
              let finalProductQuantity = pInventory.quantity - cartProduct.quantity;
              this.productsService.updateCartInventory(this.appService.currentStore.id, cartProduct.product.id, pInventory.id, { quantity: finalProductQuantity });
            }
          }

          subs.unsubscribe();
        });

      resolve();
    }).catch(err => alert(err));
  }

  discountPoints() {
    return new Promise((resolve, reject) => {
      let subscribe = this.usersService.getStorePoints(this.appService.currentUser.id).subscribe(StorePoints => {

        let hasPoints = false;
        StorePoints.forEach(storePoint => {
          if (storePoint.idStore === this.appService.currentStore.id) {
            let points = storePoint.points - this.cartService.getPoints();
            this.usersService.updateStorePoint(this.appService.currentUser.id, storePoint.id, { points: points }).then(() => {
              resolve();
            });
          }
        });

        if (!hasPoints) {
          resolve();
        }

        subscribe.unsubscribe();
      });
    }).catch(err => alert(err));
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

    return new Promise((resolve, reject) => {
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
    }).catch(err => alert(err));
  }

  close() {
    this.location.back();
  }

  validateFromInventory() {
    return new Promise((resolve, reject) => {
      let promises = [];

      for (let [index, p] of this.cart.entries()) {
        promises.push(this.validateCartProductInventory(p));
      }

      this.isValidInventory = true;
      Promise.all(promises).then(values => {
        resolve();
      });
    }).catch(err => {
      this.presentAlert(err, "", () => { });
      this.loaderComponent.stopLoading();
    });
  }

  validateCartProductInventory(cartProduct: CartProduct) {
    return new Promise((resolve, reject) => {

      let subs = this.productsService.getCartInventory(this.appService.currentStore.id, cartProduct.product.id)
        .subscribe((cartP) => {
          for (let [index, pInventory] of cartP.entries()) {
            if (this.cartService.compareProducts(pInventory, cartProduct)) {
              if (pInventory.quantity >= cartProduct.quantity) {
                resolve(true);
              } else {

                let properties = "";
                cartProduct.propertiesSelection.forEach(ps => {
                  properties = properties + " " + ps.propertyName + " " + ps.propertyOptionName + ", ";
                });

                this.isValidInventory = false;

                let message = "Lo sentimos inventario insuficiente para: " + cartProduct.product.name + " " + properties + " Posiblemente otro cliente acaba de comprar el mismo producto, cantidad disponible en inventario: " + pInventory.quantity + " y la cantidad en tu pedido es de: " + cartProduct.quantity + ". Debes ir a tu carrito y modificar la cantidad o removerlo. Ofrecemos disculpas por el inconveniente. Gracias";
                reject(message);
              }
            }
          }

          subs.unsubscribe();
        });
    }).catch(err => {
      this.presentAlert(err, "", () => { });
      this.loaderComponent.stopLoading();
    });
  }

  discountCouponQuantity() {
    return new Promise((resolve, reject) => {
      if (this.storeCoupon) {
        // validate Coupon 
        this.storesService.getCouponById(this.appService.currentStore.id, this.couponCode.value).then((storeCoupon: StoreCoupon) => {
          if (storeCoupon) {
            this.storesService.updateStoreCoupon(this.appService.currentStore.id, this.couponCode.value, { quantity: (storeCoupon.quantity - 1) }).then(() => {
              resolve(true);
            });
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  async openStoreCouponsPage() {
    if (this.appService.currentUser) {
      let modal = await this.popoverController.create({
        component: StoreCouponsPage,
        componentProps: { isAdmin: false, dashboard: false, orderTotal: this.cartService.getTotalDetail(this.appService.currentStore.deliveryPrice) },
        cssClass: 'cs-popovers',
        backdropDismiss: false,
      });

      modal.onDidDismiss()
        .then((data) => {
          const storeCoupon = data['data'];

          if (storeCoupon) {
            this.buildStoreCoupon(storeCoupon.id);

            this.validateCoupon().then(result => {
              if (result) {
                this.presentAlert("Cupón aplicado exitosamente, El descuento se verá reflejado en la factura del pedido. Gracias", "", () => { });
              }
            }).catch(err => alert(err));
          }
        });

      modal.present();
    } else {
      this.SignIn();
    }
  }

  buildStoreCoupon(idStoreCoupon: string) {
    this.couponCode = new FormControl(idStoreCoupon, [], []);
    this.couponCode.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe(res => {
        this.validateCoupon().then(result => {
          if (result) {
            this.presentAlert("Cupón aplicado exitosamente, El descuento se verá reflejado en la factura del pedido. Gracias", "", () => { });
          }
        }).catch(err => alert(err));
      });
  }

  async validateCoupon_click() {
    this.validateCoupon().then(result => {
      if (result) {
        this.presentAlert("Cupón aplicado exitosamente, El descuento se verá reflejado en la factura del pedido. Gracias", "", () => { });
      }
    }).catch(err => alert(err));
  }

  async validateCoupon() {
    return new Promise((resolve, reject) => {

      this.storeCoupon = null;
      if (this.couponCode.value) {
        this.storesService.getCouponById(this.appService.currentStore.id, this.couponCode.value).then((storeCoupon: StoreCoupon) => {
          if (storeCoupon) {
            if (storeCoupon.quantity > 0) {
              let currentDate: any = new Date();
              let couponDate: any = storeCoupon.dateExpiration;
              if (couponDate.toDate().getTime() > currentDate.getTime()) {
                this.storeCoupon = storeCoupon;
                resolve(true);
              } else {
                this.presentAlert("Lo sentimos el cupón seleccionado esta vencido", "", () => { });
                resolve(false);
              }
            } else {
              this.presentAlert("Lo sentimos el cupón seleccionado se ha agotado", "", () => { });
              resolve(false);
            }
          } else {
            resolve(false);
          }
        }).catch(function (error) {
          resolve(false);
        });
      } else {
        resolve(false);
      }
    });
  }
}
