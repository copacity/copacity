import { Injectable } from '@angular/core';
import { CartProduct } from '../app-intefaces';
import { AppService } from './app.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartInventoryService {
  data: CartProduct[];

  public cart = [];
  private cartItemCount = new BehaviorSubject(0);

  constructor(private appService: AppService) { }

  getCart() {
    return this.cart;
  }

  setCart(cart: CartProduct[]) {
    this.cart = cart;
  }

  clearCart(): void {
    this.cart = [];
    this.cartItemCount = new BehaviorSubject(0);
    this.data = [];
  }

  getCartItemCount() {
    return this.cartItemCount;
  }

  addProduct(cartProduct: CartProduct) {
    let added = false;
    for (let p of this.cart) {
      if (p.product.id === cartProduct.product.id) {
        if (this.compareProducts(cartProduct, p)) {
          p.quantity += cartProduct.quantity;
          added = true;
          break;
        }
      }
    }

    if (!added) {
      this.cart.push(cartProduct);
    }

    this.cartItemCount.next(this.cartItemCount.value + cartProduct.quantity);
  }

  compareProducts(c1: CartProduct, c2: CartProduct): boolean {

    if (c1.propertiesSelection.length == c2.propertiesSelection.length) {
      let assertsTarget: number = c1.propertiesSelection.length;
      let assertsFound: number = 0;

      c1.propertiesSelection.forEach(property1 => {
        c2.propertiesSelection.forEach(property2 => {
          if (property1.idPropertyOption == property2.idPropertyOption) {
            assertsFound++;
          }
        });
      });

      if (assertsTarget == assertsFound) {
        return true;
      }
    }

    return false;
  }

  addProductRecalculate(cartProduct: CartProduct) {
    let added = false;
    for (let [index, p] of this.cart.entries()) {
      if (cartProduct.product.id == p.product.id && this.compareProducts(p, cartProduct)) {
        if (p.quantity == 0) {
          //this.cart.splice(index, 1);
        } else {
          p.quantity = cartProduct.quantity;
        }

        added = true;
        break;
      }
    }

    if (!added) {
      this.cart.push(cartProduct);
    }

    let sum: number = 0;
    for (let p of this.cart) {
      sum = sum + parseInt(p.quantity);
    }

    this.cartItemCount.next(sum);
  }

  cartQuantity() {
    let sum: number = 0;
    for (let p of this.cart) {
      sum = sum + parseInt(p.quantity);
    }

    this.cartItemCount.next(sum);
  }

  removeProduct(cartProduct: CartProduct) {
    for (let [index, p] of this.cart.entries()) {
      if (p.product.id === cartProduct.product.id) {
        this.cartItemCount.next(this.cartItemCount.value - p.quantity);
        this.cart.splice(index, 1);
      }
    }
  }

  decreaseProduct(cartProduct: CartProduct) {
    for (let [index, p] of this.cart.entries()) {
      if (p.product.id === cartProduct.product.id) {
        p.quantity -= 1;
        if (p.quantity == 0) {
          //this.cart.splice(index, 1);
        }
      }
    }

    this.cartItemCount.next(this.cartItemCount.value - 1);
  }
}