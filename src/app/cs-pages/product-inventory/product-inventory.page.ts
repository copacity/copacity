import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, AlertController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { Product, CartProduct, ProductImage } from 'src/app/app-intefaces';
import { CartInventoryService } from 'src/app/cs-services/cart-inventory.service';
import { ProductPropertiesSelectionComponent } from 'src/app/cs-components/product-properties-selection/product-properties-selection.component';
import { ProductsService } from 'src/app/cs-services/products.service';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { Observable } from 'rxjs';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';

@Component({
  selector: 'app-product-inventory',
  templateUrl: './product-inventory.page.html',
  styleUrls: ['./product-inventory.page.scss'],
})
export class ProductInventoryPage implements OnInit {
  product: Product;
  searching: boolean = false;

  constructor(public popoverController: PopoverController,
    private navParams: NavParams,
    public appService: AppService,
    public alertController: AlertController,
    private loaderComponent: LoaderComponent,
    private productsService: ProductsService,
    public cartInventoryService: CartInventoryService) {
    this.product = this.navParams.data.product;

    this.searching = true;
    this.cartInventoryService.clearCart();
    let subs = this.productsService.getCartInventory(this.product.id)
      .subscribe((cartP) => {
        this.searching = false;
        this.cartInventoryService.setCart(cartP);
        this.cartInventoryService.cartQuantity();
        subs.unsubscribe();
      });
  }

  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }

  async addToCart(e: any, product: Product) {

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
        componentProps: { isInventory: true, product: product, productProperties: productProperties, cart: [], limitQuantity: 100, quantityByPoints: -1 }
      });

      modal.onDidDismiss()
        .then((data) => {
          const result = data['data'];

          if (result) {
            this.cartInventoryService.addProduct(result);
          }
        });

      modal.present();
    });
  }

  async openImageViewer(product: Product) {
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

  add(cartProduct: CartProduct) {
    cartProduct.quantity += 1;
    this.cartInventoryService.addProductRecalculate(cartProduct);
  }

  remove(cartProduct: CartProduct) {
    if (cartProduct.quantity > 0) {
      cartProduct.quantity -= 1;
      this.cartInventoryService.addProductRecalculate(cartProduct);
    }
  }

  async presentAlert(title: string, message: string, done: Function, buttonOkName?: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      mode: 'ios',
      translucent: true,
      animated: true,
      backdropDismiss: false,
      buttons: [buttonOkName ? buttonOkName : 'Aceptar!']
    });

    alert.onDidDismiss().then(() => done());
    await alert.present();
  }

  saveChanges() {
    this.loaderComponent.startLoading("Actualizando Inventario, por favor espere un momento...");

    setTimeout(() => {
      this.addCartInventory(this.product.id, 0).then(() => {

        let soldOut: boolean;
        if (this.cartInventoryService.getCartItemCount().value == 0) {
          soldOut = true;
        } else {
          soldOut = false;
        }

        this.productsService.update(this.product.id, { soldOut: soldOut }).then(() => {
          this.loaderComponent.stopLoading();

          this.presentAlert("El inventario del producto ha sido actualizado exitosamente.", "", () => {
            this.popoverController.dismiss(true);
          });
        });
      });
    }, 500);
  }

  addCartInventory(idProduct: string, index: number) {
    return new Promise((resolve, reject) => {
      let addToCart = (index: number) => {
        if (this.cartInventoryService.cart.length == index) {
          resolve(true);
        }
        else {
          if (this.cartInventoryService.cart[index].id) {
            this.productsService.updateCartInventory(idProduct, this.cartInventoryService.cart[index].id, { quantity: this.cartInventoryService.cart[index].quantity }).then(() => {
              addToCart(++index);
            });
          } else {
            this.productsService.addCartInventory(idProduct, this.cartInventoryService.cart[index]).then(() => {
              addToCart(++index);
            });
          }
        }
      };

      addToCart(index);
    }).catch(err => {
      alert(err);
      this.appService.logError({id:'', message: err, function:'addCartInventory', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }
}
