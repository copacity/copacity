import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/cs-services/app.service';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
})
export class PrivacyPolicyPage implements OnInit {
  constructor(public popoverController: PopoverController, public appService: AppService) { }

  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }
}
