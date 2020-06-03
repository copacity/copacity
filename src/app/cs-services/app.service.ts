import { Injectable } from '@angular/core';
import { Store, User, StoreCategory, Sector, Banner, Address, AppInfo, AppMessage, Notification } from '../app-intefaces';
import { UsersService } from './users.service';
import { SectorsService } from './sectors.service';
import { StoreCategoriesService } from './storeCategories.service';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { BannersService } from './banners.service';
import { AddressesService } from './addresses.service';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { StoresService } from './stores.service';
import { NotificationsService } from './notifications.service';
import { ToastController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFireMessaging } from '@angular/fire/messaging';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  // APP VERSION
  appVersion: string = "1.0.20 Beta"

  // APP DATA
  storeCategories: Observable<StoreCategory[]> = null;
  sectors: Observable<Sector[]> = null;
  appInfo: Observable<AppInfo[]>;
  banners: Observable<Banner[]>;
  _sectors: Sector[] = [];
  _storeCategories: StoreCategory[] = [];
  _appInfo: AppInfo;

  // USER DATA
  currentUser: User;
  currentStore: Store;
  notifications: Observable<Notification[]> = null;
  notificationsCount = new BehaviorSubject(0);
  _userStoreId: string;
  addressCollection: Observable<Address[]>;
  idAddressChecked: string = '';
  addressChecked: Address = null;
  addressCount: number = 0;

  // APPSUBSCRIPTIONS
  appSubcriptions_Stores: Subscription[] = [];
  appSubcriptions_Products: Subscription[] = [];
  appSubcriptions_Orders: Subscription[] = [];
  appSubcriptions_Addresses: Subscription[] = [];
  appSubcriptions_Notifications: Subscription[] = [];
  appSubcriptions_UserStoreID: Subscription[] = [];

  constructor(
    private angularFireAuth: AngularFireAuth,
    public angularFirestore: AngularFirestore,
    private usersService: UsersService,
    private afMessaging: AngularFireMessaging,
    private sectorsService: SectorsService,
    private storeCategoriesService: StoreCategoriesService,
    private storesService: StoresService,
    private addressesService: AddressesService,
    public toastController: ToastController,
    public alertController: AlertController,
    public router: Router,
    private notificationsService: NotificationsService,
    private bannersService: BannersService) {

    try {
      if (Notification.permission === 'denied') {
        this.presentAlert("Su configuracion de notificaciones aparece como Bloqueada, Si desea recibir notificaciones debe habilitarla desde la configuracion de su navegador/dispositivo", "", () => { });
      }
    } catch (error) {
      console.log(error);
    }

    //this.sectors = this.sectorsService.getAll();

    // this.sectors.subscribe(sectorArray => {
    //   this._sectors = sectorArray;
    // });

    this.storeCategories = this.storeCategoriesService.getAll();

    this.storeCategories.subscribe(storeCategoriesArray => {
      this._storeCategories = storeCategoriesArray;
    });

    this.angularFireAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.setuserCredential(user.uid);
      } else {
        this.setuserCredential(null);
      }
    });

    this.banners = this.bannersService.getAll();

    this.appInfo = this.getAppInfo();
    this.appInfo.subscribe(result => {
      result.forEach(appInfo => {
        this._appInfo = appInfo;
      });
    });
  }

  updateUserData(idUser: string) {
    this.usersService.getById(idUser).then(user => {
      this.currentUser = user;
      this.getAddressesByUser();
      this.getNotificationsByUser();

      if (this.currentUser && this.currentUser.isAdmin) {

        this.storesService.getByUserId(this.currentUser.id).then(stores => {
          stores.forEach(store => {
            this._userStoreId = store.id;
          });
        });
      }
    });
  }

  getAddressesByUser() {
    if (this.currentUser) {
      this.addressCollection = this.addressesService.getAll(this.currentUser.id);

      this.appSubcriptions_Addresses.push(this.addressCollection.subscribe(addresses => {
        this.idAddressChecked = '';
        this.addressCount = addresses.length;
        addresses.forEach(address => {
          if (address.checked) {
            this.addressChecked = address;
            this.idAddressChecked = address.id;
          }
        });
      }));
    }
  }

  getNotificationsByUser() {
    this.notifications = this.notificationsService.getByUser(this.currentUser.id);
    this.appSubcriptions_Notifications.push(this.notifications.subscribe(notifications => {

      if (notifications.length > this.notificationsCount.value) {
        this.presentToast(notifications[0].userName + ": " + notifications[0].description);

        // let options = {
        //   icon: notifications[0].photoUrl,
        //   body: notifications[0].userName + ": " + notifications[0].description,
        //   vibrate: [200, 100, 200]
        // }

        // if (!("Notification" in window)) {
        //   console.log("This browser does not support desktop notification");
        // } else if (Notification.permission === "granted") {
        //   // If it's okay let's create a notification
        //   new Notification("CopaCity", options);
        // }
        // // Otherwise, we need to ask the user for permission
        // else if (Notification.permission !== "denied") {
        //   Notification.requestPermission().then(function (permission) {
        //     // If the user accepts, let's create a notification
        //     if (permission === "granted") {
        //       new Notification("CopaCity", options);
        //     }
        //   });
        // } else {

        //   if (Notification.permission === 'denied') {
        //     this.presentAlert("Su configuracion de notificaciones aparece como Bloqueada, Si desea recibir notificaciones debe habilitarla desde la configuracion de su dispositivo", "", () => { });
        //   }
        // }
      }

      this.notificationsCount.next(notifications.length);
    }));
  }

  requestPermission(userId: string) {
    this.afMessaging.requestToken
      .subscribe(
        (token) => {
          console.log('Permission granted! Save to the server!', token);
          this.angularFirestore.collection('users')
            .doc(userId)
            .update({ token: token });
        },
        (error) => { console.error(error); },
      );
  }

  setuserCredential(idUser: string) {
    if (idUser) {
      this.updateUserData(idUser);
      this.requestPermission(idUser);
    } else {
      this.clareSessionData();
    }
  }

  clareSessionData() {
    this.currentUser = null;
    //this.currentStore = null;
    this.notifications = null;
    this.notificationsCount = new BehaviorSubject(0);
    this._userStoreId = null;
    this.addressCollection = null;
    this.idAddressChecked = '';
    this.addressChecked = null;
    this.addressCount = 0;

    this.closeAppSubcriptions_Stores();
    this.closeAppSubcriptions_Addresses();
    this.closeAppSubcriptions_Notifications();
    this.closeAppSubcriptions_Orders();
    this.closeAppSubcriptions_Products();
    this.closeAppSubcriptions_UserStoreID();
  }

  getIdAddressChecked() {
    return this.idAddressChecked;
  }

  closeAppSubcriptions_Stores() {
    this.appSubcriptions_Stores.forEach(x => { if (!x.closed) x.unsubscribe(); });
  }

  closeAppSubcriptions_Products() {
    this.appSubcriptions_Products.forEach(x => { if (!x.closed) x.unsubscribe(); });
  }

  closeAppSubcriptions_Orders() {
    this.appSubcriptions_Orders.forEach(x => { if (!x.closed) x.unsubscribe(); });
  }

  closeAppSubcriptions_Addresses() {
    this.appSubcriptions_Addresses.forEach(x => { if (!x.closed) x.unsubscribe(); });
  }

  closeAppSubcriptions_Notifications() {
    this.appSubcriptions_Notifications.forEach(x => { if (!x.closed) x.unsubscribe(); });
  }

  closeAppSubcriptions_UserStoreID() {
    this.appSubcriptions_UserStoreID.forEach(x => { if (!x.closed) x.unsubscribe(); });
  }

  public getAppInfo() {
    return this.angularFirestore.collection('appInfo').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as AppInfo;
        const id = a.payload.doc.id;
        
        return { id, ...data };
      }))
    );
  }

  public createAppMessage(appMessage: AppMessage): Promise<DocumentReference> {
    return this.angularFirestore.collection("appMessages").add(appMessage);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      position: 'top',
      buttons: ['Cerrar']
    });

    toast.present();
  }

  async presentAlert(title: string, message: string, done: Function) {

    const alert = await this.alertController.create({
      header: title,
      message: message,
      mode: 'ios',
      translucent: true,
      animated: true,
      backdropDismiss: false,
      buttons: ['Entendido']
    });

    alert.onDidDismiss().then(() => done());
    await alert.present();
  }

  slideOpts = {
    // initialSlide: 0,
    // slidesPerView: 1,
    // autoplay: true,
    // pager: false,
    //loop: true,
    speed: 2000,
    on: {
      beforeInit() {
        const swiper = this;
        swiper.classNames.push(`${swiper.params.containerModifierClass}fade`);
        const overwriteParams = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: true,
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.params = Object.assign(swiper.originalParams, overwriteParams);
      },
      setTranslate() {
        const swiper = this;
        const { slides } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = swiper.slides.eq(i);
          const offset$$1 = $slideEl[0].swiperSlideOffset;
          let tx = -offset$$1;
          if (!swiper.params.virtualTranslate) tx -= swiper.translate;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
          }
          const slideOpacity = swiper.params.fadeEffect.crossFade
            ? Math.max(1 - Math.abs($slideEl[0].progress), 0)
            : 1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
          $slideEl
            .css({
              opacity: slideOpacity,
            })
            .transform(`translate3d(${tx}px, ${ty}px, 0px)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, $wrapperEl } = swiper;
        slides.transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          slides.transitionEnd(() => {
            if (eventTriggered) return;
            if (!swiper || swiper.destroyed) return;
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      },
    }
  }

}
