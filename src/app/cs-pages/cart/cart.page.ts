import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/cs-services/cart.service';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppService } from 'src/app/cs-services/app.service';
import { CartProduct, ProductImage, Product } from 'src/app/app-intefaces';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { ProductsService } from 'src/app/cs-services/products.service';

@Component({
  selector: 'cs-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  cart: CartProduct[] = [];
  constructor(private router: Router,
    public cartService: CartService,
    public popoverController: PopoverController,
    private productService: ProductsService,
    public appService: AppService) {
    this.cart = this.cartService.getCart();
  }

  ngOnInit() {

  }

  addProductRecalculate(cartProduct: CartProduct, event) {

    if(event.target.value != 0) {
      cartProduct.quantity = event.target.value;
    this.cartService.addProductRecalculate(cartProduct);
    }
  }

  removeCartItem(cartProduct) {

    this.cartService.removeProduct(cartProduct);
  }

  close() {

    this.popoverController.dismiss();
  }

  async goToCreateOrder() {
    if (this.appService.currentUser) {
      this.popoverController.dismiss(true);
    } else {
      this.SignIn();
    }
  }

  async openImageViewer(product: Product) {
    let images: string[] = [];

    let result = this.productService.getProductImages(this.appService.currentStore.id, product.id);

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

  async SignIn() {
    const popover = await this.popoverController.create({
      component: SigninComponent,
      cssClass: "signin-popover",
    });
    return await popover.present();
  }

  getNumbers() {
    let numbers = [];

    for (let i = 0; i <= 100; i++) {
      numbers.push(i);
    }

    return numbers;
  }

  add(cartProduct: CartProduct) {
    cartProduct.quantity += 1;
    this.cartService.addProductRecalculate(cartProduct);
  }

  remove(cartProduct: CartProduct) {
    if (cartProduct.quantity > 1) {
      cartProduct.quantity -= 1;
      this.cartService.addProductRecalculate(cartProduct);
    }
  }
}
