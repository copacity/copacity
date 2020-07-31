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

  }

  ngOnInit() { }

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
