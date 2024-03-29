
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AlertController, PopoverController, ToastController, IonSelect, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { AppService } from 'src/app/cs-services/app.service';
import { CartService } from 'src/app/cs-services/cart.service';
import { ProductsService } from 'src/app/cs-services/products.service';
import { ProductCategoriesService } from 'src/app/cs-services/productCategories.service';
import { Product, Category, ProductCategory, Order, File, Vendor } from 'src/app/app-intefaces';
import { CartPage } from '../cart/cart.page';
import { SuperTabs } from '@ionic-super-tabs/angular';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { StoresService } from 'src/app/cs-services/stores.service';
import { ProductUpdatePage } from '../product-update/product-update.page';
import { ProductCreatePage } from '../product-create/product-create.page';
import { StorageService } from 'src/app/cs-services/storage.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ProductCategoriesPage } from '../product-categories/product-categories.page';
import { OrdersService } from 'src/app/cs-services/orders.service';
import { StoreStatus } from 'src/app/app-enums';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { SectorNamePipe } from 'src/app/cs-pipes/sector-name.pipe';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { CropperImageComponent } from 'src/app/cs-components/cropper-image/cropper-image.component';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { StoreInformationComponent } from 'src/app/cs-components/store-information/store-information.component';
import { ProductPropertiesSelectionComponent } from 'src/app/cs-components/product-properties-selection/product-properties-selection.component';
import { StorePointsPage } from '../store-points/store-points.page';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { BarcodeScannerComponent } from 'src/app/cs-components/barcode-scanner/barcode-scanner.component';
import { BarcodeGeneratorComponent } from 'src/app/cs-components/barcode-generator/barcode-generator.component';
import { ProductInventoryPage } from '../product-inventory/product-inventory.page';
import { CartInventoryService } from 'src/app/cs-services/cart-inventory.service';
import { StoreCouponsPage } from '../store-coupons/store-coupons.page';
import { VideoPlayerComponent } from 'src/app/cs-components/video-player/video-player.component';
import { SearchPage } from '../search/search.page';
import { CartManagerService } from 'src/app/cs-services/cart-manager.service';
import { SwUpdate } from '@angular/service-worker';
import { SignupComponent } from 'src/app/cs-components/signup/signup.component';
import { AskForAccountComponent } from 'src/app/cs-components/ask-for-account/ask-for-account.component';
import { VendorsListComponent } from 'src/app/cs-components/vendors-list/vendors-list.component';
import { UsersService } from 'src/app/cs-services/users.service';
import { HostListener } from "@angular/core";
import { StoreUpdateCategoryPage } from '../store-update-category/store-update-category.page';
import { MenuService } from 'src/app/cs-services/menu.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
})
export class StorePage implements OnInit {
  loading: HTMLIonLoadingElement;

  public cartSevice: CartService;

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------      MAIN VARIABLES 
  @ViewChild('sliderMenu', null) slider: any;
  @ViewChild('cartHome', { static: false, read: ElementRef }) shoppingCart: ElementRef;
  @ViewChild(SuperTabs, { static: false }) superTabs: SuperTabs;
  @ViewChild('selectCategories', { static: false }) selectRef: IonSelect;

  photo: SafeResourceUrl;
  category: Category;
  isAdmin: boolean = false;
  isBigScreen: boolean = false;

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

  selectedCategoryName: string = 'Todos los productos';

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------      CONSTRUCTOR 
  constructor(
    private router: Router,
    public toastController: ToastController,
    public alertController: AlertController,
    public popoverController: PopoverController,
    public cartManagerService: CartManagerService,
    private usersService: UsersService,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    private swUpdate: SwUpdate,
    private loaderComponent: LoaderComponent,
    public cartInventoryService: CartInventoryService,
    public appService: AppService,
    private storageService: StorageService,
    private storesService: StoresService,
    private angularFireAuth: AngularFireAuth,
    private productsService: ProductsService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private productCategoriesService: ProductCategoriesService,
    public menuService: MenuService,
    private ordersService: OrdersService
  ) {

    this.angularFireAuth.auth.onAuthStateChanged(user => {

      this.storesService.getById(this.route.snapshot.params.id).then(result => {
        this.cartSevice = this.cartManagerService.getCartService();
        this.category = result;

        if (user) {
          this.appService.updateUserData(user.uid).then(() => {
            this.isAdmin = this.appService.currentUser.isAdmin;

            if (this.category.status != StoreStatus.Published) {
              if (!this.isAdmin) {
                this.router.navigate(['/home']);
              }
            }

            this.initialize(true);
          });
        } else {
          this.isAdmin = false;

          if (this.category.status != StoreStatus.Published) {
            this.router.navigate(['/home']);
          }

          this.initialize(true);
        }
      });
    });

    this.getScreenSize();

    this.appService.loadCustomScript();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    let screenHeight = window.innerHeight;
    let screenWidth = window.innerWidth;
    console.log(screenHeight, screenWidth);

    if (screenWidth <= 450) {
      this.isBigScreen = false;
      this.appService.slideOptsStoreMenu = { speed: 2000, slidesPerView: 5 }
    }
    else if (screenWidth > 450) {
      this.isBigScreen = true;
      this.appService.slideOptsStoreMenu = { speed: 2000, slidesPerView: 6 }
    }
  }

  initialize(firstTime: boolean) {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(async () => {
        window.location.reload();
      });
    }

    this.appService.currentCategory = this.category;
    this.productCategories = this.productCategoriesService.getAll(this.route.snapshot.params.id);

    this.productCategories.subscribe(pcArray => {
      this.productCategoriesCount = pcArray.length;
    });

    this.cart = this.cartSevice.getCart();
    this.cartItemCount = this.cartSevice.getCartItemCount();

    if (firstTime) {
      this.getProducts(this.idProductCategory);
    }

    // if (this.storesService.option == 4) {
    //   this.storesService.option = 0;
    //   this.openStorePointsPage();
    // } else if (this.storesService.option == 5) {
    //   this.storesService.option = 0;
    //   this.openStoreCouponsPage();
    // }
  }

  ngOnInit() {

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

  doRefreshMain(event) {
    setTimeout(() => {
      this.angularFireAuth.auth.onAuthStateChanged(user => {
        this.storesService.getById(this.route.snapshot.params.id).then(result => {
          this.cartSevice = this.cartManagerService.getCartService();
          this.category = result;

          if (user) {
            this.appService.updateUserData(user.uid).then(() => {
              this.isAdmin = this.appService.currentUser.isAdmin;

              if (this.category.status != StoreStatus.Published) {
                if (!this.isAdmin) {
                  this.router.navigate(['/home']);
                }
              }

              this.initialize(true);
            });
          } else {
            this.isAdmin = false;

            if (this.category.status != StoreStatus.Published) {
              this.router.navigate(['/home']);
            }

            this.initialize(true);
          }
        });
      });
      event.target.complete();
    }, 500);
  }

  close() {

    //this.presentConfirm("Esta seguro que desea salir de " + this.store.name + "?", () => {
    this.router.navigate(['/home']);
    //});
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
      component: StoreUpdateCategoryPage,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
        if (updated) {
          this.category.name = this.appService.currentCategory.name;
          this.category.description = this.appService.currentCategory.description;
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
            this.storageService.ResizeImage(image, this.appService.currentCategory.id, 500, 500).then((url) => {
              this.storesService.update(this.appService.currentCategory.id, { logo: url }).then(() => {
                setTimeout(() => {
                  this.storageService.getThumbUrl(this.appService.getImageIdByUrl(url.toString()), (thumbUrl: string) => {
                    this.storesService.update(this.appService.currentCategory.id, { thumb_logo: thumbUrl }).then(() => {
                      this.loaderComponent.stopLoading();
                      this.category.logo = url.toString();
                      this.category.thumb_logo = thumbUrl.toString();
                      this.presentAlert("Tu foto ha sido actualizada exitosamente!", "", () => { });
                    });
                  });
                }, 15000);
              });
            });
          }, 500);
        }
      });

    modal.present();
  }

  shareStore(e) {

    if (this.category.status == StoreStatus.Published) {
      this.ngNavigatorShareService.share({
        title: this.category.name,
        text: 'Hola! Visita nuestra tienda: ' + this.category.name + ' y sorprendete con todos los productos, promociones, cupones y regalos que tenemos para ti!. En Copacity, Tu Centro Comercial Virtual',
        url: this.appService._appInfo.domain + "/store/" + this.category.id
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
      text: 'Hola ingresa a copacity.net donde podrás ver nuestras tiendas con variedad de productos para ti, promociones, cupones con descuentos, también puedes acumular puntos y obtener regalos, todo te lo llevamos hasta la puerta de tu casa!',
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
    let text = 'Hola! Visita nuestra tienda: ' + this.category.name + ' y sorprendete con todos los productos, promociones, cupones y regalos que tenemos para ti!. En Copacity, Tu Centro Comercial Virtual. ' + this.appService._appInfo.domain + "/store/" + this.category.id;

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
      this.loading = await this.loadingCtrl.create({});
      this.loading.present();
      this.cartInventoryService.clearCart();
      let subs = this.productsService.getCartInventory(product.id)
        .subscribe((cartP) => {

          let productPropertiesResult = this.productsService.getAllProductPropertiesUserSelectable(product.id);

          let subscribe = productPropertiesResult.subscribe(async productProperties => {
            productProperties.forEach(productProperty => {
              let productPropertyOptionsResult = this.productsService.getAllProductPropertyOptions(product.id, productProperty.id);
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

            let modal = await this.popoverController.create({
              component: ProductPropertiesSelectionComponent,
              mode: 'ios',
              event: e,
              componentProps: { isInventory: false, product: product, productProperties: productProperties, cart: cartP, limitQuantity: 0, quantityByPoints: -1 }
            });

            modal.onDidDismiss()
              .then((data) => {
                const result = data['data'];

                if (result) {
                  this.animateCSS('tada');
                  this.cartSevice.addProduct(result);
                  this.appService.presentToastCart(product.name + ' ha sido agregado al carrito!', result.product.image);
                }
              });

            modal.present();
          });

          subs.unsubscribe();
        });
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
      this.getProducts(e.target.value);

      if (e.target.value == "0") {
        this.selectedCategoryName = "Todos los productos";
      } else if (e.target.value == "-1") {
        this.selectedCategoryName = "Productos destacados";
      } else {
        let sbs = this.productCategories.subscribe((item: ProductCategory[]) => {
          item.forEach(pc => {
            if (pc.id == e.target.value) {
              this.selectedCategoryName = pc.name;
            }
          });

          sbs.unsubscribe();
        });
      }
    }, 500);
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
      this.products = this.productsService.getBySearchAndCategory(this.category.id, this.productSearchText, idProductCategory);

      this.products.subscribe((products) => {
        this.searchingProducts = false;
        products.forEach(product => {
          if (product) {
            this.productSearchHits++;
          }
        });
      });
    }, 500);


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

    if (this.appService._appInfo.productsCount < this.appService._appInfo.productsLimit) {
      if (this.productCategoriesCount != 0) {
        let modal = await this.popoverController.create({
          component: ProductCreatePage,
          componentProps: { isGift: false },
          cssClass: 'cs-popovers',
          backdropDismiss: false,
        });

        modal.onDidDismiss()
          .then((data) => {
            const updated = data['data'];
          });

        modal.present();
      } else {
        this.presentAlert("Antes de crear un producto debes tener al menos una Sección o Categroría creada, puedes ir al botón 'Crear Sección o Categroría' para continuar", "", () => { })
      }
    } else {
      this.presentAlert("Has llegado al limite máximo de productos en tu tienda, Si necesitas crear mas productos, comunicate con el administrador de CopaCity para incrementar la capacidad. Gracias.", "", () => { })
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
    this.router.navigate(['app/product-detail/' + idProduct]);
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
    this.productsService.update(product.id, { soldOut: !e.detail.checked });
  }

  productFeatured(e: any, product: Product) {
    console.log(e.detail.checked);
    this.productsService.update(product.id, { isFeatured: e.detail.checked });
  }

  async presentDeleteProductPrompt(product: Product) {
    this.presentConfirm('Esta seguro que desea eliminar el producto: ' + product.name + '?', () => {
      this.productsService.update(product.id, { deleted: true }).then(() => {
        this.appService._appInfo.productsCount = this.appService._appInfo.productsCount - 1
        this.appService.updateAppInfo().then(() => {
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
    this.storageService.takePhoto(this.appService.currentCategory.id, 500, 500).then((url) => {
      this.storageService.getThumbUrl(this.appService.getImageIdByUrl(url.toString()), (thumbUrl: string) => {
        this.loaderComponent.startLoading("Actualizando foto, por favor espere un momento...");
        this.storesService.update(this.appService.currentCategory.id, { logo: url, thumb_logo: thumbUrl }).then(result => {
          this.category.logo = url.toString();
          this.presentAlert("Tu foto ha sido actualizada exitosamente!", "", () => { });
        });
      });
    });
  }

  sendToPublish() {

    this.loaderComponent.startLoading("Enviando tienda para revisión. por favor espere un momento...");
    setTimeout(() => {
      this.storesService.update(this.category.id, { status: StoreStatus.Pending }).then(result => {
        this.storesService.getById(this.category.id).then(result => {
          this.loaderComponent.stopLoading();
          this.category = result;
        });
      });
    }, 500);
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
    }, 500);
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
          this.orders = this.ordersService.getByState(state, this.orderSearchText);

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

          this.orders = this.ordersService.getByUserAndState(this.appService.currentUser.id, state, this.orderSearchText)

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
    }, 500);
  }

  async openOrderDetailPage(idOrder: string) {
    this.router.navigate(['order-detail/' + idOrder]);

    // let modal = await this.popoverController.create({
    //   component: OrderDetailPage,
    //   componentProps: { id: idOrder, idStore: this.appService.currentStore.id },
    //   cssClass: 'cs-popovers'
    // });

    // modal.onDidDismiss()
    //   .then((data) => {
    //     const updated = data['data'];
    //   });

    // modal.present();
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
    }, 500);
  }

  //--------------------------------------------------------------
  //--------------------------------------------------------------
  //--------------------------------       SLIDER VALIDATIONS

  ionViewDidEnter() {
    this.storesService.getById(this.route.snapshot.params.id).then(result => {
      this.cartSevice = this.cartManagerService.getCartService();
      this.category = result;

      if (this.appService.currentUser && this.appService.currentUser.isAdmin) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }

      if (this.category.status != StoreStatus.Published) {
        if (!this.isAdmin) {
          this.router.navigate(['/home']);
        }
      }

      this.initialize(false);
    });

    setTimeout(() => {
      try { this.slider.startAutoplay(); } catch (error) { }
    }, 300);
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

        if (result) {
          if (result.indexOf("store-coupons-detail") != -1) {
            let value = result.toString().split("/");
            this.router.navigate(['store-coupons-detail/', value[value.length - 1]]);
          } else if (result.indexOf("product-detail") != -1) {
            let value = result.toString().split("/");
            this.router.navigate(['app/product-detail/', value[value.length - 1]]);
          } else if (result.indexOf("store") != -1) {
            let value = result.toString().split("/");
            this.router.navigate(['store/', value[value.length - 1]]);
          }
        }
      });

    modal.present();
  }

  async openBarCodeGenerator(product: Product) {
    let value = this.appService._appInfo.domain + "/app/product-detail/" + product.id;

    let modal = await this.popoverController.create({
      component: BarcodeGeneratorComponent,
      backdropDismiss: false,
      componentProps: { value: value, title: product.name },
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
  }

  async openStoreCouponsPage() {
    //if (this.appService.currentUser) {
    let modal = await this.popoverController.create({
      component: StoreCouponsPage,
      componentProps: { isAdmin: this.isAdmin, dashboard: true, orderTotal: -1 },
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

  async openProductInventoryPage(product: Product) {
    let modal = await this.popoverController.create({
      component: ProductInventoryPage,
      componentProps: { product: product },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
  }

  openSelectCategories() {
    this.selectRef.open();
  }
}
