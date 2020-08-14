import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/cs-services/cart.service';
import { PopoverController, NavParams } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppService } from 'src/app/cs-services/app.service';
import { CartProduct, ProductImage, Product, Store } from 'src/app/app-intefaces';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { ProductsService } from 'src/app/cs-services/products.service';
import { CartManagerService } from 'src/app/cs-services/cart-manager.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { WhatsappOrderComponent } from 'src/app/cs-components/whatsapp-order/whatsapp-order.component';
import { AskForAccountComponent } from 'src/app/cs-components/ask-for-account/ask-for-account.component';
import { SignupComponent } from 'src/app/cs-components/signup/signup.component';

@Component({
  selector: 'cs-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  store: Store;
  cartService: CartService;
  cart: CartProduct[] = [];
  constructor(private router: Router,
    public cartManagerService: CartManagerService,
    public popoverController: PopoverController,
    private productService: ProductsService,
    private storesService: StoresService,
    private navParams: NavParams,
    public appService: AppService) {
    this.storesService.getById(this.navParams.data.storeId).then(store => {
      this.store = store;
      this.cartService = this.cartManagerService.getCartService(store);
      this.cart = this.cartService.getCart();
    });
  }

  ngOnInit() {

  }

  addProductRecalculate(cartProduct: CartProduct, event) {

    if (event.target.value != 0) {
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
      if (await this.popoverController.getTop()) this.popoverController.dismiss(true);
    } else {
      this.openWhatsAppOrder();
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

  async openWhatsAppOrder() {
    let modal = await this.popoverController.create({
      component: WhatsappOrderComponent,
      componentProps: { idStore: this.store.id },
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

        if (result && result == "Login") {
          this.SignIn();
        } else
          if (result && result == "Copacity") {
            window.open(this.buildWhatsAppMessage({ whatsapp: this.appService._appInfo.whatsapp, name: "" }), 'popup', 'width=450,height=600');
          } else if (result) {
            window.open(this.buildWhatsAppMessage(result), 'popup', 'width=450,height=600');
          }
      });

    return await modal.present();
  }

  buildWhatsAppMessage(user: any) {
    let message = "https://api.whatsapp.com/send?phone=57" + user.whatsapp + "&text=¡Hola " + encodeURIComponent(user.name) + "! Mi pedido en la tienda " + encodeURIComponent(this.store.name) + " es:" + encodeURIComponent("\n\n");

    this.cart.forEach(cartProduct => {
      message += cartProduct.quantity + " unidad(es)";
      message += (cartProduct.product.ref != undefined && cartProduct.product.ref != null) ? " - Ref " + cartProduct.product.ref : "";
      message += ": " + cartProduct.product.name + ",";

      // Properties
      cartProduct.propertiesSelection.forEach(property => {
        message += " [" + property.propertyName + ":" + property.propertyOptionName + ((property.price > 0) ? (", " + this.toMoneyFormat(property.price)) : "") + "]"
      });

      message += (cartProduct.product.discount && cartProduct.product.discount != 0) ? " [Descuento: " + cartProduct.product.discount + "%]" : "";
      message += " Precio: " + this.toMoneyFormat(this.cartService.getProductTotal(cartProduct)) + encodeURIComponent("\n\n‎");

    });

    message += "Total: " + this.toMoneyFormat(this.cartService.getTotal()) + encodeURIComponent("\n\n‎");
    message += "Muchas Gracias.";

    return message;
  }

  toMoneyFormat(value: number) {
    let formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    return formatter.format(value);
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

              if (result) {
                this.goToCreateOrder();
              }
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
              if (result) {
                this.goToCreateOrder();
              }
            });

          popover3.present();
        }
      });

    popover.present();
  }

  getNumbers() {
    let numbers = [];

    for (let i = 0; i <= 100; i++) {
      numbers.push(i);
    }

    return numbers;
  }

  add(cartProduct: CartProduct) {
    if ((cartProduct.maxLimit - 1) >= 0) {
      cartProduct.quantity += 1;
      cartProduct.maxLimit -= 1;
      this.cartService.addProductRecalculate(cartProduct);
    }
  }

  remove(cartProduct: CartProduct) {
    if ((cartProduct.maxLimit + 1) >= 0) {

      if (cartProduct.quantity > 1) {
        cartProduct.quantity -= 1;
        cartProduct.maxLimit += 1;
        this.cartService.addProductRecalculate(cartProduct);
      }
    }
  }

  validateMaxLimitLimit(cartProduct: CartProduct, value): boolean {
    if (cartProduct.maxLimit) {
      return true;
    } else if (cartProduct.maxLimit > value) {
      return true;
    } else {
      return false
    }
  }
}
