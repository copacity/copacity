import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, PopoverController } from '@ionic/angular';
import { MenuNotificationsComponent } from '../cs-components/menu-notifications/menu-notifications.component';
import { MenuUserComponent } from '../cs-components/menu-user/menu-user.component';
import { ShoppingCartComponent } from '../cs-components/shopping-cart/shopping-cart.component';
import { CartPage } from '../cs-pages/cart/cart.page';
import { SearchPage } from '../cs-pages/search/search.page';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(public popoverController: PopoverController,
    public router: Router,
    private menu: MenuController) { }

   async openCart(e) {
     this.menu.toggle("menu-right");
    // let modal = await this.popoverController.create({
    //   component: ShoppingCartComponent,
    //   componentProps: { storeId: '-1' },
    //   cssClass: 'cs-popovers',
    //   backdropDismiss: true,
    //   event: e
    // });

    // modal.onDidDismiss()
    //   .then((data) => {
    //     let result = data['data'];

    //     if (result) {
    //       this.goToCreateOrder();
    //     }
    //   });

    // modal.present();
  }

  async presentMenuNotifications(e) {
    const popover = await this.popoverController.create({
      component: MenuNotificationsComponent,
      animated: false,
      showBackdrop: true,
      mode: 'ios',
      translucent: false,
      event: e,
      cssClass: 'notification-popover'
    });

    return await popover.present();
  }

  async openSearchPage(e) {
    let modal = await this.popoverController.create({
      component: SearchPage,
      cssClass: 'notification-popover',
      event: e,
      backdropDismiss: true,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

      });

    modal.present();
  }

  async goToCreateOrder() {
    this.router.navigate(['/order-create']);
  }

  async presentMenuUser(e) {
    const popover = await this.popoverController.create({
      component: MenuUserComponent,
      animated: false,
      showBackdrop: true,
      mode: 'ios',
      translucent: false,
      event: e
    });

    return await popover.present();
  }
}
