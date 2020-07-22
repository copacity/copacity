import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/cs-services/app.service';
import { PopoverController } from '@ionic/angular';
import { Notification } from 'src/app/app-intefaces';
import { NotificationsService } from 'src/app/cs-services/notifications.service';
import { NotificationStatus } from 'src/app/app-enums';
import { Router } from '@angular/router';
import { OrderDetailPage } from 'src/app/cs-pages/order-detail/order-detail.page';

@Component({
  selector: 'app-menu-notifications',
  templateUrl: './menu-notifications.component.html',
  styleUrls: ['./menu-notifications.component.scss'],
})
export class MenuNotificationsComponent implements OnInit {

  constructor( public appService: AppService,
    public popoverController: PopoverController,
    private notificationsService:NotificationsService,
    public router: Router
    ) { }

    goToNotificationsHistory(){
      this.popoverController.dismiss();
      this.router.navigate(["/notifications-history"]);
    }

  ngOnInit() {}

  close() {
    this.popoverController.dismiss();
  }

  markAsReaded(notification: Notification){
    this.notificationsService.update(this.appService.currentUser.id, notification.id, { status: NotificationStatus.Readed });
  }

  async openOrderDetailPage(notification: Notification) {
    this.router.navigate(['order-detail/' + notification.idOrder + "&" + notification.idStore]);
    this.popoverController.dismiss();

    // let modal = await this.popoverController.create({
    //   component: OrderDetailPage,
    //   componentProps: { id: notification.idOrder, idStore: notification.idStore },
    //   cssClass: 'cs-popovers'
    // });

    // modal.onDidDismiss()
    //   .then((data) => {
    //     const updated = data['data'];
    //   });

    // modal.present();
  }
}
