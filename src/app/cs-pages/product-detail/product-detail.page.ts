import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AlertController, ToastController, PopoverController } from '@ionic/angular';
import { Product, ProductImage, ProductProperty } from 'src/app/app-intefaces';
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

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  @ViewChild('sliderProductDetail', null) slider: any;
  product: Product;
  productImageCollection: ProductImage[] = [];
  @ViewChild('cart', { static: false, read: ElementRef }) shoppingCart: ElementRef;
  isAdmin: boolean = false;

  productProperties: ProductProperty[] = []

  productPropertySubs: Subscription;
  productPropertyOptionSubs: Subscription;

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    public toastController: ToastController,
    private route: ActivatedRoute,
    public cartSevice: CartService,
    public alertController: AlertController,
    private angularFireAuth: AngularFireAuth,
    private loaderComponent: LoaderComponent,
    private ngNavigatorShareService: NgNavigatorShareService,
    public cartService: CartService,
    private storesService: StoresService,
    private productService: ProductsService,
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
          this.router.navigate(['/store', this.appService.currentStore.id]);
        } else {
          this.isAdmin = false;
        }

        if (this.appService.currentStore.status != StoreStatus.Published) {
          if (!this.isAdmin) {
            this.router.navigate(['/home']);
          }
        }
      });
    });
  }

  ngOnInit() {
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
        return '<div style="font-weight:bolder;font-size: 1.5em;text-align: -webkit-center;"><div style="width:70px;background-color: white;">' +
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
    const popover = await this.popoverCtrl.create({
      component: SigninComponent,
      cssClass: "signin-popover",
    });
    return await popover.present();
  }


  signOut() {
    this.presentConfirm("Estas seguro que deseas cerrar la sesion?", () => {
      this.loaderComponent.startLoading("Cerrando Sesion, por favor espere un momento...")
      setTimeout(() => {
        this.angularFireAuth.auth.signOut();
        //this.popoverCtrl.dismiss();
        this.presentToast("Has abandonado la sesión!");
        this.loaderComponent.stopLoading();
      }, 2000);
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
    return new Promise(resolve => {
      let img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = () => {
        setTimeout(() => {
          this.getImage(img, resolve)
        }, 300);
      };

      img.src = this.product.image;
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
            text: "Aprovecha y adquiere aquí " + this.product.name + ((this.product.discount && this.product.discount > 0) ? (" con el " +
              this.product.discount + "% de descuento!!") : "") + ". Visita nuestra tienda virtual " + this.appService.currentStore.name + " en CopaCity. Para ver mas detalles de este producto ingresa a: ",
            url: this.appService._appInfo.domain + "/product-detail/" + this.product.id + "&" + this.appService.currentStore.id
          })
            .then(() => console.log('Share was successful.'))
            .catch((error) => console.log('Sharing failed', error));
        } else {
          console.log(`Your system doesn't support sharing files.`);
          this.openCopyToClipBoardProduct(e);
        }
      });

      // this.ngNavigatorShareService.share({
      //   title: this.appService.currentStore.name,
      //   text: "Aprovecha y adquiere aquí " + this.product.name + ((this.product.discount && this.product.discount > 0) ? (" con el " +
      //     this.product.discount + "% de descuento!!") : "") + ". Para ver mas detalles de este producto ingresa a " + this.appService._appInfo.domain + "/product-detail/" + this.product.id + "&" + this.appService.currentStore.id,
      //   url: this.product.image
      // }).then((response) => {
      //   console.log(response);
      // })
      //   .catch((error) => {
      //     console.log(error);

      //     if (error.error.toString().indexOf("not supported") != -1) {
      //       this.openCopyToClipBoardProduct(e);
      //     }
      //   });
    } else {
      this.presentAlert("Solo puedes compartir tu tienda cuando este aprobada y publicada. Gracias", "", () => { });
    }
  }

  async openCopyToClipBoardProduct(e) {

    let text = "Aprovecha y adquiere aquí " + this.product.name + ((this.product.discount && this.product.discount > 0) ? (" con el " +
      this.product.discount + "% de descuento!!") : "") + ". Visita nuestra tienda virtual " + this.appService.currentStore.name + " en CopaCity. Para ver mas detalles de este producto ingresa a: " + this.appService._appInfo.domain + "/product-detail/" + this.product.id + "&" + this.appService.currentStore.id;

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
      text: 'Hola ingresa a copacity.net y podrás buscar tiendas en Copacabana, comprar productos y recibirlos a domicilio!',
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
    let text = 'Hola ingresa a copacity.net, y podrás buscar tiendas en Copacabana, comprar productos y recibirlos a domicilio! ' + this.appService._appInfo.domain;

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
    this.router.navigate(['/order-create']);
  }

  addToCart(e: any) {

    let productProperties: ProductProperty[] = []

      let productPropertySubs: Subscription;
      let productPropertyOptionSubs: Subscription;
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
          componentProps: { product: this.product, productProperties: productProperties},
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

    // this.animateCSS('tada');

    // let cartProduct: CartProduct = {
    //   id: '',
    //   product: this.product,
    //   quantity: 1,
    //   checked: true,
    //   dateCreated: new Date(),
    //   lastUpdated: new Date(),
    //   deleted: false,
    //   propertiesSelection: []

    // };

    // this.cartService.addProduct(cartProduct);
    // this.presentToast(this.product.name + ' ha sido agregado al carrito!');

    // this.close();
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

  ionViewDidEnter() {
    try { this.slider.startAutoplay(); } catch (error) { }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
  }
}
