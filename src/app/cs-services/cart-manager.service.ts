import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { CartService } from './cart.service';
import { Store } from '../app-intefaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartManagerService {
  carts: CartService[] = [];

  constructor(
    private appService: AppService) {
  }

  push(store: Store) {

  }

  getCartService(store: Store) {
    let exists = false;
    let currentCart: CartService = null;
    this.carts.forEach((cart: CartService) => {
      if (cart.store.id == store.id) {
        exists = true;
        currentCart = cart;
      }
    });

    if (!exists) {
      currentCart = new CartService();
      currentCart.store = store;
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
