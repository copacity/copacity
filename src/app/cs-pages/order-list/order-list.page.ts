import { Component, OnInit, ViewChild } from '@angular/core';
import { Order } from 'src/app/app-intefaces';
import { Observable } from 'rxjs';
import { AppService } from 'src/app/cs-services/app.service';
import { AlertController, ToastController, PopoverController } from '@ionic/angular';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { OrdersService } from 'src/app/cs-services/orders.service';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { StoresService } from 'src/app/cs-services/stores.service';
import { Router } from '@angular/router';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { SignupComponent } from 'src/app/cs-components/signup/signup.component';
import { AskForAccountComponent } from 'src/app/cs-components/ask-for-account/ask-for-account.component';
import { MenuService } from 'src/app/cs-services/menu.service';
import { CartManagerService } from 'src/app/cs-services/cart-manager.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.page.html',
  styleUrls: ['./order-list.page.scss'],
})
export class OrderListPage implements OnInit {

  @ViewChild('sliderOrderList', null) slider: any;
  ordersBatch: number = 20;
  lastOrderToken: Date = null;
  idOrderState: number = 0;
  searchingOrders: boolean = false;

  orderSearchHits = 0;
  orderSearchText: string = '';

  orders: Observable<Order[]>;
  isAdmin: boolean = false;

  constructor(
    private router: Router,
    public appService: AppService,
    public menuService: MenuService,
    public alertController: AlertController,
    private loaderComponent: LoaderComponent,
    public toastController: ToastController,
    private angularFireAuth: AngularFireAuth,
    private ordersService: OrdersService,
    public cartManagerService: CartManagerService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private popoverController: PopoverController
  ) {

    this.angularFireAuth.auth.onAuthStateChanged(user => {
      if (!user) {
        this.router.navigate(['/app/home']);
      } else {
        this.appService.updateUserData(user.uid).then(() => {
          this.getOrders();
        });
      }
    });

    this.appService.loadCustomScript();
  }

  ngOnInit() { }

  // getStores() {
  //   this.storesService.getAll('').then(stores => {
  //     stores.forEach((store: Store) => {
  //       this.stores.push(store);
  //     });
  //   });
  // }

  getOrders() {
    this.orders = null;
    this.orderSearchHits = 0;
    this.searchingOrders = true;

    if (!this.appService.currentUser.isAdmin) {
      this.isAdmin = false;
      this.orders = this.ordersService.getByStoreAndUser(this.appService.currentUser.id, this.orderSearchText);

      this.orders.subscribe(result => {
        this.searchingOrders = false;
        result.forEach(order => {
          if (order) {
            this.orderSearchHits++;
          }
        });
      });
    } else {
      this.isAdmin = true;
      this.orders = this.ordersService.getByStore(this.orderSearchText);

      this.orders.subscribe(result => {
        this.searchingOrders = false;
        result.forEach(order => {
          if (order) {
            this.orderSearchHits++;
          }
        });
      });
    }
  }

  // stores_OnChange(event: any) {
  //   this.idOrderState = parseInt(event.target.value);

  //   setTimeout(() => {
  //     this.getOrders();
  //   }, 500);
  // }

  async openOrderDetailPage(idOrder: Order) {
    this.router.navigate(['order-detail/' + idOrder]);

    // let modal = await this.popoverController.create({
    //   component: OrderDetailPage,
    //   componentProps: { id: idOrder, idStore: this.store.id },
    //   cssClass: 'cs-popovers',
    //   backdropDismiss: false,
    // });

    // modal.onDidDismiss()
    //   .then((data) => {
    //     const updated = data['data'];
    //   });

    // modal.present();
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


  signOut() {
    this.presentConfirm("Estás seguro que deseas cerrar la sesión?", () => {
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
      //this.orders();
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