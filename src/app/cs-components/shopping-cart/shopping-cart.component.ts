import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { CartProduct, Product, ProductImage } from 'src/app/app-intefaces';
import { AppService } from 'src/app/cs-services/app.service';
import { CartManagerService } from 'src/app/cs-services/cart-manager.service';
import { CartService } from 'src/app/cs-services/cart.service';
import { ProductsService } from 'src/app/cs-services/products.service';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss'],
})
export class ShoppingCartComponent implements OnInit {
  cartService: CartService;
  cart: CartProduct[] = [];

  constructor(public cartManagerService: CartManagerService,
    public appService: AppService,
    private popoverCtrl: PopoverController,
    private productsService: ProductsService,) {
    this.cartService = this.cartManagerService.getCartService();
    this.cart = this.cartService.getCart();
  }

  ngOnInit() { }

  removeCartItem(cartProduct) {
    this.cartService.removeProduct(cartProduct);
  }

  async openImageViewer(product: Product) {
    let images: string[] = [];

    let result = this.productsService.getProductImages(product.id);

    let subs = result.subscribe(async (productImages: ProductImage[]) => {
      productImages.forEach(img => {
        images.push(img.image);
      });

      let modal = await this.popoverCtrl.create({
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
