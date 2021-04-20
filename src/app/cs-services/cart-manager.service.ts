import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { CartService } from './cart.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartManagerService {
  carts: CartService[] = [];

  constructor(
    private appService: AppService) {
  }

  getCartService() {
    let exists = false;
    let currentCart: CartService = null;
    this.carts.forEach((cart: CartService) => {
      //if (cart.store.id == store.id) {
        exists = true;
        currentCart = cart;
      //}
    });

    if (!exists) {
      currentCart = new CartService();
      //currentCart.store = store;
      this.carts.push(currentCart);
    }

    return currentCart;
  }

  getTotalCount() {
    let total = 0;

    this.carts.forEach((cart: CartService) => {
      total += cart.getCartItemCount().value;
    });

    return new BehaviorSubject(total).value;
  }
}
