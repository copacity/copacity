import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss'],
})
export class SubscriptionPlansComponent implements OnInit {

  constructor(public popoverController: PopoverController,
    public appService: AppService
    ) { }

  ngOnInit() {}

  close() {
    this.popoverController.dismiss();
  }

}
