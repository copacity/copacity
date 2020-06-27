import { Component, ViewChild, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController, AlertController, ToastController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { Store, Banner } from 'src/app/app-intefaces';
import { StoreCreatePage } from '../store-create/store-create.page';
import { LoaderComponent } from '../../cs-components/loader/loader.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { SearchPage } from '../search/search.page';
import { SwUpdate } from '@angular/service-worker';
import { Observable, Subscription } from 'rxjs';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { LocationStrategy } from '@angular/common';
import { BarcodeScannerComponent } from 'src/app/cs-components/barcode-scanner/barcode-scanner.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  batch: number = 20;
  lastToken: string = '';

  selectedStoreLogo: string = "";
  stores: Array<Store>;

  idStoreCategory: string = '0';
  idSector: string = '0';

  searchingStores: boolean = false;
  storeSearchHits: number = 0;
  storeSearchText: string = '';

  @ViewChild('sliderHome', null) slider: any;
  @Input('header') header: any;
  angularFireAuth: any;

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       CONSTRUCTOR

  constructor(private router: Router,
    private loaderComponent: LoaderComponent,
    private ngNavigatorShareService: NgNavigatorShareService,
    public appService: AppService,
    private swUpdate: SwUpdate,
    public alertController: AlertController,
    private locationStrategy: LocationStrategy,
    public toastController: ToastController,
    public popoverController: PopoverController,
    private storesService: StoresService) {

    history.pushState(null, null, window.location.href);
    this.locationStrategy.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(async () => {
        window.location.reload();
      });
    }

    this.initializePage();
  }

  ngOnInit(): void { }

  signOut() {
    this.presentConfirm("Estas seguro que deseas cerrar la sesion?", () => {
      this.loaderComponent.startLoading("Cerrando Sesion, por favor espere un momento...")
      setTimeout(() => {
        this.angularFireAuth.auth.signOut();
        this.popoverController.dismiss();
        this.presentToast("Has abandonado la sesión!");
        this.loaderComponent.stopLoading();
      }, 500);
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: 'top',
      buttons: ['Cerrar']
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


  // fullScreen(){
  //   let elem = document.documentElement;
  //   let methodToBeInvoked = elem.requestFullscreen ||
  //     elem.webkitRequestFullScreen || elem['mozRequestFullscreen']
  //     ||
  //     elem['msRequestFullscreen'];
  //   if (methodToBeInvoked) methodToBeInvoked.call(elem);
  // }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       Notifications

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
  //--------------------------------       INITIALIZE

  initializePage() {
    this.getStores();
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       SEARCH PAGE

  async openSearch() {

    let modal = await this.popoverController.create({
      component: SearchPage,
      cssClass: 'login'
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

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       GO TO STORE PAGE

  goToStore(e: any, store: Store) {
    this.loaderComponent.start(store.logo ? store.logo : "../../assets/icon/no-image.png").then(result => {
      this.router.navigate(['/store', store.id]);
      this.loaderComponent.stop();
    });
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       GET STORES 

  searchStores(event) {
    this.storeSearchText = event.target.value;
    this.getStores();
  }

  getStores() {
    this.stores = null;
    this.searchingStores = true;
    //this.storeSearchHits = 0;

    setTimeout(async () => {
      this.stores = [];

      if (this.idStoreCategory == '0' && this.idSector == '0') {
        this.storesService.getAll(this.storeSearchText).then(stores => {
          //this.stores = stores;
          this.searchingStores = false;
          //this.storeSearchHits = 0;

          stores.forEach((store: Store) => {
            if (store) {
              this.stores.push(store);
              //this.storeSearchHits++;
            }
          });
        });
      }
      // else if (this.idSector == '0') {
      //   this.storesService.getByIdStoreCategory(this.idStoreCategory, this.storeSearchText).then(stores => {
      //     this.stores = stores;
      //     this.searchingStores = false;
      //     this.storeSearchHits = 0;

      //     stores.forEach((store: Store) => {
      //       if (store) {
      //         this.storeSearchHits++;
      //       }
      //     });
      //   });
      // } else if (this.idStoreCategory == '0') {
      //   this.storesService.getByIdSector(this.idSector, this.storeSearchText).then(stores => {
      //     this.stores = stores;
      //     this.searchingStores = false;
      //     this.storeSearchHits = 0;

      //     stores.forEach((store: Store) => {
      //       if (store) {
      //         this.storeSearchHits++;
      //       }
      //     });
      //   });
      // } else {
      //   this.storesService.getByFilterSearch(this.idSector, this.idStoreCategory, this.storeSearchText).then(stores => {
      //     this.stores = stores;
      //     this.searchingStores = false;
      //     this.storeSearchHits = 0;

      //     stores.forEach((store: Store) => {
      //       if (store) {
      //         this.storeSearchHits++;
      //       }
      //     });
      //   });
      // }
    }, 500);
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       FILTERS

  storeCategory_OnChange(e: any) {
    this.idStoreCategory = e.target.value;
    this.getStores();
  }

  sector_OnChange(e: any) {
    this.idSector = e.target.value;
    this.getStores();
  }

  async openBarCodeScanner() {
    let modal = await this.popoverController.create({
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
            this.router.navigate(['store-coupons-detail/', value[value.length - 1]]);
          } else if (result.indexOf("product-detail") != -1) {
            let value = result.toString().split("/");
            this.router.navigate(['product-detail/', value[value.length - 1]]);
          } else if (result.indexOf("store") != -1) {
            let value = result.toString().split("/");
            this.router.navigate(['store/', value[value.length - 1]]);
          }
        }
      });

    modal.present();
  }


  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       SLIDER VALIDATIONS

  ionViewDidEnter() {
    setTimeout(() => {
      try { this.slider.startAutoplay(); } catch (error) { }  
    }, 300);
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       STORE CREATION

  async openStoreCreatePage() {
    if (this.appService.currentUser) {
      let modal = await this.popoverController.create({
        component: StoreCreatePage,
        cssClass: 'cs-popovers',
        backdropDismiss: false,
      });

      modal.onDidDismiss()
        .then((data) => {
          const idNewStore = data['data'];
          if (idNewStore) {
            this.router.navigate(['/store', idNewStore]);
          }
        });

      modal.present();
    } else {
      this.SignIn();
    }
  }


  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------    INFINITE SCROLL

  loadData(event) {

    // if (this.lastToken != (this.stores.length != 0 ? this.stores[this.stores.length - 1].name : '' || this.lastToken == '')) {
    //   this.getStores();
    // }

    event.target.complete();
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------    Share APP

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

  doRefresh(event) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 500);
  }
}