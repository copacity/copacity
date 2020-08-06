import { Component, OnInit } from '@angular/core';
import { CartManagerService } from 'src/app/cs-services/cart-manager.service';
import { CartService } from 'src/app/cs-services/cart.service';
import { PopoverController } from '@ionic/angular';
import { CartPage } from 'src/app/cs-pages/cart/cart.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-cart',
  templateUrl: './menu-cart.component.html',
  styleUrls: ['./menu-cart.component.scss'],
})
export class MenuCartComponent implements OnInit {

  public carts: CartService[] = [];

  constructor(
    private router: Router,
    public cartManagerService: CartManagerService,
    public popoverController: PopoverController) {
    this.validateActiveCarts();
  }

  ngOnInit() { }

  validateActiveCarts() {
    let currentCart: any;
    let cartCount = 0;
    let cartItems = this.cartManagerService.getTotalCount();

    this.cartManagerService.carts.forEach(cart => {
      if (cart.getCartItemCount().value != 0) {
        currentCart = cart;
        cartCount++;
      }
    });

    if (cartCount == 1 && cartItems != 0) {
      setTimeout(() => {
        this.openCart(currentCart.store.id);
        this.popoverController.dismiss();
      }, 500);
    }
  }

  async openCart(storeId: string) {
    this.popoverController.dismiss();
    let modal = await this.popoverController.create({
      component: CartPage,
      componentProps: { storeId: storeId },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        let result = data['data'];

        if (result) {
          this.goToCreateOrder(storeId);
        }
      });

    modal.present();
  }

  async goToCreateOrder(storeId: string) {
    this.router.navigate(['/order-create', storeId]);
  }
}
