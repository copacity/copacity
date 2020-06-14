import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product, CartProduct } from '../app-intefaces';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  data: CartProduct[];

  private cart = [];
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
  }

  getCartItemCount() {
    return this.cartItemCount;
  }

  getTotal() {
    if (this.appService.currentStore) {
      return this.cart.reduce((i, j) => i + this.getProductSubTotal(j), 0) + (this.appService.currentStore.deliveryPrice ? this.appService.currentStore.deliveryPrice : 0) - this.getDiscount();
    }

    return 0;
  }

  getTotalDetail(deliveryPrice: number) {
    return this.cart.reduce((i, j) => i + (j.checked ? this.getProductSubTotal(j) : 0), 0) + (deliveryPrice ? deliveryPrice : 0) - this.getDiscountDetail();
  }

  getProductSubTotal(cartProduct: CartProduct) {
    console.log("getProductSubTotal" + this.cart.length);

    if (cartProduct.propertiesSelection && cartProduct.propertiesSelection.length != 0) {
      return (cartProduct.product.price + cartProduct.propertiesSelection.reduce((i, j) => i + j.price, 0)) * cartProduct.quantity;
    } else {
      return cartProduct.product.price * cartProduct.quantity;
    }
  }

  getProductSubTotalUnity(cartProduct: CartProduct) {
    console.log("getProductSubTotal" + this.cart.length);

    if (cartProduct.propertiesSelection && cartProduct.propertiesSelection.length != 0) {
      return (cartProduct.product.price + cartProduct.propertiesSelection.reduce((i, j) => i + j.price, 0));
    } else {
      return cartProduct.product.price;
    }
  }

  getProductDiscount(cartProduct: CartProduct) {
    console.log("getProductDiscount" + this.cart.length);

    let result = 0;
    if (cartProduct.propertiesSelection && cartProduct.propertiesSelection.length != 0) {
      result = (cartProduct.product.price + cartProduct.propertiesSelection.reduce((i, j) => i + j.price, 0)) * cartProduct.quantity;
    } else {
      result = cartProduct.product.price * cartProduct.quantity;
    }

    return result * ((cartProduct.product.discount && cartProduct.product.discount > 0) ? (cartProduct.product.discount / 100) : 0);
  }

  getProductTotal(cartProduct: CartProduct) {
    console.log("getProductTotal" + this.cart.length);
    return this.getProductSubTotal(cartProduct) - this.getProductDiscount(cartProduct);
  }

  getSubTotal() {
    console.log("getSubTotal" + this.cart.length);
    return this.cart.reduce((i, j) => i + j.product.price * j.quantity, 0);
  }

  getDiscountDetail() {
    return this.cart.reduce((i, j) => i + ((j.checked && j.product.discount && j.product.discount > 0) ? (this.getProductDiscount(j)) : 0), 0);
  }

  getDiscount() {
    if (this.appService.currentStore) {
      return this.cart.reduce((i, j) => i + ((j.product.discount && j.product.discount > 0) ? (this.getProductDiscount(j)) : 0), 0);
    }

    return 0;
  }

  getPoints(): number {
    return this.cart.reduce((i, j) => i + (j.product.isGift) ? j.product.price : 0, 0);
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
      if (this.compareProducts(p, cartProduct)) {
        if (p.quantity == 0) {
          this.cart.splice(index, 1);
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
          this.cart.splice(index, 1);
        }
      }
    }

    this.cartItemCount.next(this.cartItemCount.value - 1);
  }
}
