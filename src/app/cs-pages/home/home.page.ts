import { Component, ViewChild, OnInit, Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController, AlertController, ToastController, IonSelect } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { Category, Product, Banner, StoreCoupon, Vendor } from 'src/app/app-intefaces';
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
import { CartManagerService } from 'src/app/cs-services/cart-manager.service';
import { CartInventoryService } from 'src/app/cs-services/cart-inventory.service';
import { ProductPropertiesSelectionComponent } from 'src/app/cs-components/product-properties-selection/product-properties-selection.component';
import { VideoPlayerComponent } from 'src/app/cs-components/video-player/video-player.component';
import { SignupComponent } from 'src/app/cs-components/signup/signup.component';
import { AskForAccountComponent } from 'src/app/cs-components/ask-for-account/ask-for-account.component';
import { VendorsListComponent } from 'src/app/cs-components/vendors-list/vendors-list.component';
import { HostListener } from "@angular/core";
import { concat, forkJoin, Observable } from 'rxjs';
import { CartPage } from '../cart/cart.page';
import { UsersService } from 'src/app/cs-services/users.service';
import { StoreInformationComponent } from 'src/app/cs-components/store-information/store-information.component';
import { StorePointsPage } from '../store-points/store-points.page';
import { map } from 'rxjs/operators';
import { StoreCouponsPage } from '../store-coupons/store-coupons.page';
import { StoreOrdersPage } from '../store-orders/store-orders.page';
import { StorePqrsfPage } from '../store-pqrsf/store-pqrsf.page';
import { StoreVendorsPage } from '../store-vendors/store-vendors.page';
import { StoreVendorsAdminPage } from '../store-vendors-admin/store-vendors-admin.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  _categories: Observable<Category[]>;
  _categoriesFiltered: Observable<Category[]>;

  _featuredProducts: Observable<Product[]>;
  _featuredProductsDiscount: Observable<Product[]>;
  _featuredProductsNoDiscount: Observable<Product[]>;
  _featuredProductsNoFeatured: any[] = [];
  _gifts: Observable<Product[]>;
  _coupons: Observable<StoreCoupon[]>;

  idSelectedCategories: string[] = [];
  selectedCategories: Category[] = [];
  batch: number = 20;
  lastToken: string = '';

  selectedStoreLogo: string = "";
  categories: Array<Category>;

  featuredProductsDiscount: Array<any> = [];
  featuredProductsNoDiscount: Array<any> = [];
  featuredProductsNoFeatured: Array<any> = [];
  gifts: Array<any> = [];
  storeCoupons: Array<any> = [];

  searchingProductsDiscount: boolean = false;
  searchingProductsNoDiscount: boolean = false;
  searchingProductsNoFeatured: boolean = false;
  searchingGifts: boolean = false;
  searchingStoreCoupons: boolean = false;
  searchingStores: boolean = false;

  storeSearchHits: number = 0;
  storeSearchText: string = '';

  @ViewChild('selectCategories', { static: false }) selectRef: IonSelect;
  @ViewChild('cartHome', { static: false, read: ElementRef }) shoppingCart: ElementRef;

  @ViewChild('sliderHome', null) slider: any;
  @ViewChild('sliderHomeFooter', null) sliderFooter: any;
  @ViewChild('sliderHomeProductsDiscount', null) sliderProductsDiscount: any;
  @ViewChild('sliderHomeStores', null) sliderStores: any;
  @ViewChild('sliderHomeProductsNoDiscount', null) sliderProductsNoDiscount: any;
  @ViewChild('sliderHomeProductsNoFeatured', null) sliderHomeProductsNoFeatured: any;
  @ViewChild('sliderHomeGifts', null) sliderGifts: any;
  @ViewChild('sliderStoreCoupons', null) sliderStoreCoupons: any;
  @ViewChild('sliderMenu', null) sliderMenu: any;

  @Input('header') header: any;
  angularFireAuth: any;

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       CONSTRUCTOR

  constructor(private router: Router,
    private loaderComponent: LoaderComponent,
    public cartInventoryService: CartInventoryService,
    public cartManagerService: CartManagerService,
    private ngNavigatorShareService: NgNavigatorShareService,
    public appService: AppService,
    private swUpdate: SwUpdate,
    public alertController: AlertController,
    private locationStrategy: LocationStrategy,
    public toastController: ToastController,
    public popoverController: PopoverController,
    private storesService: StoresService,
    private usersService: UsersService,
    private productsService: ProductsService) {

    history.pushState(null, null, window.location.href);
    this.locationStrategy.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    this.initializePage();
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    let screenHeight = window.innerHeight;
    let screenWidth = window.innerWidth;
    console.log(screenHeight, screenWidth);

    if (screenWidth <= 450) {
      this.appService.slideOptsProductsDiscount = { speed: 1000, slidesPerView: 4 }
      this.appService.slideOptsStores = { speed: 800, slidesPerView: 3 }
      this.appService.slideOptsProductsNoDiscount = { speed: 1000, slidesPerView: 2 }
      this.appService.slideOptsProductsNoFeatured = { speed: 2000, slidesPerView: 2 }
      this.appService.slideOptsStoreCoupons = { speed: 1500, slidesPerView: 1 }
      this.appService.slideOptsGifts = { speed: 500, slidesPerView: 3 }
    }
    else if (screenWidth > 450) {
      if (screenWidth < 600) {
        this.appService.slideOptsProductsDiscount = { speed: 1000, slidesPerView: 5 }
      } else {
        this.appService.slideOptsProductsDiscount = { speed: 1000, slidesPerView: 6 }
      }
      this.appService.slideOptsStores = { speed: 800, slidesPerView: 4 }
      this.appService.slideOptsProductsNoDiscount = { speed: 1000, slidesPerView: 3 }
      this.appService.slideOptsProductsNoFeatured = { speed: 2000, slidesPerView: 3 }
      this.appService.slideOptsStoreCoupons = { speed: 1500, slidesPerView: 2 }
      this.appService.slideOptsGifts = { speed: 500, slidesPerView: 4 }
    }
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
      this._categories.subscribe(array => {
        array.forEach(asc => {
          if (sc == asc.id) {
            this.selectedCategories.push(asc);
          }
        });
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

    this.getProducts();
  }

  selectedCategories_OnChange(e: any) {
    this.loaderComponent.startLoading("Aplicando filtro. Por favor espere un momento...");
    this.idSelectedCategories = e.target.value;
    this.getProducts();
  }

  async addToCart(e: any, featuredProductNoDiscount: any) {
    if (!this.appService.currentUser || this.appService.currentUser.id != featuredProductNoDiscount.store.iduser) {
      this.sliderProductsNoDiscount.stopAutoplay();

      let cartSevice = this.cartManagerService.getCartService(/*featuredProductNoDiscount.store*/)

      if (!featuredProductNoDiscount.product.soldOut) {
        this.cartInventoryService.clearCart();
        let subs = this.productsService.getCartInventory(featuredProductNoDiscount.product.id)
          .subscribe((cartP) => {

            let productPropertiesResult = this.productsService.getAllProductPropertiesUserSelectable(featuredProductNoDiscount.product.id);

            let subscribe = productPropertiesResult.subscribe(async productProperties => {
              productProperties.forEach(productProperty => {
                let productPropertyOptionsResult = this.productsService.getAllProductPropertyOptions(featuredProductNoDiscount.product.id, productProperty.id);
                let subscribe2 = productPropertyOptionsResult.subscribe(productPropertyOptions => {
                  productProperty.productPropertyOptions = productPropertyOptions;
                  subscribe2.unsubscribe();
                });
              });

              productProperties = productProperties;
              subscribe.unsubscribe();

              let modal = await this.popoverController.create({
                component: ProductPropertiesSelectionComponent,
                mode: 'ios',
                event: e,
                componentProps: { store: featuredProductNoDiscount.store, isInventory: false, product: featuredProductNoDiscount.product, productProperties: productProperties, cart: cartP, limitQuantity: 0, quantityByPoints: -1 }
              });

              modal.onDidDismiss()
                .then((data) => {
                  const result = data['data'];
                  this.sliderProductsNoDiscount.startAutoplay();

                  if (result) {
                    this.animateCSS('tada');
                    cartSevice.addProduct(result);
                    this.presentToastCart(featuredProductNoDiscount.product.name + ' ha sido agregado al carrito!', result.product.image);
                  }
                });

              modal.present();
            });


            subs.unsubscribe();
          });
      }
    } else {
      this.presentAlert("No puedes agregar productos al carrito por que eres el administrador de esta tienda. Gracias", "", () => { });
    }
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

  async presentToastCart(message: string, image: string) {
    const toast = await this.toastController.create({
      duration: 3000,
      message: message,
      position: 'bottom',
      buttons: ['Cerrar']
    });
    toast.present();
  }

  animateCSS(animationName: any, keepAnimated = false) {

    const node = this.shoppingCart.nativeElement;
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
      if (!keepAnimated) {
        node.classList.remove('animated', animationName);
      }

      node.removeEventListener('animationend', handleAnimationEnd)
    }

    node.addEventListener('animationend', handleAnimationEnd)
  }

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

  scrollStart() {
    setTimeout(() => {
      //this.fullScreen();
    }, 300);
  }

  fullScreen() {
    let elem: any = document.documentElement;
    let methodToBeInvoked = elem.requestFullscreen ||
      elem.webkitRequestFullScreen || elem['mozRequestFullscreen']
      ||
      elem['msRequestFullscreen'];
    if (methodToBeInvoked) methodToBeInvoked.call(elem);
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       INITIALIZE

  initializePage() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(async () => {
        window.location.reload();
      });
    }

    // this.getStores();
    // this._stores = this.storesService.getAllStores();

    this._categories = this.storesService._getAll();
    this._categories.subscribe(categories => {
      this.getProducts(categories);
    });
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       SEARCH PAGE

  async SignIn() {
    //this.popoverController.dismiss();

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

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       GO TO STORE PAGE

  goToStore(e: any, category: Category) {
    this.loaderComponent.start(category.thumb_logo ? category.thumb_logo : "../../assets/icon/no-image.png").then(result => {
      this.router.navigate(['/store', category.id]);
      this.loaderComponent.stop();
    });
  }

  goToPage(url: string, image: string) {
    this.loaderComponent.start(image).then(result => {
      this.router.navigate([url]);
      this.loaderComponent.stop();
    });
  }

  async openVideoPlayerComponent(e: any, url: string) {
    this.sliderProductsNoDiscount.stopAutoplay();
    let modal = await this.popoverController.create({
      component: VideoPlayerComponent,
      mode: 'ios',
      cssClass: 'cs-video-popover',
      componentProps: { url: url },
      event: e
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
        this.sliderProductsNoDiscount.startAutoplay();
      });

    modal.present();
  }

  async openStoreOrdersPage() {
    if (this.appService.currentUser) {
      let modal = await this.popoverController.create({
        component: StoreOrdersPage,
        componentProps: { isAdmin: this.appService.currentUser ? this.appService.currentUser.isAdmin : false },
        cssClass: 'cs-popovers',
        backdropDismiss: false,
      });

      modal.onDidDismiss()
        .then((data) => {
          const result = data['data'];
        });

      modal.present();
    } else {
      this.SignIn();
    }
  }

  async openStoreVendorsPage() {
    if (this.appService.currentUser) {
      if (this.appService.currentUser.isAdmin) {
        let modal = await this.popoverController.create({
          component: StoreVendorsAdminPage,
          cssClass: 'cs-popovers',
          backdropDismiss: false,
        });

        modal.onDidDismiss()
          .then((data) => {
            const result = data['data'];
          });

        modal.present();
      } else {
        let modal = await this.popoverController.create({
          component: StoreVendorsPage,
          componentProps: { idUser: this.appService.currentUser.id },
          cssClass: 'cs-popovers',
          backdropDismiss: false,
        });

        modal.onDidDismiss()
          .then((data) => {
            const result = data['data'];
          });

        modal.present();
      }

    } else {
      this.SignIn();
    }
  }

  async openStorePQRSFPage() {
    if (this.appService.currentUser) {
      let modal = await this.popoverController.create({
        component: StorePqrsfPage,
        componentProps: { isAdmin: this.appService.currentUser ? this.appService.currentUser.isAdmin : false },
        cssClass: 'cs-popovers',
        backdropDismiss: false,
      });

      modal.onDidDismiss()
        .then((data) => {
          const result = data['data'];
        });

      modal.present();
    } else {
      this.SignIn();
    }
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
      case BannerRedirectTypes.ExternalUrl: {
        window.open(banner.externalUrl, 'popup');
        break;
      }
      default: break;
    }
  }

  async openCart() {
    let modal = await this.popoverController.create({
      component: CartPage,
      componentProps: { storeId: '-1' },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        let result = data['data'];

        if (result) {
          this.goToCreateOrder();
        }
      });

    modal.present();
  }

  async goToCreateOrder() {
    this.router.navigate(['/order-create']);
  }

  openWithOption(url: string, image: string, option: number) {
    this.storesService.option = option;
    this.goToPage(url, image)
  }

  async openStoreCouponsPage() {
    //if (this.appService.currentUser) {
    let modal = await this.popoverController.create({
      component: StoreCouponsPage,
      componentProps: { isAdmin: this.appService.currentUser ? this.appService.currentUser.isAdmin : false, dashboard: true, orderTotal: -1 },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

        if (result) {
          this.appService.temporalCoupon = result;
        }
      });

    modal.present();
    // } else {
    //   this.SignIn();
    // }
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       GET STORES 

  searchStores(event) {
    this.storeSearchText = event.target.value;
    //this.getStores();
  }

  getProducts() {
    this.fillStoreCategories();

    this._categoriesFiltered = this._categories.pipe(
      map(items => items.filter(item => {
        if (this.idSelectedCategories.length == 0 || this.idSelectedCategories.includes(item.id)) {
          return item
        }
      })));

    this._featuredProducts = this.productsService._getFeaturedProducts()

    this._featuredProductsDiscount = this._featuredProducts.pipe(
      map(items => items.filter(item => {
        if (this.idSelectedCategories.length == 0 || this.idSelectedCategories.includes(item.idCategory)) {
          return item.discount > 0
        }
      })));

    this._featuredProductsNoDiscount = this._featuredProducts.pipe(
      map(items => items.filter(item => {
        if (this.idSelectedCategories.length == 0 || this.idSelectedCategories.includes(item.idCategory)) {
          return item.discount <= 0
        }
      })));

    this._featuredProductsNoFeatured = [];
    this._categories.forEach(array => {
      array.forEach(category => {
        if (this.idSelectedCategories.length == 0 || this.idSelectedCategories.includes(category.id)) {
          this._featuredProductsNoFeatured.push({ category: category, products: this.productsService.getFeaturedProductsNoFeatured(category.id, 4) });
        }
      });
    });

    this._gifts = this.productsService.getFeaturedGifts();

    this._coupons = this.storesService.getStoreCouponsXStore().pipe(
      map(items => items.filter(item => {
        let today = new Date(new Date().setHours(23, 59, 59, 0));
        let dateExpiration: any = item.dateExpiration;

        if (today.getTime() <= dateExpiration.toDate().getTime() && item.quantity > 0) {
          return item
        }
      })));

      this.loaderComponent.stopLoading();
  }

  // getStores() {
  //   this.categories = null;
  //   this.searchingStores = true;
  //   this.searchingProductsDiscount = true;
  //   this.searchingProductsNoDiscount = true;
  //   this.searchingProductsNoFeatured = true;
  //   this.searchingGifts = true;
  //   this.searchingStoreCoupons = true;

  //   setTimeout(async () => {
  //     this.categories = [];
  //     this.selectedCategories = [];
  //     this.featuredProductsDiscount = [];
  //     this.featuredProductsNoDiscount = [];
  //     this.featuredProductsNoFeatured = [];
  //     this.gifts = [];
  //     this.storeCoupons = [];

  //     this.storesService.getAll(this.storeSearchText).then(stores => {
  //       this.searchingStores = false;

  //       stores.forEach((category: Category) => {
  //         if (category) {
  //           if (this.idSelectedCategories.length == 0 || this.idSelectedCategories.includes(category.id)) {
  //             if (this.idSelectedCategories.includes(category.id)) { this.selectedCategories.push(category); }

  //             this.categories.push(category);

  //             // -- PRODUCTS WITH DISCOUNT
  //             let subs = this.productsService.getFeaturedProductsDiscount(category.id, this.appService._appInfo.featuredProductsXStore).subscribe(products => {

  //               products.forEach((product: Product) => {
  //                 this.featuredProductsDiscount.push({ product: product, url: "/product-detail/" + product.id, storeImage: category.logo ? category.logo : '../../../assets/icon/no-image.png' });
  //               });

  //               this.featuredProductsDiscount = this.shuffle(this.featuredProductsDiscount);
  //               this.searchingProductsDiscount = false;
  //               this.loadSliderProductsDiscount(function () { });
  //               subs.unsubscribe();
  //             });

  //             // -- PRODUCTS WITHOUT DISCOUNT
  //             // let subs2 = this.productsService.getFeaturedProductsNoDiscount(category.id, this.appService._appInfo.featuredProductsXStore).subscribe(products => {

  //             //   products.forEach((product: Product) => {
  //             //     this.featuredProductsNoDiscount.push({ product: product, url: "/product-detail/" + product.id, store: category, storeImage: category.logo ? category.logo : '../../../assets/icon/no-image.png' });
  //             //   });

  //             //   this.featuredProductsNoDiscount = this.shuffle(this.featuredProductsNoDiscount);
  //             //   this.searchingProductsNoDiscount = false;
  //             //   this.loadSliderProductsNoDiscount(function () { });
  //             //   subs2.unsubscribe();
  //             // });

  //             // -- GIFTS
  //             // let subs3 = this.productsService.getGifts(this.appService._appInfo.featuredProductsXStore).subscribe(products => {

  //             //   products.forEach((product: Product) => {
  //             //     this.gifts.push({ product: product, url: "/store/" + category.id, storeImage: category.logo ? category.logo : '../../../assets/icon/no-image.png' });
  //             //   });

  //             //   this.gifts = this.shuffle(this.gifts);
  //             //   this.searchingGifts = false;
  //             //   this.loadSliderGifts(function () { });
  //             //   subs3.unsubscribe();
  //             // });

  //             // -- COUPONS
  //             // let subs4 = this.storesService.getStoreCouponsXStore(this.appService._appInfo.featuredProductsXStore).subscribe(storeCoupons => {
  //             //   storeCoupons.forEach((storeCoupon: StoreCoupon) => {
  //             //     let today = new Date(new Date().setHours(23, 59, 59, 0));
  //             //     let dateExpiration: any = storeCoupon.dateExpiration;

  //             //     if (today.getTime() <= dateExpiration.toDate().getTime() && storeCoupon.quantity > 0) {
  //             //       this.storeCoupons.push({ storeCoupon: storeCoupon, url: "/store-coupons-detail/" + storeCoupon.id, store: category });
  //             //     }
  //             //   });
  //                 // this.loadSliderStoreCoupons(function () { });
  //                 // subs4.unsubscribe();
  //             // });

  //             // -- PRODUCTS NO FEATURED
  //             // let subs5 = this.productsService.getFeaturedProductsNoFeatured(4).subscribe(products => {

  //             //   let noFeaturedProducts = [];
  //             //   products.forEach((product: Product) => {
  //             //     noFeaturedProducts.push({ product: product, url: "/product-detail/" + product.id });
  //             //   });

  //             //   this.featuredProductsNoFeatured.push({ noFeaturedProducts: this.shuffle(noFeaturedProducts), store: category, url: "/store/" + category.id });

  //             //   this.featuredProductsNoFeatured = this.shuffle(this.featuredProductsNoFeatured);
  //             //   this.searchingProductsNoFeatured = false;
  //             //   this.loadSliderProductsNoFeatured(function () { });
  //             //   subs5.unsubscribe();
  //             // });

  //             this.storeCoupons = this.shuffle(this.storeCoupons);
  //             this.searchingStoreCoupons = false;
  //           }

  //           this.loadSliderStores(function () { });
  //           this.loadSlider(function () { });
  //           this.loadSliderFooter(function () { });
  //         }
  //       });

  //       if (this.categories.length == 0) {
  //         this.searchingProductsDiscount = false;
  //         this.searchingProductsNoDiscount = false;
  //         this.searchingProductsNoFeatured = false;
  //         this.searchingGifts = false;
  //         this.searchingStoreCoupons = false;
  //       }

  //       this.categories = this.shuffle(this.categories);
  //       this.loaderComponent.stopLoading();
  //     });
  //   }, 500);
  // }

  // shuffle(arr) {
  //   let i,
  //     j,
  //     temp;
  //   for (i = arr.length - 1; i > 0; i--) {
  //     j = Math.floor(Math.random() * (i + 1));
  //     temp = arr[i];
  //     arr[i] = arr[j];
  //     arr[j] = temp;
  //   }
  //   return arr;
  // };

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       FILTERS

  storeCategory_OnChange(e: any) {
    // this.idStoreCategory = e.target.value;
    // this.getStores();
  }

  sector_OnChange(e: any) {
    // this.idSector = e.target.value;
    // this.getStores();
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

  async openSearchPage() {
    let modal = await this.popoverController.create({
      component: SearchPage,
      cssClass: 'cs-search-popover',
      backdropDismiss: true,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

      });

    modal.present();
  }

  async openStorePointsPage() {
    if (this.appService.currentUser) {
      let modal = await this.popoverController.create({
        component: StorePointsPage,
        componentProps: { isAdmin: this.appService.currentUser ? this.appService.currentUser.isAdmin : false },
        cssClass: 'cs-popovers',
        backdropDismiss: false,
      });

      modal.onDidDismiss()
        .then((data) => {
          const result = data['data'];
        });

      modal.present();
    } else {
      this.SignIn();
    }
  }

  async openStoreInformationComponent(event) {
    let subs = this.storesService.getActiveVendors().subscribe(result => {

      let vendorPromises = [];
      result.forEach(vendor => {
        vendorPromises.push(this.fillUsers(vendor));
      });

      Promise.all(vendorPromises).then(async users => {
        let modal = await this.popoverController.create({
          component: StoreInformationComponent,
          cssClass: "signin-popover",
          //event: event,
          componentProps: { isAdmin: this.appService.currentUser ? this.appService.currentUser.isAdmin : false, users: users },
          // backdropDismiss: false
        });

        modal.onDidDismiss()
          .then((data) => {
            const result = data['data'];
          });

        modal.present();
      });

      subs.unsubscribe();
    });
  }

  fillUsers(vendor: Vendor) {
    return new Promise((resolve, reject) => {
      this.usersService.getById(vendor.idUser).then(user => {
        resolve(user);
      });
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'fillUsers', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       SLIDER VALIDATIONS

  ionViewDidEnter() {
    this.loadAllSliders(300);

    // this.featuredProductsDiscount = this.shuffle(this.featuredProductsDiscount);
    // this.featuredProductsNoDiscount = this.shuffle(this.featuredProductsNoDiscount);
    // this.featuredProductsNoFeatured = this.shuffle(this.featuredProductsNoFeatured);
    // this.gifts = this.shuffle(this.gifts);
    // this.categories = this.shuffle(this.categories);
  }

  loadAllSliders(timeout) {
    setTimeout(() => {
      this.loadSlider(() => {
        this.loadSliderFooter(() => {
          this.loadSliderStores(() => {
            this.loadSliderProductsDiscount(() => {
              this.loadSliderProductsNoDiscount(() => {
                this.loadSliderGifts(() => {
                  this.loadSliderStoreCoupons(() => {
                    this.loadSliderProductsNoFeatured(() => {
                      this.loadSliderMenu(() => {
                      });
                    });
                  });
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
        this.loadSliderStores(callBack2);
      }
    }, 1000);
  }

  loadSliderProductsDiscount(callBack3) {
    setTimeout(() => {
      if (this.sliderProductsDiscount) {
        this.sliderProductsDiscount.startAutoplay();
        callBack3();
      } else {
        this.loadSliderProductsDiscount(callBack3);
      }
    }, 1000);
  }

  loadSliderProductsNoDiscount(callBack4) {
    setTimeout(() => {
      if (this.sliderProductsNoDiscount) {
        this.sliderProductsNoDiscount.startAutoplay();
        callBack4();
      } else {
        this.loadSliderProductsNoDiscount(callBack4);
      }
    }, 1000);
  }

  loadSliderGifts(callBack6) {
    setTimeout(() => {
      if (this.sliderGifts) {
        this.sliderGifts.startAutoplay();
        callBack6();
      } else {
        this.loadSliderGifts(callBack6);
      }
    }, 1000);
  }

  loadSliderStoreCoupons(callBack7) {
    setTimeout(() => {
      if (this.sliderStoreCoupons) {
        this.sliderStoreCoupons.startAutoplay();
        callBack7();
      } else {
        this.loadSliderStoreCoupons(callBack7);
      }
    }, 1000);
  }

  loadSliderProductsNoFeatured(callBack8) {
    setTimeout(() => {
      if (this.sliderHomeProductsNoFeatured) {
        this.sliderHomeProductsNoFeatured.startAutoplay();
        callBack8();
      } else {
        this.loadSliderProductsNoFeatured(callBack8);
      }
    }, 1000);
  }

  loadSliderMenu(callBack9) {
    setTimeout(() => {
      if (this.sliderMenu) {
        this.sliderMenu.startAutoplay();
        callBack9();
      } else {
        this.loadSliderMenu(callBack9);
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
      //this.initializePage();
      location.reload();
      event.target.complete();
    }, 500);
  }

  takeTemporalCoupon(storeCoupon: any) {
    if (!this.appService.temporalCoupon) {
      this.appService.temporalCoupon = storeCoupon;
    } else {
      this.presentAlert("Ya tienes un cupón en tus manos, debes descartarlo primero si quieres tomar otro", "", () => { });
    }
  }

  async openVendorList(e: any) {

    let subs = this.storesService.getActiveVendors().subscribe(result => {

      let vendorPromises = [];
      result.forEach(vendor => {
        vendorPromises.push(this.fillUsers(vendor));
      });

      Promise.all(vendorPromises).then(async users => {
        let modal = await this.popoverController.create({
          component: VendorsListComponent,
          mode: 'ios',
          event: e,
          componentProps: { users: users },
          cssClass: 'notification-popover'
        });

        modal.onDidDismiss()
          .then((data) => {
            let result = data['data'];
          });

        modal.present();
      });

      subs.unsubscribe();
    });
  }
}