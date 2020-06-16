import { LocationStrategy } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, ModuleWithComponentFactories } from '@angular/core';
import { AlertController, PopoverController, ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { AppService } from 'src/app/cs-services/app.service';
import { CartService } from 'src/app/cs-services/cart.service';
import { ProductsService } from 'src/app/cs-services/products.service';
import { ProductCategoriesService } from 'src/app/cs-services/productCategories.service';
import { Product, Store, ProductCategory, Order, File, ProductProperty } from 'src/app/app-intefaces';
import { CartPage } from '../cart/cart.page';
import { SuperTabs } from '@ionic-super-tabs/angular';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { StoresService } from 'src/app/cs-services/stores.service';
import { StoreUpdatePage } from '../store-update/store-update.page';
import { ProductUpdatePage } from '../product-update/product-update.page';
import { ProductCreatePage } from '../product-create/product-create.page';
import { StorageService } from 'src/app/cs-services/storage.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ProductCategoriesPage } from '../product-categories/product-categories.page';
import { OrdersService } from 'src/app/cs-services/orders.service';
import { OrderStatus, StoreStatus } from 'src/app/app-enums';
import { OrderDetailPage } from '../order-detail/order-detail.page';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { StoreCategoryNamePipe } from 'src/app/cs-pipes/store-category-name.pipe';
import { SectorNamePipe } from 'src/app/cs-pipes/sector-name.pipe';
import { SectorsService } from 'src/app/cs-services/sectors.service';
import { StoreCategoriesService } from 'src/app/cs-services/storeCategories.service';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { CropperImageComponent } from 'src/app/cs-components/cropper-image/cropper-image.component';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { StoreInformationComponent } from 'src/app/cs-components/store-information/store-information.component';
import { ProductPropertiesSelectionComponent } from 'src/app/cs-components/product-properties-selection/product-properties-selection.component';
import { StorePointsPage } from '../store-points/store-points.page';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { BarcodeScannerComponent } from 'src/app/cs-components/barcode-scanner/barcode-scanner.component';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
})
export class StorePage implements OnInit {

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------      MAIN VARIABLES 

  @ViewChild('cart', { static: false, read: ElementRef }) shoppingCart: ElementRef;
  @ViewChild(SuperTabs, { static: false }) superTabs: SuperTabs;
  photo: SafeResourceUrl;
  store: Store;
  isAdmin: boolean = false;

  file: File;
  public imagePath;

  // @ViewChild('sliderStoreMain', null) slider: any;
  // @ViewChild('sliderStoreProducts', null) slider2: any;
  // @ViewChild('sliderStoreOrders', null) slider3: any;

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------      PRODUCTS VARIABLES 

  products: Observable<Product[]>;
  productCategories: Observable<ProductCategory[]>;
  cart = [];
  cartItemCount: BehaviorSubject<number>;

  storeCategoryName: string;
  sectorName: string;

  productsBatch: number = 50;
  lastProductToken: string = '';
  idProductCategory: string = '0';
  productCategoriesCount: number = 0;
  searchingProducts: boolean = false;
  productSearchHits: number = 0;
  productSearchText: string = '';

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------      ORDERS VARIABLES 

  orders: Observable<Order[]>;
  ordersBatch: number = 20;
  lastOrderToken: Date = null;
  idOrderState: number = 0;
  searchingOrders: boolean = false;

  orderSearchHits = 0;
  orderSearchText: string = '';

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------      CONSTRUCTOR 
  constructor(
    private router: Router,
    public toastController: ToastController,
    public alertController: AlertController,
    public popoverController: PopoverController,
    private route: ActivatedRoute,
    private loaderComponent: LoaderComponent,
    public cartSevice: CartService,
    public appService: AppService,
    private storageService: StorageService,
    private storesService: StoresService,
    private angularFireAuth: AngularFireAuth,
    private productsService: ProductsService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private productCategoriesService: ProductCategoriesService,
    private storeCategoryNamePipe: StoreCategoryNamePipe,
    private sectornamePipe: SectorNamePipe,
    private sectorService: SectorsService,
    private storeCategoryService: StoreCategoriesService,
    private locationStrategy: LocationStrategy,
    private ordersService: OrdersService
  ) {

    history.pushState(null, null, window.location.href);
    this.locationStrategy.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    this.angularFireAuth.auth.onAuthStateChanged(user => {
      this.storesService.getById(this.route.snapshot.params.id).then(result => {
        this.store = result;

        if (user && (this.store.idUser == user.uid)) {
          this.isAdmin = true;
        } else {
          this.isAdmin = false;
        }

        if (this.store.status != StoreStatus.Published) {
          if (!this.isAdmin) {
            this.router.navigate(['/home']);
          }
        }

        this.initialize();
      });
    });
  }

  initialize() {
    if (this.appService.currentStore && this.appService.currentStore.id != this.store.id) {
      this.cartSevice.clearCart();
    }

    if (!this.appService.currentStore) {
      this.cartSevice.clearCart();
    }

    this.appService.currentStore = this.store;
    this.productCategories = this.productCategoriesService.getAll(this.route.snapshot.params.id);

    this.productCategories.subscribe(pcArray => {
      this.productCategoriesCount = pcArray.length;
    });

    this.cart = this.cartSevice.getCart();
    this.cartItemCount = this.cartSevice.getCartItemCount();
    this.loaderComponent.stopLoading();

    this.getProducts(this.idProductCategory);

    this.idOrderState = OrderStatus.Pending;
    //this.getOrders(OrderStatus.Pending);

    this.storeCategoryService.getAll().subscribe(storeCategoriesArray => {
      this.appService._storeCategories.forEach(storeCategory => {
        if (storeCategory.id == this.store.idStoreCategory) {
          this.storeCategoryName = storeCategory.name;
        }
      });
    });

    this.sectorService.getAll().subscribe(sectorArray => {
      this.appService._sectors.forEach(sector => {
        if (sector.id == this.store.idSector) {
          this.sectorName = sector.name;
        }
      });
    });

    // Incrementing the visits
    // if (!this.isAdmin)
    //   this.storesService.update(this.store.id, { visits: (this.store.visits + 1) });
  }

  ngOnInit() {

  }

  async SignIn() {
    const popover = await this.popoverController.create({
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
        this.popoverController.dismiss();
        this.presentToast("Has abandonado la sesión!", null);
        this.loaderComponent.stopLoading();
      }, 2000);
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

  doRefreshMain(event) {
    setTimeout(() => {
      this.angularFireAuth.auth.onAuthStateChanged(user => {
        this.storesService.getById(this.route.snapshot.params.id).then(result => {
          this.store = result;

          if (user && (this.store.idUser == user.uid)) {
            this.isAdmin = true;
          } else {
            this.isAdmin = false;
          }

          if (this.store.status != StoreStatus.Published) {
            if (!this.isAdmin) {
              this.router.navigate(['/home']);
            }
          }

          this.initialize();
        });
      });
      event.target.complete();
    }, 2000);
  }

  close() {

    this.presentConfirm("Esta seguro que desea salir de " + this.store.name + "?", () => {
      this.router.navigate(['/home']);
    });
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

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       MAIN TAB

  async openStoreUpdatePage() {

    let modal = await this.popoverController.create({
      component: StoreUpdatePage,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
        if (updated) {
          this.store.name = this.appService.currentStore.name;
          this.store.idSector = this.appService.currentStore.idSector;
          this.store.idStoreCategory = this.appService.currentStore.idStoreCategory;
          this.store.description = this.appService.currentStore.description;

          this.storeCategoryName = this.storeCategoryNamePipe.transform(this.store.idStoreCategory);
          this.sectorName = this.sectornamePipe.transform(this.store.idSector);
        }
      });

    modal.present();
  }

  async openCropperImageComponent(imageUrl: any) {

    let modal = await this.popoverController.create({
      component: CropperImageComponent,
      cssClass: 'cs-popovers',
      componentProps: { image: imageUrl },
      backdropDismiss: false
    });

    modal.onDidDismiss()
      .then((data) => {
        const image = data['data'];
        if (image) {
          this.loaderComponent.startLoading("Actualizando imagen, por favor espere un momento...");
          setTimeout(() => {
            this.storageService.ResizeImage(image, this.appService.currentStore.id, 500, 500).then((url) => {
              this.storesService.update(this.appService.currentStore.id, { logo: url }).then(result => {
                this.loaderComponent.stopLoading();
                this.store.logo = url.toString();
                this.presentAlert("Tu foto ha sido actualizada exitosamente!", "", () => { });
              });
            });
          }, 2000);
        }
      });

    modal.present();
  }

  async openStoreInformationComponent(event) {

    let modal = await this.popoverController.create({
      component: StoreInformationComponent,
      cssClass: 'cs-popovers',
      //event: event,
      componentProps: { store: this.store, isAdmin: this.isAdmin, storeCategoryName: this.storeCategoryName },
      // backdropDismiss: false
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

        if (result) {
          this.store = result;
        }
      });

    modal.present();
  }

  shareStore(e) {

    if (this.store.status == StoreStatus.Published) {
      this.ngNavigatorShareService.share({
        title: this.store.name,
        text: 'Hola! Visita nuestra tienda: ' + this.store.name + ' y sorprendete con todos los productos, promociones, cupones y regalos que tenemos para ti!. En Copacity, Tu Centro Comercial Virtual',
        url: this.appService._appInfo.domain + "/store/" + this.store.id
      }).then((response) => {
        console.log(response);
      })
        .catch((error) => {
          console.log(error);

          if (error.error.toString().indexOf("not supported") != -1) {
            this.openCopyToClipBoard(e);
          }
        });
    } else {
      this.presentAlert("Solo puedes compartir tu tienda cuando este aprobada y publicada. Gracias", "", () => { });
    }
  }

  shareApp(e) {
    this.ngNavigatorShareService.share({
      title: "COPACITY",
      text: 'Hola ingresa a copacity.net donde podrás ver nuestras tiendas con variedad de productos para ti, promociones, cupones con descuentos, tambien puedes acumular puntos y obtener regalos, todo te lo llevamos hasta la puerta de tu casa!',
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
    let text = 'Hola! Visita nuestra tienda: ' + this.store.name + ' y sorprendete con todos los productos, promociones, cupones y regalos que tenemos para ti!. En Copacity, Tu Centro Comercial Virtual. ' + this.appService._appInfo.domain + "/store/" + this.store.id;

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

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       PRODUCTS TAB

  async addToCart(e: any, product: Product) {

    if (!product.soldOut) {
      let productPropertiesResult = this.productsService.getAllProductPropertiesUserSelectable(this.appService.currentStore.id, product.id);

      let subscribe = productPropertiesResult.subscribe(async productProperties => {
        productProperties.forEach(productProperty => {
          let productPropertyOptionsResult = this.productsService.getAllProductPropertyOptions(this.appService.currentStore.id, product.id, productProperty.id);
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
          componentProps: { product: product, productProperties: productProperties, limitQuantity: 100 }
        });

        modal.onDidDismiss()
          .then((data) => {
            const result = data['data'];

            if (result) {
              this.animateCSS('tada');
              this.cartSevice.addProduct(result);
              this.presentToast(product.name + ' ha sido agregado al carrito!', result.product.image);
            }
          });

        modal.present();
      });
    }
  }

  async openCart() {
    let modal = await this.popoverController.create({
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

  goToProducts() {

    this.superTabs.selectTab(1);
  }

  goToOrders() {

    this.superTabs.selectTab(2);
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

  productCategory_OnChange(e: any) {

    //this.products = [];
    this.idProductCategory = e.target.value;

    setTimeout(() => {
      this.getProducts(e.target.value)
    }, 1000);
  }

  searchProducts(event) {
    this.productSearchText = event.target.value.toString().trim().toUpperCase();
    this.getProducts(this.idProductCategory);
  }

  getProducts(idProductCategory: string) {
    //this.lastProductToken = (this.products.length != 0 ? this.products[this.products.length - 1].name : '');
    this.products = null;
    this.searchingProducts = true;
    this.productSearchHits = 0;

    setTimeout(() => {
      this.products = this.productsService.getBySearchAndCategory(this.route.snapshot.params.id, this.productSearchText, idProductCategory);

      this.products.subscribe((products) => {
        this.searchingProducts = false;
        products.forEach(product => {
          if (product) {
            this.productSearchHits++;
          }
        });
      });
    }, 2000);


    // this.appService.appSubcriptions_Products.push(this.productsService.getByProductCategoryId(this.route.snapshot.params.id, idProductCategory, this.productsBatch, this.lastProductToken).subscribe(productArray => {
    //   this.products = (this.products ? this.products.concat(productArray) : productArray);
    //   this.appService.closeAppSubcriptions_Products();
    // }));
  }

  async openProductUpdatePage(product: Product) {
    //this.router.navigate(['product-update/' + product.id + "&" + this.store.id]);

    let modal = await this.popoverController.create({
      component: ProductUpdatePage,
      componentProps: product,
      backdropDismiss: false,
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];

      });

    modal.present();
  }

  async openProductCreatePage() {

    if (this.appService.currentStore.productsCount < this.appService.currentStore.productsLimit) {
      if (this.productCategoriesCount != 0) {
        //this.router.navigate(['/product-create', this.appService.currentStore.id]);
        let modal = await this.popoverController.create({
          component: ProductCreatePage,
          componentProps: { isGift: false },
          cssClass: 'cs-popovers',
          backdropDismiss: false,
        });

        modal.onDidDismiss()
          .then((data) => {
            const updated = data['data'];
            // this.products = [];
            // this.getProducts(this.idProductCategory);
          });

        modal.present();
      } else {
        this.presentAlert("Antes de crear un producto debes tener al menos una Sección o Categroría creada, puedes ir al boton 'Crear Sección o Categroría' para continuar", "", () => { })
      }
    } else {
      this.presentAlert("Ha llegado al limite máximo de productos en su tienda, Si necesita crear mas productos comuníquese con CopaCity para incrementar la capacidad. Gracias.", "", () => { })
    }
  }

  async openProductCategoriesdPage() {

    let modal = await this.popoverController.create({
      component: ProductCategoriesPage,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
        //this.getProducts('0');
      });

    modal.present();
  }

  async openProductDetailPage(idProduct: string) {
    this.router.navigate(['product-detail/' + idProduct + "&" + this.store.id]);

    // let modal = await this.popoverController.create({
    //   component: ProductDetailPage,
    //   componentProps: { id: idProduct, isAdmin: this.isAdmin },
    //   cssClass: 'cs-popovers'
    // });

    // modal.onDidDismiss()
    //   .then((data) => {
    //     const updated = data['data'];

    //     if (updated) {
    //       this.animateCSS('tada');
    //     }
    //   });

    // modal.present();
  }

  async openProduct(product: Product) {
    if (!product.soldOut) {
      if (!this.isAdmin) {
        this.openProductDetailPage(product.id);
      } else {
        this.openProductUpdatePage(product);
      }
    }
  }

  productSoldOut(e: any, product: Product) {
    this.productsService.update(this.appService.currentStore.id, product.id, { soldOut: !e.detail.checked });
  }

  async presentDeleteProductPrompt(product: Product) {
    this.presentConfirm('Esta seguro que desea eliminar el producto: ' + product.name + '?', () => {
      this.productsService.update(this.appService.currentStore.id, product.id, { deleted: true }).then(() => {
        this.appService.currentStore.productsCount = this.appService.currentStore.productsCount - 1
        this.storesService.update(this.appService.currentStore.id, { productsCount: this.appService.currentStore.productsCount }).then(() => {
          this.presentAlert("Producto eliminado exitosamente!", '', () => { });
        });
      });
    });
  }

  async uploadFile(event: any) {
    this.file = {
      file: '',
      downloadURL: null,
      filePath: ''
    };

    this.file.file = event.target.files[0];

    var mimeType = this.file.file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.presentAlert("Solo se admiten imagenes", "", () => { });
      return;
    }

    var reader = new FileReader();
    this.imagePath = event.target.files;
    reader.readAsDataURL(this.file.file);
    reader.onload = (_event) => {
      // this.storageService.ResizeImage2(reader.result.toString(), this.appService.currentStore.id, 500, 500).then((image) => {
      //   this.openCropperImageComponent(image);
      // });
      this.openCropperImageComponent(reader.result);
    }
  }

  takePicture() {

    this.storageService.takePhoto(this.appService.currentStore.id, 500, 500).then((url) => {
      this.loaderComponent.startLoading("Actualizando foto, por favor espere un momento...");
      this.storesService.update(this.appService.currentStore.id, { logo: url }).then(result => {
        this.store.logo = url.toString();
        this.presentAlert("Tu foto ha sido actualizada exitosamente!", "", () => { });
      });
    });
  }

  sendToPublish() {

    this.loaderComponent.startLoading("Enviando tienda para revision. por favor espere un momento...");
    setTimeout(() => {
      this.storesService.update(this.store.id, { status: StoreStatus.Pending }).then(result => {
        this.storesService.getById(this.store.id).then(result => {
          this.loaderComponent.stopLoading();
          this.store = result;
        });
      });
    }, 3000);
  }

  loadMoreProducts(event) {

    // if (this.lastProductToken != ((this.products && this.products.length != 0) ? this.products[this.products.length - 1].name : '' || this.lastProductToken == '')) {
    //   this.getProducts(this.idProductCategory);
    // }

    // event.target.complete();
  }

  doRefreshProducts(event) {
    setTimeout(() => {
      //this.products = [];
      this.getProducts(this.idProductCategory);
      event.target.complete();
    }, 2000);
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       ORDERS TAB

  searchOrders(event) {
    this.orderSearchText = event.target.value;
    this.getOrders(this.idOrderState);
  }

  getOrders(state: number) {
    this.orders = null;
    this.orderSearchHits = 0;
    this.searchingOrders = true;

    setTimeout(() => {
      if (this.appService.currentUser) {
        //this.lastOrderToken = (this.orders.length != 0 ? this.orders[this.orders.length - 1].dateCreated : null);

        if (this.isAdmin) {
          this.orders = this.ordersService.getByState(this.store.id, state, this.orderSearchText);

          this.orders.subscribe(result => {
            this.searchingOrders = false;
            result.forEach(order => {
              if (order) {
                this.orderSearchHits++;
              }
            });
          });

          // this.appService.appSubcriptions_Orders.push(this.ordersService.getByState(this.store.id, state, this.ordersBatch, this.lastOrderToken).subscribe(orderArray => {
          //   this.orders = (this.orders ? this.orders.concat(orderArray) : orderArray);
          //   this.appService.closeAppSubcriptions_Orders();
          // }));
        } else {

          this.orders = this.ordersService.getByUserAndState(this.appService.currentUser.id, this.store.id, state, this.orderSearchText)

          this.orders.subscribe(result => {
            this.searchingOrders = false;
            result.forEach(order => {
              if (order) {
                this.orderSearchHits++;
              }
            });
          });

          // this.appService.appSubcriptions_Orders.push(this.ordersService.getByUserAndState(this.appService.currentUser.id, this.store.id, state, this.ordersBatch, this.lastOrderToken).subscribe(orderArray => {
          //   this.orders = (this.orders ? this.orders.concat(orderArray) : orderArray);
          //   this.appService.closeAppSubcriptions_Orders();
          // }));
        }
      } else {
        this.searchingOrders = false;
      }
    }, 1000);
  }

  async openOrderDetailPage(idOrder: string) {

    let modal = await this.popoverController.create({
      component: OrderDetailPage,
      componentProps: { id: idOrder, idStore: this.appService.currentStore.id },
      cssClass: 'cs-popovers'
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
      });

    modal.present();
  }

  loadMoreOrders(event) {

    // if (this.lastOrderToken != ((this.orders && this.orders.length != 0) ? this.orders[this.orders.length - 1].dateCreated : null || this.lastOrderToken == null)) {
    //   this.getOrders(this.idOrderState);
    // }

    // event.target.complete();
  }

  orderStates_OnChange(event) {
    this.idOrderState = parseInt(event.target.value);

    setTimeout(() => {
      this.getOrders(parseInt(event.target.value));
    }, 1000);
  }

  doRefreshOrders(event) {
    setTimeout(() => {
      this.getOrders(this.idOrderState);
      event.target.complete();
    }, 2000);
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       SLIDER VALIDATIONS

  ionViewDidEnter() {
    this.storesService.getById(this.route.snapshot.params.id).then(result => {
      this.store = result;

      if (this.appService.currentUser && (this.store.idUser == this.appService.currentUser.id)) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }

      if (this.store.status != StoreStatus.Published) {
        if (!this.isAdmin) {
          this.router.navigate(['/home']);
        }
      }

      this.initialize();
    });
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

  async openBarCodeScanner() {
    let modal = await this.popoverController.create({
      component: BarcodeScannerComponent,
      backdropDismiss: false,
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

        if(result) {
          alert("Se encontro el prodcuto: " + result);
        }
      });

    modal.present();
  }

  async openStorePointsPage() {
    if (this.appService.currentUser) {
      let modal = await this.popoverController.create({
        component: StorePointsPage,
        componentProps: { isAdmin: this.isAdmin },
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

  openStoreCouponsPage() {
    this.presentAlert("El equipo de CopaCity esta trabajando en esta funcionalidad, muy pronto estara disponible para su uso", '', () => { });
  }
}
