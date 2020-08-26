import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';

@Component({
  selector: 'app-returns-policy',
  templateUrl: './returns-policy.page.html',
  styleUrls: ['./returns-policy.page.scss'],
})
export class ReturnsPolicyPage implements OnInit {

  returnsPoliciy: string;

  constructor(public popoverController: PopoverController, 
    public appService: AppService,
    private navparams: NavParams) {
      this.returnsPoliciy = this.navparams.data.returnsPolicy;
     }

  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }
}
