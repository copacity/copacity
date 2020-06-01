import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';

@Component({
  selector: 'app-terms-service',
  templateUrl: './terms-service.page.html',
  styleUrls: ['./terms-service.page.scss'],
})
export class TermsServicePage implements OnInit {

  constructor(public popoverController: PopoverController, public appService: AppService) { }

  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }
}
