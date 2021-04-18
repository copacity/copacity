import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Order } from 'src/app/app-intefaces';
import { AppService } from 'src/app/cs-services/app.service';
import { OrdersService } from 'src/app/cs-services/orders.service';
import { OrderDetailPage } from '../order-detail/order-detail.page';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-store-orders',
  templateUrl: './store-orders.page.html',
  styleUrls: ['./store-orders.page.scss'],
})
export class StoreOrdersPage implements OnInit {
  searchingOrders: boolean = false;
  orderSearchHits = 0;
  orders: Observable<Order[]>;
  isAdmin: boolean = false;

  constructor(
    private router: Router,
    public popoverController: PopoverController,
    public navParams: NavParams,
    private ordersService: OrdersService,
    public appService: AppService) {
    this.isAdmin = this.navParams.data.isAdmin;

    this.getOrders();
  }

  ngOnInit() {

  }

  close() {
    this.popoverController.dismiss();
  }

  getOrders() {
    this.orders = null;
    this.orderSearchHits = 0;
    this.searchingOrders = true;

    if (!this.appService.currentUser.isAdmin) {
      this.orders = this.ordersService.getByStoreAndUser(this.appService.currentUser.id, "");
      this.orders.subscribe(result => {
        this.searchingOrders = false;
        result.forEach(order => {
          if (order) {
            this.orderSearchHits++;
          }
        });
      });
    } else {
      this.orders = this.ordersService.getByStore("");
      this.orders.subscribe(result => {
        this.searchingOrders = false;
        result.forEach(order => {
          if (order) {
            this.orderSearchHits++;
          }
        });
      });
    }
  }

  async openOrderDetailPage(idOrder: Order) {
    this.router.navigate(['order-detail/' + idOrder]);
    this.popoverController.dismiss();

    // let modal = await this.popoverController.create({
    //   component: OrderDetailPage,
    //   componentProps: { id: idOrder, idStore: this.appService.currentStore.id },
    //   cssClass: 'cs-popovers',
    //   backdropDismiss: false,
    // });

    // modal.onDidDismiss()
    //   .then((data) => {
    //     const updated = data['data'];
    //   });

    // modal.present();
  }

  async openImageViewer(img: string) {
    let images: string[] = [];
    images.push(img);

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
  }
}
