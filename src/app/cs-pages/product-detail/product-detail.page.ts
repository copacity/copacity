import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AlertController, ToastController, PopoverController, LoadingController } from '@ionic/angular';
import { Product, ProductImage, ProductProperty, Category } from 'src/app/app-intefaces';
import { ProductsService } from 'src/app/cs-services/products.service';
import { AppService } from 'src/app/cs-services/app.service';
import { CartService } from 'src/app/cs-services/cart.service';
import { ActivatedRoute, Router } from '@angular/router';

import { CartPage } from '../cart/cart.page';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { StoreStatus } from 'src/app/app-enums';
import { Subscription } from 'rxjs';
import { ProductPropertiesSelectionComponent } from 'src/app/cs-components/product-properties-selection/product-properties-selection.component';
import { BarcodeScannerComponent } from 'src/app/cs-components/barcode-scanner/barcode-scanner.component';
import { CartInventoryService } from 'src/app/cs-services/cart-inventory.service';
import { VideoPlayerComponent } from 'src/app/cs-components/video-player/video-player.component';
import { SearchPage } from '../search/search.page';
import { CartManagerService } from 'src/app/cs-services/cart-manager.service';
import { ReturnsPolicyPage } from '../returns-policy/returns-policy.page';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { MenuService } from 'src/app/cs-services/menu.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  loading: HTMLIonLoadingElement;

  category: Category;
  cartSevice: CartService;

  @ViewChild('sliderProductDetail', null) slider: any;
  product: Product;
  productImageCollection: ProductImage[] = [];
  @ViewChild('cartHome', { static: false, read: ElementRef }) shoppingCart: ElementRef;
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
    public menuService: MenuService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private loadingCtrl: LoadingController,
    private productService: ProductsService,
    private popoverController: PopoverController,
    public appService: AppService) {

    this.angularFireAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.appService.updateUserData(user.uid).then(() => {
          {
            this.initialize(user);
          }
        });
      }
    });

    this.initialize();
    this.appService.loadCustomScript();
  }

  initialize(user?: any) {
    let productId = this.route.snapshot.params.id;
    this.cartSevice = this.cartManagerService.getCartService();

    this.productService.getById(productId).then((productResult: Product) => {
      this.product = productResult;

      let productPropertiesResult = this.productService.getAllProductProperties(this.product.id);

      let subscribe = productPropertiesResult.subscribe(productProperties => {
        productProperties.forEach(productProperty => {
          let productPropertyOptionsResult = this.productService.getAllProductPropertyOptions(this.product.id, productProperty.id);
          let subscribe2 = productPropertyOptionsResult.subscribe(productPropertyOptions => {
            productProperty.productPropertyOptions = productPropertyOptions;
            subscribe2.unsubscribe();
          });
        });

        this.productProperties = productProperties;
        subscribe.unsubscribe();
      });

      let result = this.productService.getProductImages(productId);
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

      if (user && (this.appService.currentUser.isAdmin)) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }

      // if (this.appService.currentCategory.status != StoreStatus.Published) {
      //   if (!this.isAdmin) {
      //     this.router.navigate(['/home']);
      //   }
      // }

      this.animateVideo();
    });
  }


  back() {
    window.history.back();
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

  async popoverReturnsPolicy() {
    const popover = await this.popoverController.create({
      component: ReturnsPolicyPage,
      cssClass: "cs-popovers",
      componentProps: { returnsPolicy: this.appService._appInfo.returnsPolicyTemplate }
    });

    popover.onDidDismiss()
      .then((data) => {
        let result = data['data'];
      });

    return await popover.present();
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
        return '<div style="font-weight:bolder;font-size: 1.5em;text-align: -webkit-center;"><div style="width:70px;background-color: white;opacity:.8" class="color-black">' +
          '<span  class="' + currentClass + ' color-black"></span>' +
          ' / ' +
          '<span class="' + totalClass + ' color-black"></span></div></div>';
      }
    }
  };

  close() {
    this.router.navigate(['app/store', this.product.idCategory]);
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
    if (this.appService.currentCategory.status == StoreStatus.Published) {
      this.createFile().then(file => {
        let navigator: any = window.navigator;
        let filesArray = [];
        filesArray.push(file);

        if (navigator.canShare && navigator.canShare({ files: filesArray })) {
          navigator.share({
            files: filesArray,
            title: "Copacity",
            text: "Aprovecha y adquiere en Copacity.net " + this.product.name + ((this.product.discount && this.product.discount > 0) ? (" con el " +
              this.product.discount + "% de descuento!!") : "") + ". Tenemos muchos mas productos relacionados para tí. Si quieres ver mas detalle de este producto ingresa a: ",
            url: this.appService._appInfo.domain + "/app/product-detail/" + this.product.id
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
      this.product.discount + "% de descuento!!") : "") + ". Tenemos muchos mas productos relacionados para tí. Si quieres ver mas detalles de este producto ingresa a: " + this.appService._appInfo.domain + "/app/product-detail/" + this.product.id;

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

  async addToCart(e: any) {
    if (!this.isAdmin) {
      this.loading = await this.loadingCtrl.create({});
      this.loading.present();

      this.cartInventoryService.clearCart();
      let subs = this.productService.getCartInventory(this.product.id)
        .subscribe((cartP) => {
          let productPropertiesResult = this.productService.getAllProductPropertiesUserSelectable(this.product.id);

          let subscribe = productPropertiesResult.subscribe(async productProperties => {
            productProperties.forEach(productProperty => {
              let productPropertyOptionsResult = this.productService.getAllProductPropertyOptions(this.product.id, productProperty.id);
              let subscribe2 = productPropertyOptionsResult.subscribe(productPropertyOptions => {
                productProperty.productPropertyOptions = productPropertyOptions;
                subscribe2.unsubscribe();
              });
            });

            productProperties = productProperties;
            subscribe.unsubscribe();

            if (this.loading) {
              await this.loading.dismiss();
              this.loading = null;
            }

            let modal = await this.popoverCtrl.create({
              component: ProductPropertiesSelectionComponent,
              mode: 'ios',
              event: e,
              componentProps: { isInventory: false, product: this.product, productProperties: productProperties, cart: cartP, limitQuantity: 0, quantityByPoints: -1 },
              backdropDismiss: false,
            });

            modal.onDidDismiss()
              .then((data) => {
                const result = data['data'];

                if (result) {
                  this.animateCSS('tada');
                  this.cartSevice.addProduct(result);
                  this.appService.presentToastCart(this.product.name + ' ha sido agregado al carrito!', this.product.image);
                  //this.close();
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
            this.router.navigate(['app/product-detail/', value[value.length - 1]]);
          } else if (result.indexOf("store") != -1) {
            let value = result.toString().split("/");
            this.router.navigate(['app/store/', value[value.length - 1]]);
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
}
