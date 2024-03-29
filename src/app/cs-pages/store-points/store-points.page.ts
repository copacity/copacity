import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, AlertController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { ProductCreatePage } from '../product-create/product-create.page';
import { Observable } from 'rxjs';
import { Product, StorePoint, ProductImage } from 'src/app/app-intefaces';
import { ProductsService } from 'src/app/cs-services/products.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { ProductUpdatePage } from '../product-update/product-update.page';
import { UsersService } from 'src/app/cs-services/users.service';
import { CartService } from 'src/app/cs-services/cart.service';
import { ProductPropertiesSelectionComponent } from 'src/app/cs-components/product-properties-selection/product-properties-selection.component';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { ProductInventoryPage } from '../product-inventory/product-inventory.page';
import { CartInventoryService } from 'src/app/cs-services/cart-inventory.service';
import { CartManagerService } from 'src/app/cs-services/cart-manager.service';

@Component({
  selector: 'app-store-points',
  templateUrl: './store-points.page.html',
  styleUrls: ['./store-points.page.scss'],
})
export class StorePointsPage implements OnInit {
  public cartService: CartService;
  isAdmin: boolean;
  products: Observable<Product[]>;
  searchingProducts: boolean = false;
  productSearchHits: number = 0;
  points: number = 0;

  constructor(public popoverController: PopoverController,
    public appService: AppService,
    public cartManagerService: CartManagerService,
    private usersService: UsersService,
    public alertController: AlertController,
    public cartInventoryService: CartInventoryService,
    public navParams: NavParams,
    private productsService: ProductsService) {
    this.cartService = this.cartManagerService.getCartService();
    this.isAdmin = this.navParams.data.isAdmin;
    this.getProducts();
    this.GetPoints();
  }

  ngOnInit() {

  }

  async presentDeleteProductPrompt(product: Product) {
    this.presentConfirm('Esta seguro que desea eliminar el regalo: ' + product.name + '?', () => {
      this.productsService.update(product.id, { deleted: true }).then(() => {
        this.appService._appInfo.productsCount = this.appService._appInfo.productsCount - 1
        this.appService.updateAppInfo().then(() => {
          this.presentAlert("Regalo eliminado exitosamente!", '', () => { });
        });
      });
    });
  }

  async openProductUpdatePage(product: Product) {
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

  async openImageViewer(product: Product) {
    if (this.isAdmin) {
      this.openProductUpdatePage(product);
    } else {
      let images: string[] = [];

      let result = this.productsService.getProductImages(product.id);

      let subs = result.subscribe(async (productImages: ProductImage[]) => {
        productImages.forEach(img => {
          images.push(img.image);
        });

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
        subs.unsubscribe();
      });
    }
  }

  productSoldOut(e: any, product: Product) {
    this.productsService.update(product.id, { soldOut: !e.detail.checked });
  }

  GetPoints() {
    return new Promise((resolve, reject) => {
      let subscribe = this.usersService.getStorePoints(this.appService.currentUser.id).subscribe(StorePoints => {

        let currentStorePoint: StorePoint = {
          id: '',
          idStore: '',
          points: 0,
          deleted: false,
          dateCreated: new Date(),
          lastUpdated: new Date(),
        };

        StorePoints.forEach(storePoint => {
          //if (storePoint.idStore === this.appService.currentStore.id) {
            currentStorePoint = storePoint
          //}
        });

        this.points = currentStorePoint.points - this.cartService.getPoints();
        subscribe.unsubscribe();
      });
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'GetPoints', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
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

  async addToCart(e: any, product: Product) {

    if (!product.soldOut) {

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

            let modal = await this.popoverController.create({
              component: ProductPropertiesSelectionComponent,
              mode: 'ios',
              event: e,
              componentProps: { isInventory: false, product: product, productProperties: productProperties, cart: cartP, limitQuantity: 0, quantityByPoints: parseInt((this.points / product.price).toString()) }
            });

            modal.onDidDismiss()
              .then((data) => {
                const result = data['data'];

                if (result) {
                  this.cartService.addProduct(result);
                  this.GetPoints();
                  this.presentAlert("Tu regalo ha sido agregado al carrito, gracias por comprar en Copacity", '', () => { });
                }
              });

            modal.present();
          });

          subs.unsubscribe();
        });
    }
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

  getProducts() {
    this.products = null;
    this.searchingProducts = true;
    this.productSearchHits = 0;

    setTimeout(() => {
      this.products = this.productsService.getByProductGift();

      this.products.subscribe((products) => {
        this.searchingProducts = false;
        products.forEach(product => {
          if (product) {
            this.productSearchHits++;
          }
        });
      });
    }, 500);
  }

  productFeatured(e: any, product: Product) {
    console.log(e.detail.checked);
    this.productsService.update(product.id, { isFeatured: e.detail.checked });
  }

  async openProductCreatePage() {
    let modal = await this.popoverController.create({
      component: ProductCreatePage,
      componentProps: { isGift: true },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
      });

    modal.present();
  }

  close() {
    this.popoverController.dismiss();
  }
}
