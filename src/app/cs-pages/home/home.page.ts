import { Component, ViewChild, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController, AlertController, ToastController, IonSelect } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { Store, Product, StoreCategory, Banner } from 'src/app/app-intefaces';
import { LoaderComponent } from '../../cs-components/loader/loader.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { SearchPage } from '../search/search.page';
import { SwUpdate } from '@angular/service-worker';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { LocationStrategy } from '@angular/common';
import { BarcodeScannerComponent } from 'src/app/cs-components/barcode-scanner/barcode-scanner.component';
import { ProductsService } from 'src/app/cs-services/products.service';
import { SubscriptionPlansComponent } from 'src/app/cs-components/subscription-plans/subscription-plans.component';
import { BannerRedirectTypes } from 'src/app/app-enums';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  idSelectedCategories: string[] = [];
  selectedCategories: StoreCategory[] = [];
  batch: number = 20;
  lastToken: string = '';

  selectedStoreLogo: string = "";
  stores: Array<Store>;
  featuredProductsDiscount: Array<any> = [];
  featuredProductsNoDiscount: Array<any> = [];
  gifts: Array<any> = [];

  idStoreCategory: string = '0';
  idSector: string = '0';

  searchingProductsDiscount: boolean = false;
  searchingProductsNoDiscount: boolean = false;
  searchingGifts: boolean = false;

  searchingStores: boolean = false;
  storeSearchHits: number = 0;
  storeSearchText: string = '';

  @ViewChild('selectCategories', { static: false }) selectRef: IonSelect;

  @ViewChild('sliderHome', null) slider: any;
  @ViewChild('sliderHomeFooter', null) sliderFooter: any;
  @ViewChild('sliderHomeProductsDiscount', null) sliderProductsDiscount: any;
  @ViewChild('sliderHomeStores', null) sliderStores: any;
  @ViewChild('sliderHomeProductsNoDiscount', null) sliderProductsNoDiscount: any;
  @ViewChild('sliderHomeGifts', null) sliderGifts: any;

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
    private storesService: StoresService,
    private productsService: ProductsService) {

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
    this.presentConfirm("Estás seguro que deseas cerrar la sesión?", () => {
      this.loaderComponent.startLoading("Cerrando sesión, por favor espere un momento...")
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

  openSelectCategories() {
    this.selectRef.open();
  }

  fillStoreCategories() {
    this.selectedCategories = [];

    this.idSelectedCategories.forEach(sc => {
      this.appService._storeCategories.forEach(asc => {
        if (sc == asc.id) {
          this.selectedCategories.push(asc);
        }
      });
    });
  }

  removeFilterOption(id: string) {
    this.loaderComponent.startLoading("Aplicando filtro. Por favor espere un momento...");

    for (let [index, p] of this.idSelectedCategories.entries()) {
      if (p === id) {
        this.idSelectedCategories.splice(index, 1);
      }
    }

    setTimeout(() => {
      this.getStores();
    }, 500);
  }

  selectedCategories_OnChange(e: any) {
    this.loaderComponent.startLoading("Aplicando filtro. Por favor espere un momento...");
    this.idSelectedCategories = e.target.value;

    setTimeout(() => {
      this.getStores();
    }, 500);
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

  goToPage(url: string, image: string) {
    this.loaderComponent.start(image).then(result => {
      this.router.navigate([url]);
      this.loaderComponent.stop();
    });
  }

  redirectBanner(banner: Banner) {
    switch (banner.redirectType) {
      case BannerRedirectTypes.Store: {
        this.goToPage('/store/' + banner.idStore, banner.storeImage);
        break;
      }
      case BannerRedirectTypes.Product: {
        this.goToPage('/product-detail/' + banner.redirectTypeId + '&' + banner.idStore, banner.storeImage)
        this.router.navigate([]);
        break;
      }
      case BannerRedirectTypes.Coupon: {
        this.storesService.option = BannerRedirectTypes.Coupon;
        this.goToPage('/store/' + banner.idStore, banner.storeImage);
        break;
      }
      case BannerRedirectTypes.Gift: {
        this.storesService.option = BannerRedirectTypes.Gift;
        this.goToPage('/store/' + banner.idStore, banner.storeImage);
        break;
      }
      default: break;
    }
  }

  openWithOption(url: string, image: string, option: number) {
    this.storesService.option = option;
    this.goToPage(url, image)
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
    this.searchingProductsDiscount = true;
    this.searchingProductsNoDiscount = true;
    this.searchingGifts = true;
    this.fillStoreCategories();

    setTimeout(async () => {
      this.stores = [];
      this.featuredProductsDiscount = [];
      this.featuredProductsNoDiscount = [];
      this.gifts = [];

      if (this.idStoreCategory == '0' && this.idSector == '0') {
        this.storesService.getAll(this.storeSearchText).then(stores => {
          this.searchingStores = false;

          stores.forEach((store: Store) => {
            if (store) {
              if (this.idSelectedCategories.length == 0 || this.idSelectedCategories.includes(store.idStoreCategory)) {

                this.stores.push(store);

                // -- PRODUCTS WITH DISCOUNT
                let subs = this.productsService.getFeaturedProductsDiscount(store.id, this.appService._appInfo.featuredProductsXStore).subscribe(products => {

                  products.forEach((product: Product) => {
                    this.featuredProductsDiscount.push({ product: product, url: "/product-detail/" + product.id + "&" + store.id, storeImage: store.logo ? store.logo : '../../../assets/icon/no-image.png' });
                  });

                  this.featuredProductsDiscount = this.shuffle(this.featuredProductsDiscount);
                  this.searchingProductsDiscount = false;
                  this.loadSliderProductsDiscount(function () { });
                  subs.unsubscribe();
                });

                // -- PRODUCTS WITHOUT DISCOUNT
                let subs2 = this.productsService.getFeaturedProductsNoDiscount(store.id, this.appService._appInfo.featuredProductsXStore).subscribe(products => {

                  products.forEach((product: Product) => {
                    this.featuredProductsNoDiscount.push({ product: product, url: "/product-detail/" + product.id + "&" + store.id, storeImage: store.logo ? store.logo : '../../../assets/icon/no-image.png' });
                  });

                  this.featuredProductsNoDiscount = this.shuffle(this.featuredProductsNoDiscount);
                  this.searchingProductsNoDiscount = false;
                  this.loadSliderProductsNoDiscount(function () { });
                  subs2.unsubscribe();
                });

                // -- GIFTS
                let subs3 = this.productsService.getGifts(store.id, this.appService._appInfo.featuredProductsXStore).subscribe(products => {

                  products.forEach((product: Product) => {
                    this.gifts.push({ product: product, url: "/store/" + store.id, storeImage: store.logo ? store.logo : '../../../assets/icon/no-image.png' });
                  });

                  this.gifts = this.shuffle(this.gifts);
                  this.searchingGifts = false;
                  this.loadSliderGifts(function () { });
                  subs3.unsubscribe();
                });
              }

              this.loadSliderStores(function () { });
              this.loadSlider(function () { });
              this.loadSliderFooter(function () { });
            }
          });

          this.stores = this.shuffle(this.stores);
          this.loaderComponent.stopLoading();
        });
      }
    }, 500);
  }

  shuffle(arr) {
    let i,
      j,
      temp;
    for (i = arr.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  };

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

  async openSubscriptionPlans() {
    let modal = await this.popoverController.create({
      component: SubscriptionPlansComponent,
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

      });

    modal.present();
  }


  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       SLIDER VALIDATIONS

  ionViewDidEnter() {
    this.loadAllSliders(300);

    this.featuredProductsDiscount = this.shuffle(this.featuredProductsDiscount);
    this.featuredProductsNoDiscount = this.shuffle(this.featuredProductsNoDiscount);
    this.gifts = this.shuffle(this.gifts);
    this.stores = this.shuffle(this.stores);
  }

  loadAllSliders(timeout) {
    setTimeout(() => {
      this.loadSlider(() => {
        this.loadSliderFooter(() => {
          this.loadSliderStores(() => {
            this.loadSliderProductsDiscount(() => {
              this.loadSliderProductsNoDiscount(() => {
                this.loadSliderGifts(() => {
                });
              });
            });
          });
        });
      });
    }, timeout);
  }

  loadSlider(callBack1) {
    setTimeout(() => {
      if (this.slider) {
        this.slider.startAutoplay();
        callBack1();
      } else {
        this.loadSlider(callBack1);
      }
    }, 1000);
  }

  loadSliderFooter(callBack1) {
    setTimeout(() => {
      if (this.sliderFooter) {
        this.sliderFooter.startAutoplay();
        callBack1();
      } else {
        this.loadSliderFooter(callBack1);
      }
    }, 1000);
  }

  loadSliderStores(callBack2) {
    setTimeout(() => {
      if (this.sliderStores) {
        this.sliderStores.startAutoplay();
        callBack2();
      } else {
        this.loadSlider(callBack2);
      }
    }, 1000);
  }

  loadSliderProductsDiscount(callBack3) {
    setTimeout(() => {
      if (this.sliderProductsDiscount) {
        this.sliderProductsDiscount.startAutoplay();
        callBack3();
      } else {
        this.loadSlider(callBack3);
      }
    }, 1000);
  }

  loadSliderProductsNoDiscount(callBack4) {
    setTimeout(() => {
      if (this.sliderProductsNoDiscount) {
        this.sliderProductsNoDiscount.startAutoplay();
        callBack4();
      } else {
        this.loadSlider(callBack4);
      }
    }, 1000);
  }

  loadSliderGifts(callBack6) {
    setTimeout(() => {
      if (this.sliderGifts) {
        this.sliderGifts.startAutoplay();
        callBack6();
      } else {
        this.loadSlider(callBack6);
      }
    }, 1000);
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
      window.location.reload();
      event.target.complete();
    }, 500);
  }
}