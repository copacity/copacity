import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AlertController, ToastController, PopoverController } from '@ionic/angular';
import { Product, ProductImage, ProductProperty, Store } from 'src/app/app-intefaces';
import { ProductsService } from 'src/app/cs-services/products.service';
import { AppService } from 'src/app/cs-services/app.service';
import { CartService } from 'src/app/cs-services/cart.service';
import { ActivatedRoute, Router } from '@angular/router';

import { CartPage } from '../cart/cart.page';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { StoreStatus } from 'src/app/app-enums';
import { StoresService } from 'src/app/cs-services/stores.service';
import { Subscription } from 'rxjs';
import { ProductPropertiesSelectionComponent } from 'src/app/cs-components/product-properties-selection/product-properties-selection.component';
import { BarcodeScannerComponent } from 'src/app/cs-components/barcode-scanner/barcode-scanner.component';
import { CartInventoryService } from 'src/app/cs-services/cart-inventory.service';
import { VideoPlayerComponent } from 'src/app/cs-components/video-player/video-player.component';
import { SearchPage } from '../search/search.page';
import { CartManagerService } from 'src/app/cs-services/cart-manager.service';
import { MenuCartComponent } from 'src/app/cs-components/menu-cart/menu-cart.component';
import { ReturnsPolicyPage } from '../returns-policy/returns-policy.page';
import { SignupComponent } from 'src/app/cs-components/signup/signup.component';
import { AskForAccountComponent } from 'src/app/cs-components/ask-for-account/ask-for-account.component';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  store: Store;
  cartSevice: CartService;

  @ViewChild('sliderProductDetail', null) slider: any;
  product: Product;
  productImageCollection: ProductImage[] = [];
  @ViewChild('cartProductDetail', { static: false, read: ElementRef }) shoppingCart: ElementRef;
  @ViewChild('video', { static: false, read: ElementRef }) videoIcon: ElementRef;
  isAdmin: boolean = false;

  productProperties: ProductProperty[] = []

  productPropertySubs: Subscription;
  productPropertyOptionSubs: Subscription;

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    public toastController: ToastController,
    public cartManagerService: CartManagerService,
    private route: ActivatedRoute,
    public cartInventoryService: CartInventoryService,
    public alertController: AlertController,
    private angularFireAuth: AngularFireAuth,
    private loaderComponent: LoaderComponent,
    private ngNavigatorShareService: NgNavigatorShareService,
    private storesService: StoresService,
    private productService: ProductsService,
    private popoverController: PopoverController,
    public appService: AppService) {

    this.angularFireAuth.auth.onAuthStateChanged(user => {
      this.initialize(user);
    });

    this.initialize();
  }

  initialize(user?: any) {
    let productId = this.route.snapshot.params.id.toString().split("&")[0];
    let storeId = this.route.snapshot.params.id.toString().split("&")[1];

    this.storesService.getById(storeId).then(result => {
      this.store = result;
      this.cartSevice = this.cartManagerService.getCartService(result);
      this.appService.currentStore = result;

      this.productService.getById(this.appService.currentStore.id, productId).then((productResult: Product) => {
        this.product = productResult;

        let productPropertiesResult = this.productService.getAllProductProperties(this.appService.currentStore.id, this.product.id);

        let subscribe = productPropertiesResult.subscribe(productProperties => {
          productProperties.forEach(productProperty => {
            let productPropertyOptionsResult = this.productService.getAllProductPropertyOptions(this.appService.currentStore.id, this.product.id, productProperty.id);
            let subscribe2 = productPropertyOptionsResult.subscribe(productPropertyOptions => {
              productProperty.productPropertyOptions = productPropertyOptions;
              subscribe2.unsubscribe();
            });
          });

          this.productProperties = productProperties;
          subscribe.unsubscribe();
        });

        let result = this.productService.getProductImages(storeId, productId);
        result.subscribe((productImageResult: ProductImage[]) => {
          if (productImageResult.length == 0 && this.product.image) {
            let img: ProductImage = {
              id: '',
              dateCreated: new Date(),
              deleted: false,
              image: this.product.image
            }

            productImageResult.push(img);
          }

          this.productImageCollection = productImageResult;
        });

        if (user && (this.appService.currentStore.idUser == user.uid)) {
          this.isAdmin = true;
          //this.router.navigate(['/store', this.appService.currentStore.id]);
        } else {
          this.isAdmin = false;
        }

        if (this.appService.currentStore.status != StoreStatus.Published) {
          if (!this.isAdmin) {
            this.router.navigate(['/home']);
          }
        }

        this.animateVideo();
      });
    });
  }

  ngOnInit() {
  }

  async animateVideo() {
    if (this.product && this.product.video) {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
            this.animateVideoCSS('swing');
          }, 3000);
      }).catch(err => { });
    }
  }

  async presentMenuCart(e) {
    const popover = await this.popoverController.create({
      component: MenuCartComponent,
      animated: false,
      showBackdrop: true,
      mode: 'ios',
      translucent: false,
      event: e,
      cssClass: 'notification-popover'
    });

    return await popover.present();
  }

  async popoverReturnsPolicy() {
    const popover = await this.popoverController.create({
      component: ReturnsPolicyPage,
      cssClass: "cs-popovers"
    });

    popover.onDidDismiss()
      .then((data) => {
        let result = data['data'];
      });

    return await popover.present();
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

  async openVideoPlayerComponent(e: any, url: string) {
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
      });

    modal.present();
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

  slideOpts = {
    // initialSlide: 0,
    // slidesPerView: 1,
    // autoplay: true,
    pager: true,
    // loop: true,
    // speed: 3000
    pagination: {
      el: '.swiper-pagination',
      type: 'fraction',
      renderFraction: function (currentClass, totalClass) {
        return '<div style="font-weight:bolder;font-size: 1.5em;text-align: -webkit-center;"><div style="width:70px;background-color: white;opacity:.8">' +
          '<span  class="' + currentClass + '"></span>' +
          ' / ' +
          '<span class="' + totalClass + '"></span></div></div>';
      }
    }
  };

  close() {
    this.router.navigate(['/store', this.appService.currentStore.id]);
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
        //this.popoverCtrl.dismiss();
        this.presentToast("Has abandonado la sesión!");
        this.loaderComponent.stopLoading();
      }, 500);
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

  getImage(img, resolve) {
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    let context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    canvas.toBlob(function (blob) {

      let metadata = {
        type: 'image/png'
      };

      resolve(new File([blob], "data.png", metadata));

    }, 'image/png')
  }

  createFile() {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = () => {
        setTimeout(() => {
          this.getImage(img, resolve)
        }, 300);
      };

      img.src = this.product.image;
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'createFile', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  shareProduct(e) {
    if (this.appService.currentStore.status == StoreStatus.Published) {
      this.createFile().then(file => {
        let navigator: any = window.navigator;
        let filesArray = [];
        filesArray.push(file);

        if (navigator.canShare && navigator.canShare({ files: filesArray })) {
          navigator.share({
            files: filesArray,
            title: this.appService.currentStore.name,
            text: "Aprovecha y adquiere en Copacity.net " + this.product.name + ((this.product.discount && this.product.discount > 0) ? (" con el " +
              this.product.discount + "% de descuento!!") : "") + ". Tenemos muchos mas productos relacionados en la tienda " + this.appService.currentStore.name + " para tí. Si quieres ver mas detalles de este producto ingresa a: ",
            url: this.appService._appInfo.domain + "/product-detail/" + this.product.id + "&" + this.appService.currentStore.id
          })
            .then(() => console.log('Share was successful.'))
            .catch((error) => console.log('Sharing failed', error));
        } else {
          console.log(`Your system doesn't support sharing files.`);
          this.openCopyToClipBoardProduct(e);
        }
      });
    } else {
      this.presentAlert("Solo puedes compartir tu tienda cuando este aprobada y publicada. Gracias", "", () => { });
    }
  }

  async openCopyToClipBoardProduct(e) {

    let text = "Aprovecha y adquiere en Copacity.net " + this.product.name + ((this.product.discount && this.product.discount > 0) ? (" con el " +
      this.product.discount + "% de descuento!!") : "") + ". Tenemos muchos mas productos relacionados en la tienda: " + this.appService.currentStore.name + " para tí. Si quieres ver mas detalles de este producto ingresa a: " + this.appService._appInfo.domain + "/product-detail/" + this.product.id + "&" + this.appService.currentStore.id;

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

  async openCart() {
    let modal = await this.popoverCtrl.create({
      component: CartPage,
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
    this.router.navigate(['/order-create', this.appService.currentStore.id]);
  }

  async openImageViewer(image: string) {
    let images: string[] = [];
    images.push(image);

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

  addToCart(e: any) {
    if (!this.isAdmin) {
      this.cartInventoryService.clearCart();
      let subs = this.productService.getCartInventory(this.appService.currentStore.id, this.product.id)
        .subscribe((cartP) => {
          let productPropertiesResult = this.productService.getAllProductPropertiesUserSelectable(this.appService.currentStore.id, this.product.id);

          let subscribe = productPropertiesResult.subscribe(async productProperties => {
            productProperties.forEach(productProperty => {
              let productPropertyOptionsResult = this.productService.getAllProductPropertyOptions(this.appService.currentStore.id, this.product.id, productProperty.id);
              let subscribe2 = productPropertyOptionsResult.subscribe(productPropertyOptions => {
                productProperty.productPropertyOptions = productPropertyOptions;
                subscribe2.unsubscribe();
              });
            });

            productProperties = productProperties;
            subscribe.unsubscribe();

            let modal = await this.popoverCtrl.create({
              component: ProductPropertiesSelectionComponent,
              mode: 'ios',
              event: e,
              componentProps: { store: this.store, isInventory: false, product: this.product, productProperties: productProperties, cart: cartP, limitQuantity: 0, quantityByPoints: -1 },
              backdropDismiss: false,
            });

            modal.onDidDismiss()
              .then((data) => {
                const result = data['data'];

                if (result) {
                  this.animateCSS('tada');
                  this.cartSevice.addProduct(result);
                  this.presentToast(this.product.name + ' ha sido agregado al carrito!');
                  this.close();
                }
              });

            modal.present();
          });

          subs.unsubscribe();
        });
    } else {
      this.presentAlert("No puedes agregar productos al carrito por que eres el administrador de esta tienda. Gracias", "", () => { });
    }
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

  animateVideoCSS(animationName: any, keepAnimated = false) {

    const node = this.videoIcon.nativeElement;
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
      if (!keepAnimated) {
        node.classList.remove('animated', animationName);
      }

      node.removeEventListener('animationend', handleAnimationEnd)
    }

    node.addEventListener('animationend', handleAnimationEnd)
  }

  ionViewDidEnter() {
    this.animateVideo();
    try { this.slider.startAutoplay(); } catch (error) { }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      buttons: ['Cerrar']
    });
    toast.present();
  }
}
