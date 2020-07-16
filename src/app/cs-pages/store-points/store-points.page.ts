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

@Component({
  selector: 'app-store-points',
  templateUrl: './store-points.page.html',
  styleUrls: ['./store-points.page.scss'],
})
export class StorePointsPage implements OnInit {
  isAdmin: boolean;
  products: Observable<Product[]>;
  searchingProducts: boolean = false;
  productSearchHits: number = 0;
  points: number = 0;

  constructor(public popoverController: PopoverController,
    public appService: AppService,
    public cartService: CartService,
    private usersService: UsersService,
    public alertController: AlertController,
    public cartInventoryService: CartInventoryService,
    public navParams: NavParams,
    private storesService: StoresService,
    private productsService: ProductsService) {
    this.isAdmin = this.navParams.data.isAdmin;
    this.getProducts();
    this.GetPoints();
  }

  ngOnInit() {

  }

  async presentDeleteProductPrompt(product: Product) {
    this.presentConfirm('Esta seguro que desea eliminar el regalo: ' + product.name + '?', () => {
      this.productsService.update(this.appService.currentStore.id, product.id, { deleted: true }).then(() => {
        this.appService.currentStore.productsCount = this.appService.currentStore.productsCount - 1
        this.storesService.update(this.appService.currentStore.id, { productsCount: this.appService.currentStore.productsCount }).then(() => {
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

      let result = this.productsService.getProductImages(this.appService.currentStore.id, product.id);

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
    this.productsService.update(this.appService.currentStore.id, product.id, { soldOut: !e.detail.checked });
  }

  GetPoints() {
    return new Promise((resolve, reject) => {
      let subscribe = this.usersService.getStorePoints(this.appService.currentUser.id).subscribe(StorePoints => {

        let currentStorePoint: StorePoint = {
          id: '',
          idStore: this.appService.currentStore.id,
          points: 0,
          deleted: false,
          dateCreated: new Date(),
          lastUpdated: new Date(),
        };

        StorePoints.forEach(storePoint => {
          if (storePoint.idStore === this.appService.currentStore.id) {
            currentStorePoint = storePoint
          }
        });

        debugger;
        this.points = currentStorePoint.points - this.cartService.getPoints();
        subscribe.unsubscribe();
      });
    }).catch(err => alert(err));
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
      let subs = this.productsService.getCartInventory(this.appService.currentStore.id, product.id)
        .subscribe((cartP) => {
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
      this.products = this.productsService.getByProductGift(this.appService.currentStore.id);

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
