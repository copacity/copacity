import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/cs-services/cart.service';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppService } from 'src/app/cs-services/app.service';
import { CartProduct } from 'src/app/app-intefaces';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';

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
